const User = require('../models/User');

const jwt = require('jsonwebtoken');

const crypto = require('crypto');

const { sendPasswordResetEmail, isEmailEnabled } = require('../utils/emailService');



const generateToken = (id, role) => {

  return jwt.sign({ id, role }, process.env.JWT_SECRET, {

    expiresIn: process.env.JWT_EXPIRE,

  });

};



function hashResetToken(token) {

  return crypto.createHash('sha256').update(String(token)).digest('hex');

}



// @desc    Register user

// @route   POST /api/auth/register

// @access  Public

exports.register = async (req, res) => {

  try {

    const { name, email, phone, password, role, department, address, city } = req.body;



    // Check if user exists

    let user = await User.findOne({ email });

    if (user) {

      return res.status(400).json({

        success: false,

        message: 'User already exists',

      });

    }



    // Build user data

    const userData = {

      name,

      email,

      phone,

      password,

      role: role || 'citizen',

      address,

      city,

    };



    // Only set department if provided to avoid invalid enum/null issues

    if (department) {

      userData.department = department;

    }



    // Create user

    user = await User.create(userData);



    const token = generateToken(user._id, user.role);



    res.status(201).json({

      success: true,

      token,

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

      },

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



// @desc    Login user

// @route   POST /api/auth/login

// @access  Public

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;



    // Validate email and password

    if (!email || !password) {

      return res.status(400).json({

        success: false,

        message: 'Please provide email and password',

      });

    }



    // Check for user

    const user = await User.findOne({ email }).select('+password');



    if (!user) {

      return res.status(401).json({

        success: false,

        message: 'Invalid credentials',

      });

    }



    // Check if password matches

    const isMatch = await user.comparePassword(password);



    if (!isMatch) {

      return res.status(401).json({

        success: false,

        message: 'Invalid credentials',

      });

    }



    const token = generateToken(user._id, user.role);



    res.status(200).json({

      success: true,

      token,

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        phone: user.phone,

      },

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



// @desc    Get current logged in user

// @route   GET /api/auth/me

// @access  Private

exports.getMe = async (req, res) => {

  try {

    const user = await User.findById(req.user.id);



    res.status(200).json({

      success: true,

      user,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



// @desc    Update user profile

// @route   PUT /api/auth/profile

// @access  Private

exports.updateProfile = async (req, res) => {

  try {

    const { name, phone, address, city, profileImage } = req.body;

    const updates = { name, phone, address, city };

    if (profileImage !== undefined) updates.profileImage = profileImage;



    const user = await User.findByIdAndUpdate(

      req.user.id,

      updates,

      { new: true, runValidators: true }

    );



    res.status(200).json({

      success: true,

      user,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    if (!email) {

      return res.status(400).json({

        success: false,

        message: 'Please provide email',

      });

    }



    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+resetPasswordTokenHash');

    const RESET_EXPIRES_MINUTES = parseInt(process.env.RESET_PASSWORD_EXPIRES_MINUTES || '15', 10);

    const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';

    if (user) {

      const rawToken = crypto.randomBytes(32).toString('hex');

      user.resetPasswordTokenHash = hashResetToken(rawToken);

      user.resetPasswordExpiresAt = new Date(Date.now() + RESET_EXPIRES_MINUTES * 60 * 1000);

      await user.save();

      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

      if (isEmailEnabled()) {

        try {

          await sendPasswordResetEmail(user.email, {

            name: user.name,

            resetUrl,

            expiresMinutes: RESET_EXPIRES_MINUTES,

          });

        } catch (err) {

          console.error('[CivicTrack] Password reset email failed:', err.message);

        }

      } else {

        console.warn(

          '[CivicTrack] Password reset: no email sent — SMTP not configured. Set MAIL_HOST, MAIL_USER, and MAIL_PASSWORD in backend/.env (see README). For local testing without Gmail, set NODE_ENV=development and MAIL_DEV=true; then open the preview URL printed in this console.'

        );

      }

    }



    res.status(200).json({

      success: true,

      message: 'If that email exists, a reset link has been sent',

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



exports.resetPassword = async (req, res) => {

  try {

    const { token } = req.params;

    const { password } = req.body;

    if (!token || !password) {

      return res.status(400).json({

        success: false,

        message: 'Please provide token and password',

      });

    }



    if (String(password).length < 6) {

      return res.status(400).json({

        success: false,

        message: 'Password must be at least 6 characters',

      });

    }



    const tokenHash = hashResetToken(token);

    const user = await User.findOne({

      resetPasswordTokenHash: tokenHash,

      resetPasswordExpiresAt: { $gt: new Date() },

    }).select('+password +resetPasswordTokenHash');



    if (!user) {

      return res.status(400).json({

        success: false,

        message: 'Invalid or expired reset token',

      });

    }



    user.password = password;

    user.resetPasswordTokenHash = null;

    user.resetPasswordExpiresAt = null;

    await user.save();



    res.status(200).json({

      success: true,

      message: 'Password reset successful',

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



// @desc    Update password

// @route   PUT /api/auth/password

// @access  Private

exports.updatePassword = async (req, res) => {

  try {

    const { currentPassword, newPassword } = req.body;



    if (!currentPassword || !newPassword) {

      return res.status(400).json({

        success: false,

        message: 'Please provide current password and new password',

      });

    }



    if (newPassword.length < 6) {

      return res.status(400).json({

        success: false,

        message: 'New password must be at least 6 characters',

      });

    }



    const user = await User.findById(req.user.id).select('+password');

    if (!user) {

      return res.status(404).json({ success: false, message: 'User not found' });

    }



    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {

      return res.status(401).json({

        success: false,

        message: 'Current password is incorrect',

      });

    }



    user.password = newPassword;

    await user.save();



    res.status(200).json({

      success: true,

      message: 'Password updated successfully',

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



// @desc    Delete user account

// @route   DELETE /api/auth/account

// @access  Private

exports.deleteAccount = async (req, res) => {

  try {

    await User.findByIdAndDelete(req.user.id);



    res.status(200).json({

      success: true,

      message: 'Account deleted successfully',

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

