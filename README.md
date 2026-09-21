# 🌱 AgriSmart — Application de Farming Intelligent

## 📝 Description

AgriSmart est une application mobile intelligente destinée aux agriculteurs. Elle combine la gestion des cultures, un calendrier agricole et un assistant IA spécialisé dans le domaine de l'agriculture.

L'objectif est d'aider les agriculteurs à obtenir des informations fiables, suivre leurs cultures et organiser leurs tâches agricoles à travers une application mobile moderne, sécurisée et connectée à un backend.

Ce projet constitue le projet de fin de formation et mobilise plusieurs compétences :

* Développement mobile
* Développement Backend
* Conception de bases de données
* Authentification et sécurité
* Intelligence artificielle
* Intégration d'API
* Tests et déploiement

---

## 🎯 Objectifs

* Faciliter le suivi des cultures.
* Fournir des conseils agricoles contextualisés.
* Permettre la gestion des tâches agricoles.
* Proposer un assistant IA spécialisé.
* Rechercher des informations dans une base documentaire fiable.
* Mettre en place une architecture full-stack sécurisée.
* Déployer l'application avec Docker.

---

## 📱 Fonctionnalités principales

### 🔐 Authentification

* Inscription
* Connexion
* Déconnexion
* Refresh Token
* Protection des routes avec JWT
* Stockage sécurisé des tokens

### 🌿 My Crops

* Ajouter une culture
* Consulter les cultures
* Modifier une culture
* Supprimer une culture
* Suivre les informations de chaque culture

### 📅 Agricultural Calendar

* Ajouter une tâche agricole
* Consulter les tâches
* Modifier une tâche
* Supprimer une tâche
* Organiser les semis, arrosages et récoltes

### 📸 Scan Plant

* Prendre ou sélectionner une photo d'une plante
* Obtenir des informations sur un problème potentiel
* Recevoir des recommandations générales

> L'analyse des plantes constitue une aide à l'identification et ne remplace pas un diagnostic professionnel.

### 🤖 Assistant Agricole IA

L'agent IA est spécialisé dans l'agriculture.

Il peut :

* Répondre aux questions agricoles.
* Rechercher des informations dans une base documentaire.
* Donner des conseils généraux.
* Recommander des actions.
* Consulter les cultures de l'utilisateur.
* Aider à organiser les tâches agricoles.
* Appeler certaines fonctions métier autorisées.

---

## 🧠 Intelligence artificielle — RAG

AgriSmart utilise un système RAG (*Retrieval-Augmented Generation*) pour améliorer la fiabilité des réponses de l'agent.

### Fonctionnement

```text
Question utilisateur
        ↓
Agent IA
        ↓
Recherche vectorielle
        ↓
PostgreSQL + pgvector
        ↓
Documents agricoles
        ↓
Modèle IA
        ↓
Réponse contextualisée
```

Les documents sont découpés en morceaux, transformés en embeddings et enregistrés dans une base vectorielle.

L'agent recherche les documents pertinents avant de générer sa réponse.

### Function Calling

L'agent peut utiliser des fonctions métier contrôlées :

```text
getUserCrops()
getCropDetails()
getAgriculturalTasks()
createTask()
updateTask()
```

Les fonctions accessibles sont limitées par le backend.

---

## 🔒 Limites et sécurité de l'agent

L'agent ne doit pas être considéré comme une source absolue de vérité.

Il doit :

* Utiliser les sources disponibles.
* Signaler les informations incertaines.
* Éviter d'inventer des informations.
* Refuser les demandes hors du domaine agricole.
* Refuser les demandes visant à révéler des secrets.
* Ne pas exécuter d'actions non autorisées.
* Demander une confirmation avant les actions sensibles.
* Résister aux tentatives de prompt injection.

Exemple :

> Voulez-vous ajouter l'arrosage des tomates à votre calendrier pour demain ?

L'action est exécutée uniquement après confirmation de l'utilisateur.

---

## 🏗️ Architecture globale

```text
React Native + Expo
        ↓
Axios / SSE
        ↓
Node.js + Express
        ↓
Controllers
        ↓
Services
        ↓
Repositories
        ↓
PostgreSQL + pgvector
        ↓
Agent IA / RAG
        ↓
OpenAI API
```

---

## ⚙️ Backend

Le backend suit une architecture en couches :

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── middlewares/
│   ├── ai/
│   ├── app.js
│   └── server.js
├── tests/
│   ├── unit/
│   └── integration/
├── migrations/
├── Dockerfile
├── package.json
└── .env.example
```

### Technologies Backend

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* JWT
* bcrypt
* Zod
* Jest
* Supertest

---

## 🗄️ Base de données

AgriSmart utilise PostgreSQL avec un schéma normalisé.

### Entités principales

```text
User
 ├── Crop
 ├── Task
 └── Conversation
          └── Message

Document
 └── Embedding
```

### Tables

* `users`
* `refresh_tokens`
* `crops`
* `tasks`
* `conversations`
* `messages`
* `documents`
* `embeddings`

La technologie pgvector permet de réaliser la recherche par similarité pour le système RAG.

---

## 📡 API REST

### Authentification

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Cultures

```http
GET    /api/crops
GET    /api/crops/:id
POST   /api/crops
PUT    /api/crops/:id
DELETE /api/crops/:id
```

### Tâches

```http
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Assistant IA

```http
POST /api/agent/chat
POST /api/agent/stream
```

