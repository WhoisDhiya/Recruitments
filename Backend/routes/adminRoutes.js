const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const admin = require('../controllers/adminController');

// All routes protected by JWT and admin role
router.use(auth, isAdmin);

// Users
router.get('/users', admin.getUsers);
router.get('/users/:id', admin.getUserById);
router.put('/users/:id/role', admin.updateUserRole);
router.delete('/users/:id', admin.deleteUser);

// Candidates
router.get('/candidates', admin.getCandidates);
router.get('/candidates/:id', admin.getCandidateById);
router.delete('/candidates/:id', admin.deleteCandidate);

// Recruiters
router.get('/recruiters', admin.getRecruiters);
router.get('/recruiters/:id', admin.getRecruiterById);
router.delete('/recruiters/:id', admin.deleteRecruiter);

// Offers
router.get('/offers', admin.getOffers);
router.get('/offers/:id', admin.getOfferById);
router.delete('/offers/:id', admin.deleteOffer);

// Applications
router.get('/applications', admin.getApplications);
router.put('/applications/:id/status', admin.updateApplicationStatus);
router.delete('/applications/:id', admin.deleteApplication);

// Notifications
router.get('/notifications', admin.getNotifications);
router.delete('/notifications/:id', admin.deleteNotification);

// Stats
router.get('/stats', admin.getStats);

module.exports = router;


