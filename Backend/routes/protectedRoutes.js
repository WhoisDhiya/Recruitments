const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // import du middleware

router.get('/dashboard', auth, (req, res) => {
    res.json({ message: `Bienvenue ${req.user.email}` });
});

module.exports = router;
