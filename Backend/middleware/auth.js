const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'ma_clé_secrète_ultra_sécurisée';

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ status: 'ERROR', message: 'Accès non autorisé' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ status: 'ERROR', message: 'Token invalide ou expiré' });
    }
};
