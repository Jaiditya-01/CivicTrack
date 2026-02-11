const Complaint = require('../models/Complaint');
const User = require('../models/User');

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

    const populatedComplaint = await complaint.populate('citizen', 'name email phone');

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
      .populate('citizen', 'name email phone')
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
      .populate('citizen', 'name email phone address city')
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
      .populate('citizen', 'name email phone')
      .populate('assignedOfficer', 'name email phone');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
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
