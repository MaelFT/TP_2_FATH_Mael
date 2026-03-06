# TP Séance 3 — Base de données & ORM

API REST de gestion d'utilisateurs avec **Node.js**, **Express.js**, **MongoDB** et **Mongoose**, architecture **MVC**.

Évolution du TP Séance 2 : le stockage en mémoire est remplacé par une base de données persistante.

---

## Prérequis

- Node.js v18+
- npm
- Postman (ou Insomnia)
- Un accès MongoDB : **MongoDB Atlas** (cloud, gratuit) **ou** MongoDB installé en local

---

## Installation

```bash
npm install
```

### Configurer la connexion MongoDB

Créer (ou modifier) le fichier `.env` à la racine :

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/tp_seance3
PORT=3001
```

> **MongoDB Atlas (recommandé)** — [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)  
> Créer un cluster M0 gratuit → Database Access → Network Access → Connect → Drivers → copier l'URI.

> **MongoDB local** — remplacer par `MONGO_URI=mongodb://localhost:27017/tp_seance3`  
> (nécessite que `mongod` soit lancé)

### Peupler la base de données (première fois)

```bash
node data/seed.js
```

Ce script insère 3 utilisateurs initiaux **uniquement si la collection est vide**.

### Démarrer le serveur

```bash
npm run dev     # avec rechargement automatique (nodemon)
# ou
npm start       # sans rechargement
```

Serveur disponible sur : `http://localhost:3001`

Lancement attendu dans le terminal :
```
✅  MongoDB connecté : cluster0.xxxxx.mongodb.net
🚀  Serveur démarré sur http://localhost:3001
```

---

## Structure du projet

```
fullstack-backend/
├── config/
│   └── db.js                 ← connexion MongoDB (Mongoose)
├── middleware/
│   └── errorHandler.js       ← gestion centralisée des erreurs
├── models/
│   └── userModel.js          ← schéma Mongoose (M)
├── controllers/
│   └── userController.js     ← logique métier async/await (C)
├── routes/
│   └── users.js              ← câblage URL ↔ controller
├── data/
│   ├── seed.js               ← script d'initialisation BDD
│   └── users.js              ← (conservé, plus utilisé)
├── .env                      ← variables d'environnement (ignoré par Git)
├── server.js                 ← point d'entrée
└── package.json
```

---

## Endpoints

| Méthode  | Route              | Statut succès | Description                         |
|----------|--------------------|---------------|-------------------------------------|
| `GET`    | `/api/users`       | `200`         | Lister tous les utilisateurs        |
| `GET`    | `/api/users/:id`   | `200`         | Obtenir un utilisateur par `_id`    |
| `POST`   | `/api/users`       | `201`         | Créer un nouvel utilisateur         |
| `PUT`    | `/api/users/:id`   | `200`         | Mettre à jour un utilisateur        |
| `DELETE` | `/api/users/:id`   | `204`         | Supprimer un utilisateur            |

### Query parameters

```
GET /api/users?role=admin             → filtre par rôle
GET /api/users?search=ali             → recherche par nom (insensible à la casse)
GET /api/users?page=1&limit=2         → pagination
```

---

## Modèle utilisateur

MongoDB génère automatiquement `_id` (ObjectId) qui remplace l'ancien `id` numérique.

```json
{
  "_id": "65f7d2c9a6f7d4c5c9b8e2a1",
  "name": "Alice Martin",
  "email": "alice@example.com",
  "role": "admin",
  "createdAt": "2024-01-15T00:00:00.000Z"
}
```

Contraintes du schéma :

| Champ       | Type   | Règles                              |
|-------------|--------|-------------------------------------|
| `name`      | String | obligatoire, trim                   |
| `email`     | String | obligatoire, unique, lowercase      |
| `role`      | String | enum `admin`/`user`, défaut `user`  |
| `createdAt` | Date   | défaut `Date.now`                   |

---

## Scénario de test complet — 7 étapes

> Les `_id` MongoDB sont des **ObjectId** de 24 caractères hexadécimaux.  
> Remplacer `:_id` dans les URLs par l'`_id` réel retourné par chaque requête.

