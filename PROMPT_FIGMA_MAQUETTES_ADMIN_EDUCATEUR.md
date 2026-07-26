# Prompt pour créer les maquettes Figma – EduGame AI (Administrateur & Éducateur)

**À copier-coller dans un outil IA Figma (Figma AI, Galileo AI, etc.) ou à donner à un designer.**

---

## Contexte du projet

EduGame AI est une **plateforme de jeux éducatifs** destinée aux **jeunes de 7 à 18 ans**. Elle propose des jeux (quiz, mémoire, réflexe, logique) avec suivi de progression, badges et statistiques. Les rôles principaux sont : **Joueur**, **Parent**, **Éducateur** et **Administrateur**. L’inscription, la connexion et le tableau de bord administrateur existent déjà. Il faut concevoir les **interfaces Figma** pour l’**Administrateur** et l’**Éducateur**, avec un **scénario de navigation cohérent** : chaque bouton ou lien mène à une interface précise, comme dans un parcours utilisateur réel.

---

## Rôle 1 – Administrateur

### Tâches à couvrir par les maquettes

| Tâche | Description courte |
|-------|--------------------|
| Se connecter | Saisie email / mot de passe → accès espace admin (déjà fait). |
| Gérer les joueurs | Voir la liste des joueurs, modifier infos (nom, email, téléphone, rôle, état du compte), bloquer/débloquer un compte. |
| Gérer les jeux | Ajouter, modifier, supprimer des jeux (titre, description, difficulté, âge min/max, type de jeu, mode, actif/inactif). |
| Gérer les badges | Créer, modifier, supprimer des badges (nom, description, condition de score, icône). |
| Consulter statistiques globales | Tableau de bord avec activité globale (sessions, scores, utilisateurs actifs, etc.). |
| Modérer le contenu | Vérifier et supprimer des contenus inappropriés (ex. questions, commentaires). |

### Scénario de navigation – Administrateur

1. **Écran de connexion Admin** (existant)  
   - Champs : Email, Mot de passe.  
   - Bouton : « Se connecter ».  
   - **Clic sur « Se connecter »** → **Tableau de bord Admin (accueil)**.

2. **Tableau de bord Admin (accueil)**  
   - En-tête : logo EduGame AI, menu « Profil » (avatar/déroulant), Déconnexion.  
   - Menu latéral ou barre d’onglets avec :  
     - Tableau de bord (accueil)  
     - Gestion des joueurs  
     - Gestion des jeux  
     - Gestion des badges  
     - Statistiques globales  
     - Modération du contenu  
   - Zone centrale : résumé (nombre de joueurs, jeux actifs, badges, etc.).  
   - **Clic sur « Gestion des joueurs »** → **Liste des joueurs**.  
   - **Clic sur « Gestion des jeux »** → **Liste des jeux**.  
   - **Clic sur « Gestion des badges »** → **Liste des badges**.  
   - **Clic sur « Statistiques globales »** → **Page Statistiques globales**.  
   - **Clic sur « Modération du contenu »** → **Page Modération**.

3. **Liste des joueurs**  
   - Tableau : colonnes inspirées de `Utilisateur` (nom, prénom, email, téléphone, rôle, état du compte, date création, dernière connexion).  
   - Filtres : par rôle (ADMIN, JOUEUR, PARENT, EDUCATEUR, SPONSOR), par état (ACTIF, SUSPENDU, DÉSACTIVÉ).  
   - Actions par ligne : Modifier, Bloquer/Débloquer.  
   - **Clic sur « Modifier »** → **Formulaire / fiche détail Joueur** (modification des champs du joueur).  
   - **Clic sur « Ajouter un joueur »** (optionnel) → **Formulaire création joueur**.

4. **Formulaire / fiche détail Joueur**  
   - Champs : nom, prénom, email, téléphone, date de naissance, avatar (URL ou upload), rôle, état du compte (ACTIF / SUSPENDU / DÉSACTIVÉ).  
   - Boutons : Enregistrer, Annuler.  
   - **Clic sur « Annuler »** ou « Retour » → **Liste des joueurs**.

