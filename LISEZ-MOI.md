# 🏠 Copro-App - Suite de Gestion Copropriété

Application de gestion pour la copropriété **Les Pyrénées** (7-9 rue André Leroux, Soulac-sur-Mer).

---

## 📋 Contenu

Cette suite contient 4 applications accessibles depuis un Hub central :

| App | Description |
|-----|-------------|
| 🏢 **Gestion Copro** | Budget, comptabilité, gestion eau |
| 📚 **Carnet Copro** | Infos, travaux, prestataires |
| 💰 **Simulateur Crédit** | Calcul crédit collectif travaux |
| 🗳️ **Vote AG** | Votes assemblée générale |

---

## 🚀 Installation et Lancement

### Prérequis
- **Node.js** installé via NVM (normalement déjà fait si vous avez NVM)
- **Visual Studio Code** (ou tout autre éditeur)

### Étapes

#### 1. Ouvrir un terminal
- Dans VS Code : Menu `Terminal` → `Nouveau terminal`
- Ou : PowerShell / Invite de commandes Windows

#### 2. Se placer dans le dossier du projet
```bash
cd C:\Chemin\copro-app
```

#### 3. Installer les dépendances (une seule fois)
```bash
npm install
```
> ⏳ Cette commande télécharge toutes les librairies nécessaires. Peut prendre 1-2 minutes.

#### 4. Lancer l'application
```bash
npm run dev
```
> 🟢 Affiche une URL comme `http://localhost:5173/`

#### 5. Ouvrir dans le navigateur
Cliquez sur le lien affiché ou ouvrez manuellement : http://localhost:5173/

#### 6. Arrêter l'application
Dans le terminal : appuyez sur `Ctrl + C`

---

## 📁 Sauvegarder vos modifications avec Git

Git permet de versionner le code et de le sauvegarder sur GitHub.

### Méthode 1 : En ligne de commande

#### a) Voir les fichiers modifiés
```bash
git status
```

#### b) Ajouter tous les fichiers modifiés
```bash
git add .
```

#### c) Créer un "commit" (point de sauvegarde)
```bash
git commit -m "Description de vos modifications"
```
Exemple : `git commit -m "Ajout propriétaire DUPONT"`

#### d) Envoyer sur GitHub
```bash
git push
```

---

### Méthode 2 : Via l'interface VS Code

VS Code intègre Git avec une interface visuelle.

#### a) Ouvrir le panneau Git
Cliquez sur l'icône **Source Control** dans la barre latérale gauche (icône avec 3 branches).

> 🖼️ *[Screenshot attendu : Icône Source Control dans la barre latérale VS Code]*

#### b) Voir les modifications
Les fichiers modifiés apparaissent dans la liste "Changes".

> 🖼️ *[Screenshot attendu : Liste des fichiers modifiés dans le panneau Source Control]*

#### c) Préparer les fichiers (stage)
Cliquez sur le `+` à côté de chaque fichier, ou sur le `+` global pour tout ajouter.

> 🖼️ *[Screenshot attendu : Bouton + pour stager les fichiers]*

#### d) Écrire un message et valider
1. Dans le champ texte en haut, écrivez votre message de commit
2. Cliquez sur le bouton ✓ **Commit**

> 🖼️ *[Screenshot attendu : Champ de message et bouton Commit]*

#### e) Envoyer sur GitHub
Cliquez sur le bouton **Sync Changes** ou **Push** (flèche vers le haut).

> 🖼️ *[Screenshot attendu : Bouton Sync/Push dans la barre]*

---

## 🔄 Récupérer les modifications depuis GitHub

Si quelqu'un d'autre a fait des modifications :

### En ligne de commande
```bash
git pull
```

### Via VS Code
Cliquez sur **Sync Changes** ou le bouton de rafraîchissement dans le panneau Source Control.

---

## ❓ Aide-mémoire des commandes

| Commande | Description |
|----------|-------------|
| `npm install` | Installer les dépendances (une fois) |
| `npm run dev` | Lancer l'application |
| `Ctrl + C` | Arrêter l'application |
| `git status` | Voir les fichiers modifiés |
| `git add .` | Préparer tous les fichiers |
| `git commit -m "message"` | Créer un point de sauvegarde |
| `git push` | Envoyer sur GitHub |
| `git pull` | Récupérer depuis GitHub |

---

## 💾 Où sont stockées les données ?

Les données de l'application sont stockées dans le **localStorage** du navigateur :
- `copro_data_v10` : Données Gestion Copro
- `carnet_data_v1` : Données Carnet Copro

> ⚠️ Si vous effacez les données du navigateur, les données seront perdues.

---

## 🆘 En cas de problème

### "npm n'est pas reconnu"
Vérifiez que NVM est installé et qu'une version de Node est active :
```bash
nvm list
nvm use 20
```

### L'application ne se lance pas
1. Arrêtez tout avec `Ctrl + C`
2. Supprimez `node_modules` et réinstallez :
```bash
Remove-Item -Recurse node_modules
npm install
npm run dev
```

### Conflit Git
En cas de conflit après un `git pull`, contactez un développeur.

---

*Dernière mise à jour : Décembre 2025*
