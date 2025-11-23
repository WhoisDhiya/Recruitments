module.exports = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'ERROR',
            message: 'Accès réservé aux administrateurs'
        });
    }
    next();
};