---

### Test 1 — `GET /api/users` — Lister les 3 utilisateurs initiaux

**Méthode :** `GET`  
**URL :** `http://localhost:3001/api/users`  
**Statut attendu :** `200 OK`

**Réponse attendue :**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "_id": "...", "name": "Alice Martin",   "email": "alice@example.com",  "role": "admin" },
    { "_id": "...", "name": "Jean Dupont",    "email": "jean@example.com",   "role": "user"  },
    { "_id": "...", "name": "Sophie Bernard", "email": "sophie@example.com", "role": "user"  }
  ]
}
```

✅ Vérifier : `count` vaut `3`, chaque objet possède un `_id` MongoDB.

---

### Test 2 — `POST /api/users` — Créer un nouvel utilisateur

**Méthode :** `POST`  
**URL :** `http://localhost:3001/api/users`  
**Headers :** `Content-Type: application/json`  
**Body (raw JSON) :**
```json
{
  "name": "Bob Dupont",
  "email": "bob@example.com",
  "role": "user"
}
```
**Statut attendu :** `201 Created`

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "_id": "65f7d2c9a6f7d4c5c9b8e2a5",
    "name": "Bob Dupont",
    "email": "bob@example.com",
    "role": "user",
    "createdAt": "2026-03-06T..."
  }
}
```

✅ Vérifier : statut `201`, `_id` présent.  
📝 **Copier le `_id` retourné** — il sera utilisé dans les tests suivants.

---

### Test 3 — `GET /api/users/:_id` — Récupérer l'utilisateur créé

**Méthode :** `GET`  
**URL :** `http://localhost:3001/api/users/65f7d2c9a6f7d4c5c9b8e2a5`  
**Statut attendu :** `200 OK`

✅ Vérifier : le même utilisateur est retourné avec ses données complètes.

---

### Test 4 — `PUT /api/users/:_id` — Modifier le rôle de Bob

**Méthode :** `PUT`  
**URL :** `http://localhost:3001/api/users/65f7d2c9a6f7d4c5c9b8e2a5`  
**Headers :** `Content-Type: application/json`  
**Body (raw JSON) :**
```json
{
  "role": "admin"
}
```
**Statut attendu :** `200 OK`

✅ Vérifier : `role` est passé à `"admin"`. `_id` et `createdAt` sont inchangés.

---

### Test 5 — `GET /api/users` — Vérifier qu'il y a maintenant 4 utilisateurs

**Méthode :** `GET`  
**URL :** `http://localhost:3001/api/users`  
**Statut attendu :** `200 OK`

✅ Vérifier : `count` vaut `4`.

---

### Test 6 — `DELETE /api/users/:_id` — Supprimer Bob

**Méthode :** `DELETE`  
**URL :** `http://localhost:3001/api/users/65f7d2c9a6f7d4c5c9b8e2a5`  
**Statut attendu :** `204 No Content`

✅ Vérifier : statut `204` et body **vide**.

---

### Test 7 — `GET /api/users/:_id` — Vérifier que Bob n'existe plus

**Méthode :** `GET`  
**URL :** `http://localhost:3001/api/users/65f7d2c9a6f7d4c5c9b8e2a5`  
**Statut attendu :** `404 Not Found`

**Réponse attendue :**
```json
{
  "success": false,
  "message": "Utilisateur non trouvé"
}
```

---

## Tests des cas d'erreur MongoDB

| # | Requête | Statut attendu | Raison |
|---|---------|----------------|--------|
| E1 | `POST` avec body `{}` | `400` | `name` et `email` manquants |
| E2 | `GET /api/users/123` | `400` | ObjectId invalide (trop court) |
| E3 | `GET /api/users/000000000000000000000000` | `404` | ObjectId valide mais inexistant |
| E4 | `POST` avec email déjà utilisé | `409` | Index unique violé (code 11000) |
| E5 | `PUT /api/users/123` | `400` | ObjectId invalide |
| E6 | `DELETE /api/users/123` | `400` | ObjectId invalide |

---

## Test de persistance

Objectif : vérifier que MongoDB conserve les données entre deux démarrages.

