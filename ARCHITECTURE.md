# Architecture du projet EduGame AI (Stage)

Ce document explique le rôle du **backend**, du **frontend**, de chaque dossier important et le déroulement des processus (requête → réponse).

---

## 1. Vue d’ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVIGATEUR (utilisateur)                                        │
│  • Ouvre http://localhost:3000 (frontend React)                  │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + Vite)  —  port 3000                            │
│  • Affiche les pages (Login, Admin, Player, etc.)                │
│  • Envoie des requêtes HTTP vers le backend (API)                │
│  • Stocke le token JWT dans localStorage                         │
└────────────────────────────┬────────────────────────────────────┘
                              │  HTTP (axios)
                              │  Authorization: Bearer <token>
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND (Spring Boot)  —  port 8081                              │
│  • Expose des API REST sous /api/...                             │
│  • Vérifie le JWT (sécurité)                                     │
│  • Lit/écrit en base de données (PostgreSQL)                    │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BASE DE DONNÉES (PostgreSQL)                                    │
│  • Tables : users, jeux, badges, etc.                             │
└─────────────────────────────────────────────────────────────────┘
```

- **Frontend** = ce que l’utilisateur voit et avec quoi il interagit (URLs, formulaires, tableaux).
- **Backend** = logique métier, authentification, accès aux données. Le frontend l’appelle via des URLs comme `http://localhost:8081/api/...`.

---

## 2. BACKEND (dossier `backend/`)

Techno : **Java, Spring Boot, Spring Security, JPA, PostgreSQL.**

### Rôle global

- Exposer des **API REST** (JSON).
- **Authentifier** les utilisateurs (login → JWT).
- **Autoriser** les accès (ex. `/api/admin/**` réservé au rôle ADMIN).
- Lire / écrire en **base de données** via les entités JPA.

### Structure des dossiers (sous `src/main/java/.../authbackend/`)

