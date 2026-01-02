---
trigger: always_on
---

# Standards de Développement & Architecture - Projet Copro (V6)

## 1. Philosophie du Projet
Ce projet est une **Suite d'Applications** regroupant 4 outils distincts (Gestion, Carnet, Crédit, Vote) sous un même Dashboard unifié.
L'objectif est de fournir un code **robuste**, **typé** (via JSDoc), **testé** et **maintenable** par un non-expert.

## 2. Stack Technique
- **Build :** Vite + React 18 (JavaScript + SWC).
- **Style :** Tailwind CSS. Utiliser `clsx` ou `tailwind-merge` pour les classes dynamiques.
- **Routing :** React Router DOM (v6+). Architecture SPA avec routes définies.
- **Tests :** Vitest (Compatible Jest) + React Testing Library.
- **Qualité :** ESLint.
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

### A. Composants & Découpage (Règle CRITIQUE)
- **LIMITE STRICTE : 150 Lignes Max.**
    - C'est une **contrainte bloquante**. Tout fichier dépassant 150 lignes est considéré comme une dette technique immédiate.
- **Découpage Préventif (Surtout le JSX) :**
    - Ne jamais attendre la phase de refactoring pour découper.
    - Si le JSX d'un composant devient profond ou long, il doit **immédiatement** être extrait en sous-composants dédiés (ex: `<InvoiceHeader />`, `<InvoiceRows />`, `<InvoiceFooter />`).
    - **Règle :** Si un composant a besoin de scroller pour être lu, il est trop gros.

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

## 5. Tests, Qualité & Linting
- **Linting (OBLIGATOIRE) :**
    - Le code ne doit générer **aucune erreur ni warning** au `npm run lint`.
    - Cette commande doit être exécutée systématiquement avant de valider une tâche.
- **Tests Unitaires (Logique) :**
    - "Si ça calcule de l'argent, des tantièmes ou des votes, ça doit être testé."
    - Chaque fichier `utils/*.js` critique doit avoir son `utils/*.test.js`.
- **Tests Frontend (Composants) :**
    - Les composants complexes (formulaires, tableaux interactifs) doivent être testés.
    - Vérifier le rendu correct (Rendering) et les interactions utilisateur (User Events) via React Testing Library.

## 6. Workflow IA
1. **Analyse :** Lister les fichiers à créer et identifier les potentiels dépassements de 150 lignes avant de coder.
2. **Modularité :** Vérifier si le code appartient au module courant ou au dossier partagé.
3. **Implémentation :**
    - 1. Logique pure (`utils`) + Tests Unitaires.
    - 2. Hooks.
    - 3. UI (en découpant immédiatement en sous-composants < 150 lignes).
4. **Vérification :** Lancer `npm run lint` et `npm run test` pour valider le code produit.