1. Créer un utilisateur avec `POST /api/users`
2. Noter son `_id`
3. Arrêter le serveur (`Ctrl+C`)
4. Relancer le serveur (`npm run dev`)
5. Faire `GET /api/users/:_id`

→ L'utilisateur doit toujours exister. ✅

---

## Bonus implémentés

### Filtrage par rôle

```
GET http://localhost:3001/api/users?role=admin
GET http://localhost:3001/api/users?role=user
```

### Recherche par nom (insensible à la casse)

```
GET http://localhost:3001/api/users?search=ali
```

Utilise `new RegExp(search, 'i')` → correspond à "Alice", "ALICIA", "alicia"…

### Pagination

```
GET http://localhost:3001/api/users?page=1&limit=2
```

**Réponse :**
```json
{
  "success": true,
  "page": 1,
  "limit": 2,
  "totalCount": 3,
  "totalPages": 2,
  "data": [...]
}
```

### Middleware global d'erreurs

Toutes les erreurs non gérées remontent à `middleware/errorHandler.js` :
- `ValidationError` Mongoose → `400`
- Clé dupliquée (code 11000) → `409`
- `CastError` ObjectId → `400`
- Autres → `500`

### Logging des requêtes

Chaque requête est loggée dans le terminal :
```
[2026-03-06 10:30:00] GET /api/users - 200 - 12ms
[2026-03-06 10:30:05] POST /api/users - 201 - 34ms
```

---

## Collection Postman (import JSON)

Sauvegarder le contenu ci-dessous dans `TP3_Postman_Collection.json`  
puis importer dans Postman via **File → Import**.

> ⚠️ Remplacer `OBJECT_ID_ICI` par un vrai `_id` MongoDB après le Test 2.

```json
{
  "info": {
    "name": "TP3 - API Utilisateurs MongoDB",
    "description": "Collection de tests pour le TP Séance 3 - MongoDB & Mongoose",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. GET tous les utilisateurs (200)",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"]
        }
      },
      "response": []
    },
    {
      "name": "2. POST créer Bob Dupont (201)",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Bob Dupont\",\n  \"email\": \"bob@example.com\",\n  \"role\": \"user\"\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": {
          "raw": "http://localhost:3001/api/users",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"]
        }
      },
      "response": []
    },
    {
      "name": "3. GET utilisateur par _id (200)",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users/OBJECT_ID_ICI",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "OBJECT_ID_ICI"]
        }
      },
      "response": []
    },
    {
      "name": "4. PUT modifier rôle → admin (200)",
      "request": {
        "method": "PUT",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"role\": \"admin\"\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": {
          "raw": "http://localhost:3001/api/users/OBJECT_ID_ICI",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "OBJECT_ID_ICI"]
        }
      },
      "response": []
    },
    {
      "name": "5. GET tous → count=4 (200)",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"]
        }
      },
      "response": []
    },
    {
      "name": "6. DELETE utilisateur (204)",
      "request": {
        "method": "DELETE",
        "url": {
          "raw": "http://localhost:3001/api/users/OBJECT_ID_ICI",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "OBJECT_ID_ICI"]
        }
      },
      "response": []
    },
    {
      "name": "7. GET utilisateur supprimé → 404",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users/OBJECT_ID_ICI",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "OBJECT_ID_ICI"]
        }
      },
      "response": []
    },
    {
      "name": "ERR1. POST sans body → 400",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{}",
          "options": { "raw": { "language": "json" } }
        },
        "url": {
          "raw": "http://localhost:3001/api/users",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"]
        }
      },
      "response": []
    },
    {
      "name": "ERR2. GET ObjectId invalide → 400",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users/123",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "123"]
        }
      },
      "response": []
    },
    {
      "name": "ERR3. GET ObjectId valide inexistant → 404",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users/000000000000000000000000",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "000000000000000000000000"]
        }
      },
      "response": []
    },
    {
      "name": "ERR4. POST email dupliqué → 409",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Alice Copie\",\n  \"email\": \"alice@example.com\"\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": {
          "raw": "http://localhost:3001/api/users",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"]
        }
      },
      "response": []
    },
    {
      "name": "BONUS. GET filtrage ?role=admin",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users?role=admin",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"],
          "query": [{ "key": "role", "value": "admin" }]
        }
      },
      "response": []
    },
    {
      "name": "BONUS. GET recherche ?search=ali",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users?search=ali",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"],
          "query": [{ "key": "search", "value": "ali" }]
        }
      },
      "response": []
    },
    {
      "name": "BONUS. GET pagination ?page=1&limit=2",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users?page=1&limit=2",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"],
          "query": [
            { "key": "page",  "value": "1" },
            { "key": "limit", "value": "2" }
          ]
        }
      },
      "response": []
    }
  ]
}
```

