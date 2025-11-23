const express = require('express');
const { body, param, validationResult } = require('express-validator');
const offerController = require('../controllers/offerController');
const router = express.Router();

// Middleware de validation
const createOfferValidation = [
  param('recruiterId').isInt({ gt: 0 }).withMessage('recruiterId invalide'),
  body('title')
    .trim()
    .notEmpty().withMessage('title est obligatoire')
    .isLength({ max: 255 }).withMessage('title trop long (max 255)'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('description trop longue (max 2000)'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('location trop longue (max 255)'),
  body('type')
    .optional()
    .isIn(['CDI', 'CDD', 'Stage', 'Freelance', 'Part-time']).withMessage('type invalide'),
  body('salary')
    .optional()
    .isNumeric().withMessage('salary doit être un nombre')
    .custom(value => value >= 0).withMessage('salary doit être positif'),
  // Handler pour récupérer les erreurs de validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'ERROR', message: 'Validation échouée', errors: errors.array() });
    }
    next();
  }
];

// Route pour créer une offre
router.post('/recruiters/:recruiterId/offers', createOfferValidation, offerController.createOfferForRecruiter);

router.get('/recruiters/:recruiterId/offers', offerController.getOffersByRecruiter);
router.get('/offers/:id', offerController.getOfferById);
router.put('/offers/:id', offerController.updateOffer);
router.delete('/offers/:id', offerController.deleteOffer);

router.get('/offers/:id/applications', offerController.getApplicationsByOffer);




module.exports = router;
