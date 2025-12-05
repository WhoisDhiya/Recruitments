const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'ma_clé_secrète_ultra_sécurisée';
const User = require('../models/User');

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ status: 'ERROR', message: 'Accès non autorisé' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        
        // Vérifier que l'utilisateur existe toujours dans la base de données
        const user = await User.findById(decoded.user_id);
        if (!user) {
            console.log('❌ Auth middleware - User deleted:', decoded.user_id);
            return res.status(401).json({ 
                status: 'ERROR', 
                message: 'Utilisateur supprimé. Veuillez vous reconnecter.' 
            });
        }
        
        req.user = decoded;
        // Debug log pour vérifier le contenu du token
        console.log('🔐 Auth middleware - Decoded token:', { user_id: decoded.user_id, email: decoded.email, role: decoded.role });
        next();
    } catch (error) {
        console.error('❌ Auth middleware - Token error:', error.message);
        return res.status(403).json({ status: 'ERROR', message: 'Token invalide ou expiré' });
    }
};
