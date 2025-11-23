const express = require('express');
const { body, param, validationResult } = require('express-validator');
const offerController = require('../controllers/offerController');
const router = express.Router();

// <CHANGE> Updated validation to separate Offer fields from Requirement fields
const createOfferValidation = [
  param('recruiterId').isInt({ gt: 0 }).withMessage('recruiterId invalide'),
  
  // OFFER fields
  body('title')
    .trim()
    .notEmpty().withMessage('title est obligatoire')
    .isLength({ max: 255 }).withMessage('title trop long (max 255)'),
  body('date_offer')
    .notEmpty().withMessage('date_offer est obligatoire')
    .custom((value) => {
      // Accept both YYYY-MM-DD and ISO8601 formats
      const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
      if (!dateRegex.test(value)) {
        throw new Error('date_offer format invalide (attendu: YYYY-MM-DD)');
      }
      return true;
    }),
  body('date_expiration')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value) return true; // Optional field
      // Accept both YYYY-MM-DD and ISO8601 formats
      const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
      if (!dateRegex.test(value)) {
        throw new Error('date_expiration format invalide (attendu: YYYY-MM-DD)');
      }
      return true;
    }),

  // REQUIREMENT fields
  body('jobTitle')
    .trim()
    .notEmpty().withMessage('jobTitle est obligatoire')
    .isLength({ max: 255 }).withMessage('jobTitle trop long (max 255)'),
  body('tags')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('tags trop long (max 500)'),
  body('jobRole')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('jobRole trop long (max 255)'),
  body('minSalary')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      return !isNaN(parseFloat(value)) && isFinite(value);
    }).withMessage('minSalary doit être un nombre'),
  body('maxSalary')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      return !isNaN(parseFloat(value)) && isFinite(value);
    }).withMessage('maxSalary doit être un nombre'),
  body('salaryType')
    .optional()
    .isIn(['Yearly', 'Monthly', 'Hourly']).withMessage('salaryType invalide'),
  body('education')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('education trop long (max 100)'),
  body('experience')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('experience trop long (max 100)'),
  body('jobType')
    .optional()
    .isIn(['CDI', 'CDD', 'Stage', 'Freelance', 'Part-time']).withMessage('jobType invalide'),
  body('vacancies')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      return !isNaN(parseInt(value)) && isFinite(value);
    }).withMessage('vacancies doit être un nombre'),
  body('jobLevel')
    .optional()
    .isIn(['Junior', 'Mid-level', 'Senior']).withMessage('jobLevel invalide'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('description trop longue (max 2000)'),
  body('responsibilities')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('responsibilities trop longue (max 2000)'),

  // Handler pour récupérer les erreurs de validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'ERROR', message: 'Validation échouée', errors: errors.array() });
    }
    next();
  }
];

// <CHANGE> Route sends both offer and requirement data to controller
router.post('/recruiters/:recruiterId/offers', createOfferValidation, offerController.createOfferForRecruiter);

// Get all offers
router.get('/offers', offerController.getAllOffers);
router.get('/recruiters/:recruiterId/offers', offerController.getOffersByRecruiter);
router.get('/offers/:id', offerController.getOfferById);
router.put('/offers/:id', offerController.updateOffer);
router.delete('/offers/:id', offerController.deleteOffer);

router.get('/offers/:id/applications', offerController.getApplicationsByOffer);

module.exports = router;