const express = require('express');
const router = express.Router();
const appController = require('../controllers/applicationController');
const auth = require('../middleware/auth'); // importer ton middleware JWT

// POST - Postuler (avec JWT)
router.post('/', auth, appController.createApplication);

// Plus tard :
 router.get('/:id', auth, appController.getApplicationById);
 router.put('/:id/status', auth, appController.updateApplicationStatus);
 router.delete('/:id', auth, appController.deleteApplication);

module.exports = router;
