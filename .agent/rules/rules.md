---
trigger: always_on
---

# Standards de Développement & Architecture - Projet Copro (V5)

## 1. Philosophie du Projet
Ce projet est une **Suite d'Applications** regroupant 4 outils distincts (Gestion, Carnet, Crédit, Vote) sous un même Dashboard unifié.
L'objectif est de fournir un code **robuste**, **typé** (via JSDoc), **testé** et **maintenable** par un non-expert.

## 2. Stack Technique
- **Build :** Vite + React 18 (JavaScript + SWC).
- **Style :** Tailwind CSS. Utiliser `clsx` ou `tailwind-merge` pour les classes dynamiques.
- **Routing :** React Router DOM (v6+). Architecture SPA avec routes définies.
- **Tests :** Vitest (Compatible Jest). Obligatoire pour toute logique de calcul.
- **Icônes :** Lucide-React.
- **State :** Context API + Hooks personnalisés (Pas de Redux).

## 3. Architecture des Dossiers (Modulaire)
L'application suit une architecture stricte par "Modules" pour isoler les fonctionnalités et éviter le code spaghetti.

src/
├── components/           # Composants UI PARTAGÉS (Boutons, Cards, Modales génériques)
├── hooks/                # Hooks PARTAGÉS (ex: useLocalStorage, useWindowSize)
├── utils/                # Fonctions utilitaires PARTAGÉES (dates, devises, PDF export)
├── modules/              # LE CŒUR DE L'APP (4 blocs distincts)
│   ├── gestion/          # Module "Gestion Copro" (Budget, Eau, Compta)
│   │   ├── components/   # Composants spécifiques à ce module
│   │   ├── hooks/        # Logique métier spécifique (ex: useBudget)
│   │   └── utils/        # Calculs spécifiques (ex: répartition charges)
│   ├── carnet/           # Module "Carnet d'entretien" & Annuaire
│   ├── credit/           # Module "Simulateur Crédit"
│   └── vote/             # Module "Vote AG"
├── pages/                # Pages principales (Dashboard, 404, Layout Général)
└── App.jsx               # Configuration du Router principal

## 4. Règles de Clean Code (Strictes)

### A. Composants (UI)
- **Taille Max :** Un composant ne doit pas dépasser **150 lignes**. Au-delà, il doit être découpé en sous-composants.
- **Zéro Logique Métier :** Les composants UI ne font que de l'affichage et de l'appel aux Hooks.
    - ❌ *Interdit :* `const total = data.reduce(...)` dans le JSX.
    - ✅ *Requis :* `const total = calculateTotal(data)` (fonction importée de `utils/`).

### B. Gestion des Données & Persistance
- **Isolation :** Aucun appel direct à `localStorage` dans les composants UI.
- **Pattern Hook :** L'accès aux données se fait uniquement via des Hooks personnalisés (ex: `useOwners`, `useBudget`).
    - *Pourquoi ?* Pour faciliter la future migration vers un Backend (Supabase) sans toucher à l'UI.

### C. Nommage & Documentation
- **Fonctions :** Verbe + Sujet (ex: `generatePdfReport`, `calculateTantiemes`).
- **Variables :** Explicites (ex: `isModalOpen` au lieu de `open`).
- **JSDoc :** OBLIGATOIRE pour toutes les fonctions exportées dans `/utils` et `/hooks`.
    Exemple :
    /**
     * Calcule la part à payer selon les tantièmes.
     * @param {number} amount - Montant total
     * @param {number} userShare - Tantièmes du copropriétaire
     * @returns {number} Montant dû
     */

## 5. Tests et Fiabilité (Vitest)
- **Règle d'or :** "Si ça calcule de l'argent, des tantièmes ou des votes, ça doit être testé."
- Chaque fichier `utils/*.js` contenant de la logique métier doit avoir son fichier `utils/*.test.js` correspondant.
- Les tests doivent couvrir les cas nominaux et les cas d'erreur.

## 6. Workflow IA
1. **Analyse :** Toujours lister les fichiers à créer avant de générer le code.
2. **Modularité :** Vérifier si le code appartient au module courant ou au dossier partagé (`src/components`).
3. **Implémentation :** Commencer par la logique pure (`utils`) et les tests, puis les Hooks, enfin l'UI.