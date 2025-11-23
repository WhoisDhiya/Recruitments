const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email et mot de passe sont requis'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ status: 'ERROR', message: 'Utilisateur non trouvé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'ERROR', message: 'Mot de passe incorrect' });
    }

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Connexion réussie',
      data: {
        user_id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ status: 'ERROR', message: 'Erreur lors de la connexion', error: error.message });
  }
};