5. **Liste des jeux**  
   - Cartes ou tableau : colonnes inspirées de `Jeu` (titre, description courte, difficulté, âge min–max, type de jeu, mode, actif, date création).  
   - Filtres : par type (QUIZ, MÉMOIRE, RÉFLEXE, LOGIQUE), par mode (INDIVIDUEL, COLLECTIF).  
   - Actions : Modifier, Supprimer, Activer/Désactiver.  
   - **Clic sur « Ajouter un jeu »** → **Formulaire création / édition Jeu**.  
   - **Clic sur « Modifier »** → **Formulaire création / édition Jeu** (pré-rempli).

6. **Formulaire création / édition Jeu**  
   - Champs : titre, description (texte long), difficulté (1–5 ou liste), âge minimum, âge maximum, type de jeu (QUIZ, MÉMOIRE, RÉFLEXE, LOGIQUE), mode (INDIVIDUEL, COLLECTIF), actif (oui/non).  
   - Boutons : Enregistrer, Annuler.  
   - **Clic sur « Annuler »** ou « Retour » → **Liste des jeux**.

7. **Liste des badges**  
   - Cartes ou tableau : colonnes inspirées de `Badge` (nom, description, score condition, icône).  
   - Actions : Modifier, Supprimer.  
   - **Clic sur « Créer un badge »** → **Formulaire création / édition Badge**.  
   - **Clic sur « Modifier »** → **Formulaire création / édition Badge**.

8. **Formulaire création / édition Badge**  
   - Champs : nom, description, score condition (entier), icône (URL ou sélecteur).  
   - Boutons : Enregistrer, Annuler.  
   - **Clic sur « Annuler »** ou « Retour » → **Liste des badges**.

9. **Page Statistiques globales**  
   - Blocs : nombre de joueurs actifs, nombre de jeux, nombre de sessions, évolution des scores ou de l’activité (courbes / barres).  
   - Données inspirées de : `SessionJeu`, `StatistiquesPerformance`, `Utilisateur`.  
   - **Retour** → Tableau de bord Admin.

10. **Page Modération du contenu**  
    - Liste d’éléments à modérer (ex. questions signalées, contenus utilisateur) avec aperçu et actions : Approuver, Supprimer.  
    - **Retour** → Tableau de bord Admin.

---

## Rôle 2 – Éducateur

### Tâches à couvrir par les maquettes

| Tâche | Description courte |
|-------|--------------------|
| Se connecter | Saisie email / mot de passe → accès espace éducateur. |
| Ajouter une question | Saisir contenu, réponses possibles, bonne réponse, explication, difficulté → Enregistrer. |
| Modifier une question | Sélectionner une question, modifier le contenu, enregistrer. |
| Supprimer une question | Sélectionner une question, clic Supprimer. |
| Associer une question à un jeu | Choisir un jeu puis assigner des questions à ce jeu. |
| Consulter statistiques des réponses | Voir les réponses correctes/incorrectes des joueurs (par jeu ou par question). |

### Scénario de navigation – Éducateur

1. **Écran de connexion Éducateur**  
   - Même principe que Admin : Email, Mot de passe, « Se connecter ».  
   - **Clic sur « Se connecter »** → **Tableau de bord Éducateur (accueil)**.

2. **Tableau de bord Éducateur (accueil)**  
   - En-tête : logo, menu Profil, Déconnexion.  
   - Menu : Tableau de bord, Gestion des questions, Associer questions aux jeux, Statistiques des réponses.  
   - Zone centrale : résumé (nombre de questions, jeux concernés, etc.).  
   - **Clic sur « Gestion des questions »** → **Liste des questions**.  
   - **Clic sur « Associer questions aux jeux »** → **Page Association questions / jeux**.  
   - **Clic sur « Statistiques des réponses »** → **Page Statistiques des réponses**.

3. **Liste des questions**  
   - Tableau ou cartes : colonnes inspirées de `Question` (contenu court, bonne réponse, difficulté, jeu associé `id_jeu` ou nom du jeu).  
   - Filtres : par jeu, par difficulté.  
   - Actions : Modifier, Supprimer.  
   - **Clic sur « Ajouter une question »** → **Formulaire création / édition Question**.  
   - **Clic sur « Modifier »** → **Formulaire création / édition Question** (pré-rempli).