API REST de gestion d'utilisateurs construite avec **Node.js** et **Express.js**, architecture **MVC**.

---

## Prérequis

- Node.js v18+
- npm
- Postman (ou Insomnia)

---

## Installation & démarrage

```bash
npm install
npm run dev     # avec rechargement automatique (nodemon)
# ou
npm start       # sans rechargement
```

Serveur disponible sur : `http://localhost:3001`

---

## Structure du projet

```
fullstack-backend/
├── data/
│   └── users.js              ← données en mémoire (3 utilisateurs initiaux)
├── models/
│   └── userModel.js          ← accès aux données (M)
├── controllers/
│   └── userController.js     ← logique métier + réponses HTTP (C)
├── routes/
│   └── users.js              ← câblage URL ↔ controller (≤ 10 lignes)
├── server.js                 ← point d'entrée, middlewares, listen
└── package.json
```

---

## Endpoints

| Méthode  | Route              | Statut succès | Description                        |
|----------|--------------------|---------------|------------------------------------|
| `GET`    | `/api/users`       | `200`         | Lister tous les utilisateurs       |
| `GET`    | `/api/users/:id`   | `200`         | Obtenir un utilisateur par id      |
| `POST`   | `/api/users`       | `201`         | Créer un nouvel utilisateur        |
| `PUT`    | `/api/users/:id`   | `200`         | Mettre à jour un utilisateur       |
| `DELETE` | `/api/users/:id`   | `204`         | Supprimer un utilisateur           |

### Query parameters (Bonus A)

```
GET /api/users?role=admin   → filtre par rôle
GET /api/users?role=user    → filtre par rôle
```

---

## Modèle utilisateur

```json
{
  "id": 1,
  "name": "Alice Martin",
  "email": "alice@example.com",
  "role": "admin",
  "createdAt": "2024-01-15"
}
```

---

## Scénario de test complet — 7 étapes

> Importer la collection Postman disponible en bas de ce fichier (`postman_collection.json`).  
> Exécuter les requêtes **dans l'ordre** ci-dessous.

---

### Test 1 — `GET /api/users` — Lister les 3 utilisateurs initiaux

**Méthode :** `GET`  
**URL :** `http://localhost:3001/api/users`  
**Body :** aucun  
**Statut attendu :** `200 OK`

