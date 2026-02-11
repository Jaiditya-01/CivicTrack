const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      default: null,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issueType: {
      type: String,
      enum: ['pothole', 'garbage', 'streetlight', 'water_leakage', 'public_safety', 'other'],
      required: [true, 'Please select an issue type'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      minlength: 10,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedDepartment: {
      type: String,
      default: undefined,
      validate: function (v) {
        if (v == null || v === '') return true;
        return ['roads', 'water', 'electricity', 'sanitation', 'public_safety'].includes(v);
      },
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    ratings: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      feedback: {
        type: String,
        default: null,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate complaint ID
complaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `CT${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Ensure assignedDepartment is never null (enum rejects null); unset it so validation is skipped
complaintSchema.pre('save', function (next) {
  if (this.assignedDepartment === null || this.assignedDepartment === '') {
    this.assignedDepartment = undefined;
  }
  next();
});

complaintSchema.pre('validate', function (next) {
  if (this.assignedDepartment === null || this.assignedDepartment === '') {
    this.assignedDepartment = undefined;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