Le streaming SSE permet d'afficher progressivement les réponses de l'agent dans l'application mobile.

---

## 📱 Frontend mobile

L'application mobile est développée avec React Native et Expo.

```text
mobile/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (app)/
│       ├── home.tsx
│       ├── crops.tsx
│       ├── calendar.tsx
│       ├── scan.tsx
│       ├── assistant.tsx
│       └── profile.tsx
├── src/
│   ├── components/
│   ├── services/
│   │   └── api.ts
│   ├── stores/
│   ├── hooks/
│   ├── types/
│   └── constants/
├── package.json
└── tsconfig.json
```

### Technologies Frontend

* React Native
* Expo
* Expo Router
* TypeScript
* Zustand
* Axios
* Expo SecureStore
* Expo Camera

---

## 🔄 Communication Frontend / Backend

```text
Application mobile
        ↓
Axios
        ↓
API Express
        ↓
Controller
        ↓
Service
        ↓
Repository
        ↓
PostgreSQL
```

Pour l'assistant IA, les réponses peuvent être transmises progressivement avec SSE.

---

## 🔐 Sécurité

* JWT et Refresh Tokens
* Mots de passe protégés avec bcrypt
* Middleware d'authentification
* Validation des données avec Zod
* Protection contre les injections SQL
* Rate limiting
* Protection contre la prompt injection
* Variables d'environnement
* Contrôle des fonctions de l'agent
* Gestion globale des erreurs
* Journalisation et audit des interactions IA

Les clés API ne sont jamais enregistrées dans Git.

---

## 🧪 Tests et qualité

Le projet prévoit :

* Tests unitaires avec Jest.
* Tests d'intégration avec Supertest.
* Tests des services avec des repositories mockés.
* Validation des endpoints.
* ESLint pour la qualité du code.
* Documentation Swagger/OpenAPI.
* Collection Postman.

---

## 📝 Vibe Coding

L'intelligence artificielle est utilisée comme assistant de développement pour :

* La conception.
* La génération de code.
* Le débogage.
* Les tests.
* Le refactoring.
* La documentation.

Le développeur reste responsable de l'architecture, de la sécurité, de la qualité du code et de la compréhension de chaque fonctionnalité.

### Journal de prompts

```text
Prompt
   ↓
Code généré
   ↓
Analyse
   ↓
Corrections
   ↓
Tests
   ↓
Validation
```

Les prompts sont décomposés en petites tâches testables.

---

## 🔌 MCP — Bonus

MCP peut être utilisé pour connecter l'agent à un outil externe ou à une fonction métier.

Exemple :

```text
Agent IA
   ↓
MCP Client
   ↓
MCP Server
   ↓
Outil agricole externe
```

Un scénario de démonstration sera documenté pour la soutenance.

---

## ⚙️ Automatisation — Bonus

Une automatisation n8n peut être ajoutée pour :

* Envoyer des rappels de tâches agricoles.
* Générer des résumés périodiques.
* Déclencher des notifications personnalisées.

---

## 🐳 Docker et déploiement

Le backend est conteneurisé avec Docker.

```text
Docker
├── AgriSmart API
└── PostgreSQL + pgvector
```

Les secrets sont gérés par variables d'environnement.

Hébergement prévu :

* Railway
* Render

---

## 🎨 Design UI

L'interface est inspirée de l'agriculture :

* 🌿 Vert : nature et cultures.
* ☀️ Jaune : actions importantes.
* ⚪ Blanc : simplicité et lisibilité.

L'application vise une expérience moderne, claire et accessible.

---

## 👨‍🌾 Utilisateurs cibles

* Agriculteurs
* Exploitants agricoles
* Travailleurs agricoles
* Utilisateurs souhaitant suivre leurs cultures

---

## 📚 UML et documentation

Le projet comprend :

* Diagramme de cas d'utilisation.
* Diagramme de classes.
* Architecture globale avec la brique IA.
* Schéma de base de données.
* Documentation Swagger.
* Documentation de l'agent et de ses limites.

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/miftahsara390-coder/AgriSmart.git
cd AgriSmart
```

### 2. Installer les dépendances

```bash
cd backend
npm install

cd ../mobile
npm install
```

### 3. Configurer les variables d'environnement

Créer les fichiers `.env` à partir de `.env.example`.

Ne jamais ajouter les secrets dans Git.

### 4. Lancer le projet

```bash
# Backend
npm run dev

# Mobile
npx expo start
```

Les commandes exactes dépendent de la structure réelle du projet.

---

## 🔮 Améliorations futures

* Intégration d'une API météo.
* Intégration de données provenant de drones.
* Analyse avancée des plantes.
* Notifications intelligentes.
* Géolocalisation des parcelles.
* Statistiques agricoles.
* Support arabe, français et anglais.
* Nouvelles intégrations MCP.

---

## 👩‍💻 Auteur

**Sara Miftah**

Projet de fin de formation — AgriSmart

---

## ⭐ Conclusion

AgriSmart est une application mobile agricole full-stack qui combine la gestion des cultures, un calendrier agricole et un assistant IA spécialisé.

Le projet met en œuvre une architecture moderne intégrant React Native, Node.js, PostgreSQL, sécurité JWT, RAG, function calling, tests, Docker et déploiement.

L'objectif est de construire un assistant agricole utile, contrôlé, sécurisé et capable d'accompagner les utilisateurs dans leurs activités quotidiennes.