**Réponse attendue :**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "id": 1, "name": "Alice Martin",   "email": "alice@example.com",  "role": "admin", "createdAt": "2024-01-15" },
    { "id": 2, "name": "Jean Dupont",    "email": "jean@example.com",   "role": "user",  "createdAt": "2024-02-10" },
    { "id": 3, "name": "Sophie Bernard", "email": "sophie@example.com", "role": "user",  "createdAt": "2024-03-01" }
  ]
}
```

✅ Vérifier : `count` vaut `3` et `success` vaut `true`.

---

### Test 2 — `POST /api/users` — Créer un nouvel utilisateur

**Méthode :** `POST`  
**URL :** `http://localhost:3001/api/users`  
**Headers :** `Content-Type: application/json`  
**Body (raw JSON) :**
```json
{
  "name": "Bob Dupont",
  "email": "bob@example.com",
  "role": "user"
}
```
**Statut attendu :** `201 Created`

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Bob Dupont",
    "email": "bob@example.com",
    "role": "user",
    "createdAt": "2026-03-05"
  }
}
```

✅ Vérifier : statut `201`, `id` généré automatiquement (ici `4`).  
📝 **Noter l'`id` retourné** — il sera utilisé dans les tests suivants.

---

### Test 3 — `GET /api/users/4` — Récupérer l'utilisateur créé

**Méthode :** `GET`  
**URL :** `http://localhost:3001/api/users/4`  
**Body :** aucun  
**Statut attendu :** `200 OK`

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Bob Dupont",
    "email": "bob@example.com",
    "role": "user",
    "createdAt": "2026-03-05"
  }
}
```

✅ Vérifier : l'utilisateur créé à l'étape 2 est bien retrouvable par son `id`.

---

### Test 4 — `PUT /api/users/4` — Modifier le rôle de Bob

**Méthode :** `PUT`  
**URL :** `http://localhost:3001/api/users/4`  
**Headers :** `Content-Type: application/json`  
**Body (raw JSON) :**
```json
{
  "role": "admin"
}
```
**Statut attendu :** `200 OK`

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Bob Dupont",
    "email": "bob@example.com",
    "role": "admin",
    "createdAt": "2026-03-05"
  }
}
```

✅ Vérifier : `role` est passé de `"user"` à `"admin"`. Les autres champs sont inchangés.  
✅ Vérifier : `id` et `createdAt` **n'ont pas changé** (non modifiables).

---

### Test 5 — `GET /api/users` — Vérifier qu'il y a maintenant 4 utilisateurs

**Méthode :** `GET`  
**URL :** `http://localhost:3001/api/users`  
**Body :** aucun  
**Statut attendu :** `200 OK`

**Réponse attendue :**
```json
{
  "success": true,
  "count": 4,
  "data": [
    { "id": 1, "name": "Alice Martin",   "role": "admin" },
    { "id": 2, "name": "Jean Dupont",    "role": "user" },
    { "id": 3, "name": "Sophie Bernard", "role": "user" },
    { "id": 4, "name": "Bob Dupont",     "role": "admin" }
  ]
}
```

✅ Vérifier : `count` vaut `4`.

---

### Test 6 — `DELETE /api/users/4` — Supprimer Bob

**Méthode :** `DELETE`  
**URL :** `http://localhost:3001/api/users/4`  
**Body :** aucun  
**Statut attendu :** `204 No Content`

**Réponse attendue :** aucun corps de réponse (vide).

✅ Vérifier : statut `204` et le **body est vide**.

---

### Test 7 — `GET /api/users/4` — Vérifier que Bob n'existe plus (404)

**Méthode :** `GET`  
**URL :** `http://localhost:3001/api/users/4`  
**Body :** aucun  
**Statut attendu :** `404 Not Found`

**Réponse attendue :**
```json
{
  "success": false,
  "message": "Utilisateur non trouvé"
}
```

✅ Vérifier : statut `404` et `"success": false`.

---

## Tests des cas d'erreur

| # | Requête | Statut attendu | Message retourné |
|---|---------|---------------|-----------------|
| E1 | `POST /api/users` avec body `{}` | `400 Bad Request` | `"Les champs 'name' et 'email' sont obligatoires"` |
| E2 | `GET /api/users/9999` | `404 Not Found` | `"Utilisateur non trouvé"` |
| E3 | `PUT /api/users/9999` | `404 Not Found` | `"Utilisateur non trouvé"` |
| E4 | `DELETE /api/users/9999` | `404 Not Found` | `"Utilisateur non trouvé"` |
| E5 | `POST /api/users` avec email déjà existant | `409 Conflict` | `"Cet email est déjà utilisé par un autre utilisateur"` |

---

## Bonus implémentés

### Bonus A — Filtrage par rôle

```
GET http://localhost:3001/api/users?role=admin
GET http://localhost:3001/api/users?role=user
```

### Bonus B — Email unique (409 Conflict)

Un `POST` ou `PUT` avec un email déjà utilisé retourne `409`.

### Bonus C — Middleware de logging

Chaque requête est loggée dans le terminal du serveur :
```
[2026-03-05 11:14:59] GET    /api/users   - 200 - 1ms
[2026-03-05 11:14:59] POST   /api/users   - 201 - 1ms
[2026-03-05 11:14:59] DELETE /api/users/4 - 204 - 0ms
```

