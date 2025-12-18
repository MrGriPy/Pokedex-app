# Pokedex-app

# 📱 Pokédex App - Full Stack (React Native + Node.js)

Application mobile de gestion de Pokédex avec authentification, capture de Pokémon, et gestion de profil.

### Frontend (Mobile)
* **Framework** : React Native (via Expo)
* **Langage** : TypeScript
* **Navigation** : Expo Router

### Backend (API)
* **Serveur** : Node.js + Express
* **Sécurité** : Bcrypt (hachage), JWT (tokens), CORS (configuré pour Web/Mobile)
* **Emails** : Nodemailer (via Ethereal pour les tests)
* **Base de données** : MongoDB (Cloud)

---

## 🚀 Installation et Lancement

### 1. Prérequis
* Node.js installé.
* Application **Expo Go** sur votre téléphone (ou émulateur Android/iOS).
* Une base de données MongoDB (Atlas ou locale)

### 2. Configuration

* **1er terminal** : cd ./front/ ; npm install ; npx expo start --clear
* **2nd terminal** : cd ./backend/ ; npm install ; npm run dev

### 3. Fonctionnalités

* Création d'un compte
* Connexion au Pokédex avec ce compte
* Filtrage des Pokémons avec une barre de recherche
* Clic sur un Pokémon pour le marquer comme "Capturé"
* Enregistrement des Pokémons capturés dans la base de données via leur IP
* Page de profil avec les informations du compte et le nombre de Pokémons capturés
* Réinitialisation du mot de passe
* Accès à une page d'administration via le compte admin@admin sur son profil
* Modification et suppression des comptes par admin@admin
* Tout est sauvegardé et mis à jour dynamiquement sur MongoDB, même après redémarrage de l'API
