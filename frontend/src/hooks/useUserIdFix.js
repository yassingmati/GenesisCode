import { useEffect } from 'react';

/**
 * Hook pour corriger automatiquement le userId dans localStorage
 * Corrige les faux userId générés par l'ancien code (user-timestamp-random)
 * et s'assure que le userId correspond au MongoDB ID de l'utilisateur
 */
export function useUserIdFix() {
    useEffect(() => {
        const fixUserId = () => {
            const userId = localStorage.getItem('userId');
            const userDataStr = localStorage.getItem('user');

            // Cas 1: userId est un faux ID (commence par "user-")
            if (userId && userId.startsWith('user-')) {
                console.warn('[useUserIdFix] ⚠️ Faux userId détecté:', userId);

                // Essayer de récupérer le vrai ID depuis les données utilisateur
                if (userDataStr) {
                    try {
                        const userData = JSON.parse(userDataStr);
                        const realUserId = userData._id || userData.id;

                        if (realUserId) {
                            console.log('[useUserIdFix] ✅ Correction du userId:', realUserId);
                            localStorage.setItem('userId', realUserId);
                        } else {
                            console.error('[useUserIdFix] ❌ Impossible de trouver l\'ID MongoDB');
                            localStorage.removeItem('userId');
                        }
                    } catch (e) {
                        console.error('[useUserIdFix] ❌ Erreur lors du parsing:', e);
                        localStorage.removeItem('userId');
                    }
                } else {
                    // Pas de données utilisateur, supprimer le faux ID
                    console.warn('[useUserIdFix] 🗑️ Suppression du faux userId (pas de données utilisateur)');
                    localStorage.removeItem('userId');
                }
            }

            // Cas 2: Pas de userId mais données utilisateur présentes
            else if (!userId && userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    const realUserId = userData._id || userData.id;

                    if (realUserId) {
                        console.log('[useUserIdFix] ✅ Définition du userId manquant:', realUserId);
                        localStorage.setItem('userId', realUserId);
                    }
                } catch (e) {
                    console.error('[useUserIdFix] ❌ Erreur lors du parsing:', e);
                }
            }

            // Cas 3: userId existe et semble valide (ObjectId MongoDB)
            else if (userId && userId.length === 24 && /^[0-9a-f]{24}$/i.test(userId)) {
                // Vérifier qu'il correspond bien aux données utilisateur
                if (userDataStr) {
                    try {
                        const userData = JSON.parse(userDataStr);
                        const realUserId = userData._id || userData.id;

                        if (realUserId && realUserId !== userId) {
                            console.warn('[useUserIdFix] ⚠️ userId ne correspond pas aux données utilisateur');
                            console.log('[useUserIdFix] ✅ Correction:', realUserId);
                            localStorage.setItem('userId', realUserId);
                        }
                    } catch (e) {
                        console.error('[useUserIdFix] ❌ Erreur lors de la vérification:', e);
                    }
                }
            }
        };

        // Exécuter au montage du composant
        fixUserId();

        // Exécuter aussi quand le localStorage change (dans un autre onglet)
        window.addEventListener('storage', fixUserId);

        return () => window.removeEventListener('storage', fixUserId);
    }, []);
}

export default useUserIdFix;
