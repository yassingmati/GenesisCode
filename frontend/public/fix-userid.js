// Script de nettoyage du localStorage pour corriger le problème de userId
// À exécuter dans la console du navigateur

console.log('🔧 Nettoyage du localStorage...');

// 1. Vérifier l'état actuel
console.log('État actuel:');
console.log('- userId:', localStorage.getItem('userId'));
console.log('- user:', localStorage.getItem('user'));
console.log('- token:', localStorage.getItem('token'));

// 2. Récupérer les vraies données utilisateur
const userDataStr = localStorage.getItem('user');
if (userDataStr) {
    try {
        const userData = JSON.parse(userDataStr);
        const realUserId = userData._id || userData.id;

        console.log('\n✅ Données utilisateur trouvées:');
        console.log('- Email:', userData.email);
        console.log('- MongoDB ID:', realUserId);

        // 3. Corriger le userId
        if (realUserId) {
            localStorage.setItem('userId', realUserId);
            console.log('\n✅ userId corrigé:', realUserId);
        } else {
            console.error('\n❌ Impossible de trouver l\'ID MongoDB dans les données utilisateur');
        }
    } catch (e) {
        console.error('\n❌ Erreur lors du parsing des données utilisateur:', e);
    }
} else {
    console.log('\n⚠️ Aucune donnée utilisateur trouvée. Vous devez vous reconnecter.');
    console.log('\nPour nettoyer complètement:');
    console.log('localStorage.clear();');
    console.log('window.location.href = "/login";');
}

console.log('\n✅ Nettoyage terminé!');
console.log('Rechargez la page pour voir les changements.');
