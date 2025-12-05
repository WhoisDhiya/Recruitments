// Script de diagnostic pour vérifier la configuration Stripe
require('dotenv').config();

console.log('\n🔍 DIAGNOSTIC DE CONFIGURATION STRIPE\n');
console.log('=' .repeat(50));

// Vérifier si dotenv est chargé
console.log('\n1. Vérification de dotenv:');
console.log('   ✅ dotenv chargé');

// Vérifier les variables d'environnement
console.log('\n2. Variables d\'environnement:');
console.log('   STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 
    `${process.env.STRIPE_SECRET_KEY.substring(0, 10)}... (${process.env.STRIPE_SECRET_KEY.length} caractères)` : 
    '❌ NON DÉFINIE');
console.log('   DISABLE_PAYMENTS:', process.env.DISABLE_PAYMENTS || 'non défini (par défaut: false)');
console.log('   CLIENT_URL:', process.env.CLIENT_URL || 'non défini');

// Vérifier la logique de configuration
console.log('\n3. Logique de configuration:');
const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
const paymentsDisabled = process.env.DISABLE_PAYMENTS === 'true' || !hasStripeKey;

console.log('   hasStripeKey:', hasStripeKey);
console.log('   paymentsDisabled:', paymentsDisabled);

if (paymentsDisabled) {
    const reason = !hasStripeKey ? 'STRIPE_SECRET_KEY is not set' : 'DISABLE_PAYMENTS=true';
    console.log('   ❌ Payments disabled:', reason);
} else {
    console.log('   ✅ Payments enabled');
}

// Tester l'initialisation de Stripe
console.log('\n4. Test d\'initialisation Stripe:');
if (hasStripeKey && !paymentsDisabled) {
    try {
        const Stripe = require('stripe');
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        console.log('   ✅ Stripe initialisé avec succès');
        
        // Vérifier le format de la clé
        if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
            console.log('   ✅ Mode Test détecté (sk_test_)');
        } else if (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
            console.log('   ⚠️  Mode Production détecté (sk_live_)');
        } else {
            console.log('   ⚠️  Format de clé inattendu');
        }
    } catch (err) {
        console.log('   ❌ Erreur lors de l\'initialisation:', err.message);
    }
} else {
    console.log('   ⏭️  Test ignoré (Stripe non configuré)');
}

console.log('\n' + '='.repeat(50));
console.log('\n📋 RÉSUMÉ:\n');

if (!hasStripeKey) {
    console.log('❌ PROBLÈME: STRIPE_SECRET_KEY n\'est pas défini dans le fichier .env');
    console.log('\n💡 SOLUTION:');
    console.log('   1. Créez ou modifiez le fichier .env dans le dossier Backend');
    console.log('   2. Ajoutez la ligne: STRIPE_SECRET_KEY=sk_test_votre_cle_ici');
    console.log('   3. Redémarrez le serveur backend');
} else if (paymentsDisabled && process.env.DISABLE_PAYMENTS === 'true') {
    console.log('⚠️  ATTENTION: DISABLE_PAYMENTS est défini à "true"');
    console.log('\n💡 SOLUTION:');
    console.log('   Retirez ou commentez la ligne DISABLE_PAYMENTS=true dans le fichier .env');
} else if (!paymentsDisabled) {
    console.log('✅ Configuration correcte! Stripe devrait fonctionner.');
} else {
    console.log('❓ Configuration inattendue. Vérifiez les logs ci-dessus.');
}

console.log('\n');

