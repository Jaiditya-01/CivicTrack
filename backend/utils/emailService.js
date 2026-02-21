const nodemailer = require('nodemailer');

// Create transporter from env (disabled if SMTP not configured)
let transporter = null;
let etherealTestAccount = null;

function isDevInbox() {
  return process.env.MAIL_DEV === 'true' || process.env.MAIL_DEV === '1';
}

async function getTransporter() {
  if (transporter) return transporter;

  // Development: use Ethereal fake inbox so you can VIEW emails in browser
  if (isDevInbox()) {
    if (!etherealTestAccount) {
      etherealTestAccount = await nodemailer.createTestAccount();
      console.log('[Mail] Ethereal dev inbox ready. Preview URLs will be printed below for each email.');
    }
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: etherealTestAccount.user,
        pass: etherealTestAccount.pass,
      },
    });
    return transporter;
  }

  const host = process.env.MAIL_HOST;
  const port = process.env.MAIL_PORT;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASSWORD;
  if (!host || !user || !pass) {
    return null;
  }
  const portNum = parseInt(port || '587', 10);
  transporter = nodemailer.createTransport({
    host: host,
    port: portNum,
    secure: process.env.MAIL_SECURE === 'true',
    auth: { user, pass },
    // Gmail on 587 uses STARTTLS
    ...(host === 'smtp.gmail.com' && portNum === 587 && { tls: { rejectUnauthorized: true } }),
  });
  return transporter;
}

function isEmailEnabled() {
  if (isDevInbox()) return true;
  return !!(process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASSWORD);
}

function getFromAddress() {
  return process.env.MAIL_FROM || process.env.MAIL_USER || 'noreply@civictrack.com';
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
}

/**
 * Send email to admins when a citizen creates a new complaint
 * @param {string[]} adminEmails - Array of admin/department officer email addresses
 * @param {object} payload - { citizenName, issueType, address, complaintId, complaintMongoId }
 */
async function sendNewComplaintToAdmins(adminEmails, payload) {
  if (!isEmailEnabled() || !adminEmails || adminEmails.length === 0) return;
  const trans = await getTransporter();
  if (!trans) return;

  const { citizenName, issueType, address, complaintId, complaintMongoId } = payload;
  const appUrl = getFrontendUrl();
  const complaintUrl = `${appUrl}/admin/complaints`; // or link to specific complaint if you have a route

  const html = `
    <h2>New complaint submitted</h2>
    <p>A citizen has filed a new complaint on CivicTrack.</p>
    <ul>
      <li><strong>Complaint ID:</strong> ${complaintId || complaintMongoId}</li>
      <li><strong>Citizen:</strong> ${citizenName}</li>
      <li><strong>Issue type:</strong> ${issueType}</li>
      <li><strong>Location:</strong> ${address}</li>
    </ul>
    <p><a href="${complaintUrl}">View complaints in dashboard</a></p>
    <p>— CivicTrack</p>
  `;

  try {
    const info = await trans.sendMail({
      from: getFromAddress(),
      to: adminEmails.join(', '),
      subject: `[CivicTrack] New complaint: ${issueType} at ${address}`,
      text: `New complaint from ${citizenName}: ${issueType} at ${address}. Complaint ID: ${complaintId || complaintMongoId}. View at ${complaintUrl}`,
      html,
    });
    if (isDevInbox() && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log('[Mail] Preview (new complaint to admins):', previewUrl);
    }
  } catch (err) {
    console.error('Email (new complaint to admins):', err.message);
  }
}

/**
 * Send email to citizen when admin updates complaint status
 * @param {string} citizenEmail
 * @param {object} payload - { citizenName, complaintId, issueType, status, resolutionNotes }
 */
async function sendStatusUpdateToCitizen(citizenEmail, payload) {
  if (!isEmailEnabled() || !citizenEmail) return;
  const trans = await getTransporter();
  if (!trans) return;

  const { citizenName, complaintId, issueType, status, resolutionNotes } = payload;
  const appUrl = getFrontendUrl();
  const complaintUrl = `${appUrl}/complaints/${payload.complaintMongoId || ''}`;

  const statusLabel = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
  }[status] || status;

  const html = `
    <h2>Complaint status update</h2>
    <p>Hello ${citizenName},</p>
    <p>Your complaint has been updated.</p>
    <ul>
      <li><strong>Complaint ID:</strong> ${complaintId}</li>
      <li><strong>Issue:</strong> ${issueType}</li>
      <li><strong>New status:</strong> ${statusLabel}</li>
      ${resolutionNotes ? `<li><strong>Note:</strong> ${resolutionNotes}</li>` : ''}
    </ul>
    <p><a href="${complaintUrl}">View your complaint</a></p>
    <p>— CivicTrack</p>
  `;

  try {
    const info = await trans.sendMail({
      from: getFromAddress(),
      to: citizenEmail,
      subject: `[CivicTrack] Complaint update: ${statusLabel} - ${issueType}`,
      text: `Your complaint (${complaintId}) is now ${statusLabel}. ${resolutionNotes ? `Note: ${resolutionNotes}` : ''} View at ${complaintUrl}`,
      html,
    });
    if (isDevInbox() && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log('[Mail] Preview (status update to citizen):', previewUrl);
    }
  } catch (err) {
    console.error('Email (status update to citizen):', err.message);
  }
}

module.exports = {
  isEmailEnabled,
  sendNewComplaintToAdmins,
  sendStatusUpdateToCitizen,
};
