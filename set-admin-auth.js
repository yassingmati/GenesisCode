// Script à exécuter dans la console du navigateur sur http://localhost:3000
// Copier-coller tout ce code dans la console et appuyer sur Entrée

(async function () {
    console.log('🔐 Configuration de l\'authentification admin...');

    // Token valide obtenu du backend
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGY2NGU3NzA4ODRlZDMyNTg4YjExNiIsImlhdCI6MTc2NTg4MzE0MywiZXhwIjoxNzY1OTY5NTQzfQ.OL4lmUc_toc1Z8L83kd9xyGCGqBEM2edOcFbV97nf8E';

    // Données admin correspondantes
    const adminData = {
        id: '690f64e770884ed32588b116',
        email: 'admin2@test.com'
    };

    // Sauvegarder dans localStorage
    localStorage.setItem('adminToken', adminToken);
    localStorage.setItem('adminData', JSON.stringify(adminData));

    console.log('✅ Token admin sauvegardé');
    console.log('✅ Données admin sauvegardées');
    console.log('📧 Email:', adminData.email);
    console.log('\n🔄 Rechargez la page pour appliquer les changements');

    // Optionnel : recharger automatiquement après 2 secondes
    setTimeout(() => {
        console.log('🔄 Rechargement automatique...');
        window.location.reload();
    }, 2000);
})();