4. **Formulaire création / édition Question**  
   - Champs : contenu (texte de la question), bonne réponse, explication (optionnel), difficulté (1–5 ou liste), choix du jeu (liste déroulante des jeux).  
   - Boutons : Enregistrer, Annuler.  
   - **Clic sur « Annuler »** ou « Retour » → **Liste des questions**.

5. **Page Association questions aux jeux**  
   - Étape 1 : sélectionner un **jeu** (liste des jeux avec titre, type).  
   - Étape 2 : liste des **questions** (coche pour associer/dissocier au jeu choisi).  
   - Bouton : Enregistrer les associations.  
   - **Retour** → Tableau de bord Éducateur.

6. **Page Statistiques des réponses**  
   - Filtres : par jeu, par période, par joueur (optionnel).  
   - Tableaux ou graphiques : taux de bonnes réponses, précision, vitesse (champs type `StatistiquesPerformance` : précision, vitesse, concentration).  
   - Données liées à `SessionJeu` et `StatistiquesPerformance`.  
   - **Retour** → Tableau de bord Éducateur.

---

## Référence rapide – Entités du diagramme de classes (pour les champs des formulaires et listes)

- **Utilisateur** : id, nom, prénom, email, mot_de_passe, date_naissance, avatar, téléphone, role, etat_compte, enabled, niveau, scoreTotal, pointsExperience, date_creation, derniere_connexion, id_region, id_genre.  
- **Jeu** : id_jeu, titre, description, difficulte, age_min, age_max, type_jeu (QUIZ, MÉMOIRE, RÉFLEXE, LOGIQUE), mode (INDIVIDUEL, COLLECTIF), actif, date_creation.  
- **Question** : id_question, contenu, bonne_reponse, explication, difficulte, id_jeu.  
- **Badge** : id_badge, nom, description, score_condition, icone.  
- **StatistiquesPerformance** : id_stats, precision, vitesse, concentration, id_session.  
- **SessionJeu** : id_session, date_debut, date_fin, duree, score_global, niveau_atteint, progression, etat, id_utilisateur, id_jeu.  

Utiliser ces champs pour nommer les libellés et colonnes des maquettes (en français si besoin : « Prénom », « Type de jeu », « Score condition », etc.).

---

## Consignes pour les maquettes Figma

1. **Cohérence** : même style d’en-tête, menu latéral ou onglets, et boutons d’action (primaire / secondaire) pour Admin et Éducateur.  
2. **Scénario clair** : pour chaque écran, indiquer en annotation ou en lien prototype : « Clic sur [X] → écran [Y] ».  
3. **Public cible** : plateforme pour 7–18 ans, donc interfaces admin/éducateur lisibles et professionnelles (pas enfantines).  
4. **Responsive** : prévoir au moins une largeur desktop (1280–1440 px) pour les tableaux et formulaires.  
5. **Libellés en français** : tous les champs, boutons et titres en français.  
6. **Accessibilité** : contrastes suffisants, zones cliquables identifiables.

---

## Résumé à donner à l’IA Figma (version courte)

« Conçois des maquettes Figma pour une plateforme de jeux éducatifs (7–18 ans), pour **Administrateur** et **Éducateur**.

- **Admin** : tableau de bord, liste joueurs (avec modification/blocage), liste jeux (CRUD), liste badges (CRUD), statistiques globales, modération du contenu. Chaque bouton du menu mène à l’écran correspondant.  
- **Éducateur** : tableau de bord, liste questions (CRUD), écran « Associer questions aux jeux », statistiques des réponses. Même principe de navigation.

Les champs des formulaires et tableaux doivent reprendre les entités : Utilisateur (nom, prénom, email, rôle, état compte…), Jeu (titre, description, difficulté, âge min/max, type, mode…), Question (contenu, bonne réponse, explication, difficulté, jeu…), Badge (nom, description, score condition, icône). Style sobre et professionnel, libellés en français, scénario de clics cohérent (bouton → écran lié). »

---

*Document généré pour le projet EduGame AI – à utiliser comme brief pour Figma AI ou un designer.*