---

## Collection Postman (import JSON)

Sauvegarder le contenu ci-dessous dans un fichier `TP2_Postman_Collection.json`  
puis l'importer dans Postman via **File → Import**.

```json
{
  "info": {
    "name": "TP2 - API Utilisateurs",
    "description": "Collection de tests pour le TP Séance 2 - Backend Fundamentals",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. GET tous les utilisateurs (200)",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"]
        }
      },
      "response": []
    },
    {
      "name": "2. POST créer Bob Dupont (201)",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Bob Dupont\",\n  \"email\": \"bob@example.com\",\n  \"role\": \"user\"\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": {
          "raw": "http://localhost:3001/api/users",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"]
        }
      },
      "response": []
    },
    {
      "name": "3. GET utilisateur id=4 (200)",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users/4",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "4"]
        }
      },
      "response": []
    },
    {
      "name": "4. PUT modifier rôle id=4 → admin (200)",
      "request": {
        "method": "PUT",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"role\": \"admin\"\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": {
          "raw": "http://localhost:3001/api/users/4",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "4"]
        }
      },
      "response": []
    },
    {
      "name": "5. GET tous les utilisateurs → count=4 (200)",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"]
        }
      },
      "response": []
    },
    {
      "name": "6. DELETE utilisateur id=4 (204)",
      "request": {
        "method": "DELETE",
        "url": {
          "raw": "http://localhost:3001/api/users/4",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "4"]
        }
      },
      "response": []
    },
    {
      "name": "7. GET utilisateur id=4 → 404",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users/4",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "4"]
        }
      },
      "response": []
    },
    {
      "name": "ERR1. POST sans body → 400",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{}",
          "options": { "raw": { "language": "json" } }
        },
        "url": {
          "raw": "http://localhost:3001/api/users",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"]
        }
      },
      "response": []
    },
    {
      "name": "ERR2. GET id=9999 → 404",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users/9999",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "9999"]
        }
      },
      "response": []
    },
    {
      "name": "ERR3. PUT id=9999 → 404",
      "request": {
        "method": "PUT",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"role\": \"admin\"\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": {
          "raw": "http://localhost:3001/api/users/9999",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "9999"]
        }
      },
      "response": []
    },
    {
      "name": "ERR4. DELETE id=9999 → 404",
      "request": {
        "method": "DELETE",
        "url": {
          "raw": "http://localhost:3001/api/users/9999",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users", "9999"]
        }
      },
      "response": []
    },
    {
      "name": "BONUS. GET filtrage ?role=admin (200)",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/users?role=admin",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "users"],
          "query": [
            { "key": "role", "value": "admin" }
          ]
        }
      },
      "response": []
    }
  ]
}
```

---

## Logs serveur — Preuve d'exécution des 7 tests

```
[2026-03-05 11:14:59] GET    /              - 200 - 3ms
[2026-03-05 11:14:59] POST   /              - 201 - 1ms   ← Test 2 : Bob créé (id=4)
[2026-03-05 11:14:59] GET    /4             - 200 - 0ms   ← Test 3
[2026-03-05 11:14:59] PUT    /4             - 200 - 0ms   ← Test 4 : role → admin
[2026-03-05 11:14:59] GET    /              - 200 - 1ms   ← Test 5 : count=4
[2026-03-05 11:14:59] DELETE /4             - 204 - 0ms   ← Test 6
[2026-03-05 11:14:59] GET    /4             - 404 - 0ms   ← Test 7 : 404 ✓
[2026-03-05 11:14:59] POST   /              - 400 - 1ms   ← ERR1 : body vide
[2026-03-05 11:14:59] GET    /9999          - 404 - 0ms   ← ERR2
[2026-03-05 11:14:59] PUT    /9999          - 404 - 0ms   ← ERR3
[2026-03-05 11:14:59] DELETE /9999          - 404 - 0ms   ← ERR4
[2026-03-05 11:14:59] GET    /?role=admin   - 200 - 0ms   ← Bonus A
```
