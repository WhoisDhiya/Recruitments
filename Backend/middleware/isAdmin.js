module.exports = (req, res, next) => {
    // Debug: log user info
    console.log('🔍 isAdmin middleware - req.user:', req.user);
    
    if (!req.user) {
        console.log('❌ isAdmin: req.user is missing');
        return res.status(403).json({
            status: 'ERROR',
            message: 'Accès réservé aux administrateurs - Utilisateur non authentifié'
        });
    }
    
    if (req.user.role !== 'admin') {
        console.log(`❌ isAdmin: User role is "${req.user.role}", expected "admin"`);
        return res.status(403).json({
            status: 'ERROR',
            message: `Accès réservé aux administrateurs - Rôle actuel: ${req.user.role || 'non défini'}`
        });
    }
    
    console.log('✅ isAdmin: Access granted');
    next();
};

