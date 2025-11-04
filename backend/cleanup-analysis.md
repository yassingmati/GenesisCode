# 🧹 Analyse et Plan de Nettoyage MongoDB

## 📊 Collections Actuelles (21 total)

### ✅ **COLLECTIONS UTILISÉES** (à conserver)

| Collection | Documents | Usage | Statut |
|------------|-----------|-------|--------|
| `users` | 18 | Utilisateurs principaux | ✅ **ACTIF** |
| `admins` | 2 | Administrateurs | ✅ **ACTIF** |
| `categories` | 7 | Catégories de cours | ✅ **ACTIF** |
| `paths` | 40 | Parcours d'apprentissage | ✅ **ACTIF** |
| `levels` | 138 | Niveaux de cours | ✅ **ACTIF** |
| `exercises` | 394 | Exercices | ✅ **ACTIF** |
| `categoryplans` | 2 | Plans de paiement par catégorie | ✅ **ACTIF** |
| `userprogresses` | 122 | Progrès des utilisateurs | ✅ **ACTIF** |
| `userlevelprogresses` | 3 | Progrès par niveau | ✅ **ACTIF** |
| `parentchildren` | 4 | Relations parent-enfant | ✅ **ACTIF** |
| `courseaccesses` | 13 | Accès aux cours (ancien système) | ⚠️ **TRANSITION** |

### ❌ **COLLECTIONS INUTILISÉES** (à supprimer)

| Collection | Documents | Raison | Action |
|------------|-----------|--------|--------|
| `userdrafts` | 0 | Non utilisée dans le code | 🗑️ **SUPPRIMER** |
| `sharedcalendars` | 0 | Fonctionnalité non implémentée | 🗑️ **SUPPRIMER** |
| `categoryaccesses` | 0 | Remplacée par le nouveau système | 🗑️ **SUPPRIMER** |
| `rewards` | 0 | Système de récompenses non utilisé | 🗑️ **SUPPRIMER** |
| `useractivities` | 0 | Tracking d'activité non utilisé | 🗑️ **SUPPRIMER** |
| `subscriptions` | 0 | Ancien système d'abonnement | 🗑️ **SUPPRIMER** |
| `plans` | 7 | Ancien système de plans | 🗑️ **SUPPRIMER** |
| `payments` | 0 | Ancien système de paiement | 🗑️ **SUPPRIMER** |
| `pathplans` | 16 | Plans par parcours (obsolète) | 🗑️ **SUPPRIMER** |
| `progresses` | 0 | Doublon de userprogresses | 🗑️ **SUPPRIMER** |

## 🎯 **Plan de Nettoyage**

### Phase 1: Collections Vides (Sûres)
- `userdrafts` (0 docs)
- `sharedcalendars` (0 docs) 
- `categoryaccesses` (0 docs)
- `rewards` (0 docs)
- `useractivities` (0 docs)
- `subscriptions` (0 docs)
- `payments` (0 docs)
- `progresses` (0 docs)

### Phase 2: Collections avec Données (Vérification)
- `plans` (7 docs) - Ancien système
- `pathplans` (16 docs) - Plans par parcours obsolètes

### Phase 3: Migration des Données Importantes
- `courseaccesses` (13 docs) - Migrer vers le nouveau système si nécessaire

## 📈 **Bénéfices du Nettoyage**

- **Réduction de 10 collections** (21 → 11)
- **Simplification de la base de données**
- **Amélioration des performances**
- **Réduction de la confusion dans le code**
- **Maintenance plus facile**

## ⚠️ **Précautions**

1. **Sauvegarde complète** avant nettoyage
2. **Vérification des références** dans le code
3. **Test en environnement de développement** d'abord
4. **Migration des données importantes** si nécessaire



