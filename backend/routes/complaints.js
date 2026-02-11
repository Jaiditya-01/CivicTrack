const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  getComplaint,
  updateComplaintStatus,
  rateComplaint,
  getStats,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('citizen'), createComplaint);
router.get('/', protect, getAllComplaints);
router.get('/stats/overview', protect, authorize('admin', 'department_officer'), getStats);
router.get('/:id', protect, getComplaint);
router.put('/:id/status', protect, authorize('admin', 'department_officer'), updateComplaintStatus);
router.put('/:id/rate', protect, authorize('citizen'), rateComplaint);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
