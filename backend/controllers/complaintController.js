const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { sendNewComplaintToAdmins, sendStatusUpdateToCitizen } = require('../utils/emailService');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
exports.createComplaint = async (req, res) => {
  try {
    const { issueType, description, address, latitude, longitude, image } = req.body;

    const complaint = await Complaint.create({
      citizen: req.user.id,
      issueType,
      description,
      location: {
        address,
        latitude,
        longitude,
      },
      image: image || undefined,
      // assignedDepartment intentionally omitted - set by admin/officer later
    });

    const populatedComplaint = await complaint.populate('citizen', 'name email phone profileImage');

    // Create notification for admins about new complaint
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('complaintCreated', {
        complaint: populatedComplaint,
      });

      io.to(`user_${req.user.id}`).emit('complaintCreated', {
        complaint: populatedComplaint,
      });

      // Find all admin users
      const adminUsers = await User.find({ 
        role: { $in: ['admin', 'department_officer'] },
        isActive: true 
      }).select('email');

      // Send notification to each admin
      for (const admin of adminUsers) {
        await createNotification(io, {
          recipient: admin._id,
          type: 'complaint_created',
          title: 'New Complaint Filed',
          message: `${populatedComplaint.citizen.name} filed a ${issueType} complaint at ${address}`,
          relatedComplaint: complaint._id,
          priority: 'medium',
          actionUrl: `/admin/complaints/${complaint._id}`
        });
      }
    }

    // Email admins about new complaint (non-blocking)
    const adminUsersForEmail = await User.find({ 
      role: { $in: ['admin', 'department_officer'] },
      isActive: true 
    }).select('email').lean();
    const adminEmails = adminUsersForEmail.map((u) => u.email).filter(Boolean);
    if (adminEmails.length > 0) {
      sendNewComplaintToAdmins(adminEmails, {
        citizenName: populatedComplaint.citizen.name,
        issueType,
        address: address || populatedComplaint.location?.address || 'N/A',
        complaintId: complaint.complaintId,
        complaintMongoId: complaint._id.toString(),
      }).catch((err) => console.error('Email to admins failed:', err.message));
    }

    res.status(201).json({
      success: true,
      complaint: populatedComplaint,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, issueType, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (issueType) query.issueType = issueType;

    // If user is citizen, only show their complaints
    if (req.user.role === 'citizen') {
      query.citizen = req.user.id;
    }

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(query)
      .populate('citizen', 'name email phone profileImage')
      .populate('assignedOfficer', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Complaint.countDocuments(query);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email phone address city profileImage')
      .populate('assignedOfficer', 'name email phone');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check if user is authorized to view this complaint
    if (
      req.user.role === 'citizen' &&
      complaint.citizen._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this complaint',
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin/Department Officer)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, assignedDepartment, assignedOfficer, resolutionNotes, priority } =
      req.body;

    let updateData = {};
    if (status) updateData.status = status;
    if (assignedDepartment) updateData.assignedDepartment = assignedDepartment;
    if (assignedOfficer) updateData.assignedOfficer = assignedOfficer;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    if (priority) updateData.priority = priority;
    if (status === 'resolved') {
      updateData.completedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('citizen', 'name email phone profileImage')
      .populate('assignedOfficer', 'name email phone');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Create notifications for status updates
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('complaintUpdated', {
        complaint,
      });
      io.to(`user_${complaint.citizen._id.toString()}`).emit('complaintUpdated', {
        complaint,
      });

      // Notify citizen about status change
      if (status === 'in_progress') {
        await createNotification(io, {
          recipient: complaint.citizen._id,
          type: 'complaint_updated',
          title: 'Complaint In Progress',
          message: `Your complaint about ${complaint.issueType} is now being addressed`,
          relatedComplaint: complaint._id,
          priority: 'medium',
          actionUrl: `/complaints/${complaint._id}`
        });
      } else if (status === 'resolved') {
        await createNotification(io, {
          recipient: complaint.citizen._id,
          type: 'complaint_resolved',
          title: 'Complaint Resolved',
          message: `Your complaint about ${complaint.issueType} has been resolved`,
          relatedComplaint: complaint._id,
          priority: 'high',
          actionUrl: `/complaints/${complaint._id}`
        });
      }

      // Notify assigned officer if assigned
      if (assignedOfficer && status === 'in_progress') {
        await createNotification(io, {
          recipient: assignedOfficer,
          type: 'complaint_assigned',
          title: 'New Complaint Assigned',
          message: `You have been assigned a ${complaint.issueType} complaint`,
          relatedComplaint: complaint._id,
          priority: 'high',
          actionUrl: `/complaints/${complaint._id}`
        });
      }
    }

    // Email citizen about status update (non-blocking)
    if (status && complaint.citizen && complaint.citizen.email) {
      sendStatusUpdateToCitizen(complaint.citizen.email, {
        citizenName: complaint.citizen.name,
        complaintId: complaint.complaintId,
        complaintMongoId: complaint._id.toString(),
        issueType: complaint.issueType,
        status,
        resolutionNotes: resolutionNotes || '',
      }).catch((err) => console.error('Email to citizen failed:', err.message));
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add rating to complaint
// @route   PUT /api/complaints/:id/rate
// @access  Private (Citizen)
exports.rateComplaint = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this complaint',
      });
    }

    complaint.ratings = { rating, feedback };
    await complaint.save();

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get complaint status summary (for current user: citizen = own, admin = all)
// @route   GET /api/complaints/stats/summary
// @access  Private
exports.getStatsSummary = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'citizen') {
      query.citizen = req.user.id;
    }
    const total = await Complaint.countDocuments(query);
    const pending = await Complaint.countDocuments({ ...query, status: 'pending' });
    const inProgress = await Complaint.countDocuments({ ...query, status: 'in_progress' });
    const resolved = await Complaint.countDocuments({ ...query, status: 'resolved' });
    const rejected = await Complaint.countDocuments({ ...query, status: 'rejected' });

    res.status(200).json({
      success: true,
      summary: {
        total,
        pending,
        inProgress,
        resolved,
        rejected,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats/overview
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'pending' });
    const inProgress = await Complaint.countDocuments({ status: 'in_progress' });
    const resolved = await Complaint.countDocuments({ status: 'resolved' });
    const rejected = await Complaint.countDocuments({ status: 'rejected' });

    const issueTypeStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$issueType',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalComplaints,
        pending,
        inProgress,
        resolved,
        rejected,
        issueTypeStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin/Citizen)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check if user is authorized
    if (
      req.user.role === 'citizen' &&
      complaint.citizen.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this complaint',
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Complaint deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
