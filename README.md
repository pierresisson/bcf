# LifeRhythm MVP - Description Technique

## Stack Technologique

- Frontend: Next.js, React, TypeScript
- Styling: Tailwind CSS, shadcn/ui
- State Management: React Context API
- Form Handling: TanStack Form
- Data Fetching: TanStack Query
- Backend: Supabase (Authentication, Database)
- Database: PostgreSQL (via Supabase)
- Validation: Zod
- AI Integration: Claude 3.5 Sonnet API

## Fonctionnalités Clés du MVP

1. Authentification Utilisateur

   - Inscription/Connexion via Supabase Auth

2. Profil Utilisateur

   - Informations de base (nom, email, préférences)
   - Objectifs de vie (travail, santé, voyage)

3. Dashboard Personnel

   - Résumé quotidien
   - Widgets pour les différentes catégories (travail, santé, loisirs, voyage)

4. To-Do List Intelligente

   - Ajout/Suppression/Modification de tâches
   - Catégorisation automatique des tâches (travail, santé, loisirs, voyage)
   - Suggestion de tâches par l'IA basée sur les objectifs de l'utilisateur

5. Recommandations Quotidiennes

   - 3 suggestions par jour (version gratuite)
   - Utilisation de l'API Claude 3.5 Sonnet pour la personnalisation

6. Suivi Basique d'Activités

   - Enregistrement manuel d'activités (sommeil, exercice, travail)

7. Mini-Bibliothèque de Contenu

   - Quelques exercices de base
   - Recettes simples et saines

8. Paramètres de l'Application
   - Préférences de notification
   - Gestion du compte

## Structure des Données (Supabase/PostgreSQL)

1. Table `users`

   - id (UUID)
   - email
   - name
   - preferences (JSONB)

2. Table `goals`

   - id (UUID)
   - user_id (foreign key)
   - category (work, health, travel, leisure)
   - description
   - target_date

3. Table `tasks`

   - id (UUID)
   - user_id (foreign key)
   - title
   - description
   - category
   - due_date
   - status (pending, completed)

4. Table `activities`

   - id (UUID)
   - user_id (foreign key)
   - type (sleep, exercise, work)
   - duration
   - date

5. Table `recommendations`
   - id (UUID)
   - user_id (foreign key)
   - content
   - category
   - date

## Intégration de l'API Claude 3.5 Sonnet

- Utilisation pour la génération de recommandations personnalisées
- Analyse des tâches et activités pour des suggestions contextuelles
- Catégorisation intelligente des nouvelles tâches ajoutées

## Routes API (Next.js)

- `/api/auth` : Gestion de l'authentification
- `/api/profile` : CRUD pour le profil utilisateur
- `/api/tasks` : CRUD pour les tâches
- `/api/activities` : CRUD pour les activités
- `/api/recommendations` : Obtention des recommandations quotidiennes

## Composants React Principaux

1. `Layout` : Structure globale de l'application
2. `Dashboard` : Page d'accueil avec widgets
3. `TaskList` : Composant de liste de tâches
4. `ActivityTracker` : Formulaire d'enregistrement d'activités
5. `RecommendationCard` : Affichage des recommandations quotidiennes
6. `ProfileEditor` : Formulaire d'édition du profil

## Sécurité

- Utilisation de Supabase pour l'authentification sécurisée
- Validation des entrées côté client et serveur avec Zod
- Protection des routes API avec middleware d'authentification

## Performance

- Utilisation de TanStack Query pour la mise en cache et la gestion optimisée des requêtes
- Optimisation des images et lazy loading des composants non critiques

Ce MVP fournit une base solide pour LifeRhythm, incorporant les fonctionnalités essentielles tout en utilisant efficacement la stack technologique spécifiée. La to-do list intelligente est intégrée comme une fonctionnalité centrale, offrant une valeur immédiate aux utilisateurs dès le lancement.