| Dossier / Fichier | Rôle |
|-------------------|------|
| **AuthBackendApplication.java** | Point d’entrée : démarre l’application Spring. |
| **config/** | Configuration globale : sécurité (CORS, JWT, qui peut accéder à quelles URLs), base de données, envoi d’emails, etc. |
| **controller/** | **Couche présentation** : définit les URLs (routes) et délègue au service. |
| ├─ **auth/** (AuthController) | Routes `/api/auth/*` : register, login, verify, forgot-password, reset-password, logout. |
| ├─ **user/** (UserController) | Routes `/api/users/*` : getMe (profil connecté), update-profile, change-password. |
| └─ **admin/** (AdminUserController) | Routes `/api/admin/users/*` : liste users, détail par id, suspend, reactivate, change-role (réservé ADMIN). |
| **service/** | **Logique métier** : traitements, appels au repository, règles (ex. « on ne change pas le rôle ADMIN »). |
| ├─ **auth/** | Inscription, vérification email, login (génération JWT), mot de passe oublié / réinitialisation. |
| ├─ **user/** | Mise à jour du profil utilisateur connecté (nom, prénom, téléphone, avatar). |
| └─ **admin/** | Liste des utilisateurs, détail par id, suspension, réactivation, changement de rôle. |
| **repository/** | **Accès base de données** : requêtes (findByEmail, findById, etc.) sur les entités. |
| **entity/** | **Modèle des tables** : User, Jeu, Badge, etc. (champs = colonnes en BDD). |
| **dto/** | Objets pour les entrées/sorties API (RegisterRequest, UserDTO, UpdateRoleRequest, etc.). |
| **security/** | Filtre JWT : lit le token dans la requête, vérifie la signature, injecte l’utilisateur (email, rôle) pour Spring Security. |
| **exception/** | Gestion des erreurs API (404, 400, etc.) de façon uniforme. |

### Exemple de flux côté backend (liste des utilisateurs)

1. Requête : `GET /api/admin/users` avec header `Authorization: Bearer <token>`.
2. **SecurityConfig** : la route `/api/admin/**` exige le rôle `ADMIN`.
3. **JwtFilter** : extrait le token, vérifie la signature, charge l’utilisateur (email, rôle) dans le contexte Spring.
4. **AdminUserController** : méthode qui appelle `adminUserService.findAllUsers()`.
5. **AdminUserService** : appelle `userRepository.findAll()`, transforme chaque `User` en `UserDTO`, retourne la liste.
6. Réponse : JSON (liste de UserDTO) au frontend.

---

## 3. FRONTEND (dossier `frontend/`)

Techno : **React, Vite, React Router, Axios, Tailwind (et composants UI).**

### Rôle global

- Afficher les **pages** (accueil, login, admin, joueur, parent, éducateur).
- Envoyer des **requêtes HTTP** au backend (login, profil, liste users, etc.).
- Gérer **token** et **rôles** (localStorage + contextes) pour protéger les routes et personnaliser l’UI.

### Structure des dossiers (sous `src/`)

| Dossier / Fichier | Rôle |
|-------------------|------|
| **main.jsx** | Point d’entrée : enveloppe l’app dans `AuthProvider` puis `App` (qui contient `EduGameAuthBridge`, `AdminDataProvider`, `AppRoutes`). |
| **App.jsx** | Enchaîne les contextes (auth EduGame, admin) et les routes ; affiche le Toaster (notifications). |
| **routes/** | Définition des **URLs** et des composants à afficher. |
| ├─ **AppRoutes.jsx** | Toutes les routes : `/`, `/login`, `/admin/*`, `/player/*`, `/parent/*`, etc., et les gardes (PublicRoute, PrivateRoute, AdminRoute). |
| ├─ **PrivateRoute.jsx** | Redirige vers /login si pas de token (utilisateur non connecté). |
| ├─ **AdminRoute.jsx** | Redirige si pas connecté ou pas rôle ADMIN. |
| └─ **PublicRoute.jsx** | Pour les pages publiques (login, register). |
| **context/** | État global partagé (auth, données admin). |
| ├─ **EduGameAuthBridge.tsx** | Pont entre le store auth (email, rôle) et les pages : expose `user`, `playerProfile`, `logout`, etc. |
| ├─ **AdminDataContext.tsx** | Données partagées pour l’admin (ex. liste des jeux, badges) si besoin. |
| └─ **index.js** | Réexporte `useAuth`, `useAdminData`, etc. |
| **store/auth/** | Contexte d’authentification « bas niveau » : lecture du token, email et rôle depuis localStorage au chargement. |
| **api/** | Définition des **appels API** vers le backend. |
| ├─ **axiosConfig.js** | Instance Axios : base URL = backend, injection du token dans chaque requête, gestion 401 (déconnexion). |
| ├─ **endpoints.js** | Constantes des chemins (`/auth/login`, `/admin/users`, etc.). |
| ├─ **auth.api.js** | login, register, forgotPassword, resetPassword, etc. |
| ├─ **user.api.js** | getMe, updateProfile, changePassword. |
| ├─ **admin.api.js** | getUsers, getUserById, suspendUser, reactivateUser, updateUserRole. |
| └─ **api.types.ts** | Types TypeScript pour les réponses (UserDTO, etc.). |
| **services/** | Couche au-dessus des API : `auth.service.js` (login + stockage token/email/rôle), `user.service.js` (profil, mise à jour). |
| **pages/** | **Écrans** par zone : admin, player, parent, educator, auth, dashboard, home. |
| ├─ **admin/** | Manage Users (Players.tsx), détail (PlayerDetail), edit role (EditPlayer), profil admin (AdminEditMyProfile), Games, Badges, Moderation, Statistics, etc. |
| ├─ **player/** | Dashboard joueur, NewGame, jeux (Quiz, Memory, Logic, Reflex), Progress, Badges, Profile, Ranking. |
| ├─ **parent/** | Dashboard parent, ChildProgress, Analytics. |
| ├─ **educator/** | Dashboard éducateur, Questions, Games, Statistics. |
| ├─ **auth/** | Login, Register, ForgotPassword, ResetPassword, Verify. |
| ├─ **dashboard/** | Ancien dashboard utilisateur (Dashboard.jsx, UserProfile). |
| └─ **Home/** | Page d’accueil. |
| **components/** | Composants réutilisables : layout (AdminLayout, AdminHeader, AdminSidebar), formulaires auth, composants UI. |
| **data/types.ts** | Types partagés (UserDTO, PlayerProfile, Game, etc.) pour tout le frontend. |
| **config/env.js** | Variable `API_URL` (ex. `http://localhost:8081/api`) pour pointer vers le backend. |

### Exemple de flux côté frontend (liste des utilisateurs en admin)

1. L’utilisateur va sur `/admin/players` (Manage Users).
2. **AppRoutes** : la route est protégée par `AdminRoute` (vérifie token + rôle ADMIN).
3. **AdminLayout** : affiche sidebar + header + zone de contenu ; dans la zone de contenu, le composant rendu est **Players**.
4. **Players.tsx** : au montage (`useEffect`), appelle `adminApi.getUsers()` (donc `GET /api/admin/users`).
5. **axiosConfig** : ajoute `Authorization: Bearer <token>` à la requête.
6. Le backend répond avec la liste JSON ; le composant la met dans un state `users` et l’affiche dans un tableau (colonnes Nom, Role, Niveau, etc.).
7. Si l’utilisateur change un rôle dans le tableau, `adminApi.updateUserRole(id, role)` est appelé → `PUT /api/admin/users/{id}/change-role` → le backend met à jour et renvoie le UserDTO à jour ; le frontend met à jour la ligne dans le state.

---

## 4. Enchaînement complet d’un processus (ex. Connexion)

1. **Utilisateur** : remplit le formulaire de login et valide.
2. **Frontend (LoginForm)** : appelle `authService.login(credentials)`.
3. **auth.service.js** : appelle l’API `POST /api/auth/login` avec email + mot de passe.
4. **Backend (AuthController)** : reçoit la requête, appelle `AuthService.login()`.
5. **AuthService** : vérifie email/mot de passe en BDD, génère un JWT (avec email et rôle), retourne `AuthResponse` (token, email, role).
6. **Frontend** : reçoit le token ; le stocke dans `localStorage` (jwt_token, auth_email, auth_role) et redirige selon le rôle (ex. admin → `/admin/dashboard`, player → `/player/dashboard`).
7. **Ensuite** : chaque requête API (getUsers, getProfile, etc.) envoie `Authorization: Bearer <token>` ; le backend (JwtFilter + SecurityConfig) vérifie le token et autorise ou non l’accès aux routes (ex. `/api/admin/**` uniquement pour ADMIN).

---

## 5. Résumé des rôles

| Élément | Rôle |
|--------|------|
| **Backend** | API REST, authentification (JWT), autorisation (rôles), base de données. |
| **Frontend** | Interface utilisateur, navigation, appels API, stockage du token et des infos utilisateur. |
| **controller/** (backend) | Définir les URLs et appeler les services. |
| **service/** (backend) | Logique métier et accès aux données (via repositories). |
| **repository/** (backend) | Requêtes en base (findByEmail, findAll, save, etc.). |
| **entity/** (backend) | Modèle des tables BDD. |
| **dto/** (backend) | Forme des données entrantes/sortantes des API. |
| **routes/** (frontend) | URLs de l’app et quelle page afficher ; gardes (privé, admin). |
| **context/** (frontend) | État global (user, playerProfile, etc.) partagé entre composants. |
| **api/** (frontend) | Définition des requêtes HTTP vers le backend. |
| **pages/** (frontend) | Écrans (admin, player, auth, etc.). |
| **services/** (frontend) | Enchaînement login/register + stockage token et infos. |

Tu peux utiliser ce fichier comme référence pour comprendre où se trouve chaque logique (backend vs frontend) et comment une action utilisateur déclenche des appels API puis des mises à jour en base.
