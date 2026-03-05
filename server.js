/**
 * server.js
 * -------------------------------------------------
 * Point d'entrée de l'application Express.
 *
 * Responsabilités :
 *   - Créer l'application Express
 *   - Enregistrer les middlewares globaux
 *   - Monter les routeurs
 *   - Démarrer le serveur HTTP
 * -------------------------------------------------
 */

const express = require('express');

const app  = express();
const PORT = 3001;

// ─────────────────────────────────────────────────
// Middlewares globaux
// ─────────────────────────────────────────────────

/**
 * express.json()
 * Permet de lire le corps des requêtes POST / PUT
 * au format JSON (Content-Type: application/json).
 * Sans ce middleware, req.body serait undefined.
 */
app.use(express.json());

/**
 * Bonus C — Middleware de logging
 *
 * S'exécute avant chaque route.
 * Utilise l'événement 'finish' de res pour
 * afficher le statut HTTP ET le temps de réponse.
 *
 * Format : [YYYY-MM-DD HH:MM:SS] METHOD /path - STATUS - Xms
 */
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const ms        = Date.now() - startedAt;
    const timestamp = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    console.log(
      `[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} - ${ms}ms`
    );
  });

  next(); // ← Ne pas oublier ! Sinon la requête reste bloquée.
});

// ─────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────

const usersRouter = require('./routes/users');

// Toutes les routes /api/users/* sont gérées par usersRouter
app.use('/api/users', usersRouter);

/**
 * Route de sanité — vérifie que le serveur tourne
 * GET http://localhost:3001/
 */
app.get('/', (_req, res) => {
  res.status(200).json({
    message: "API Gestion Utilisateurs — TP Séance 2",
    status:  "running",
    endpoints: {
      "GET    /api/users":        "Lister tous les utilisateurs",
      "GET    /api/users/:id":    "Obtenir un utilisateur",
      "POST   /api/users":        "Créer un utilisateur",
      "PUT    /api/users/:id":    "Modifier un utilisateur",
      "DELETE /api/users/:id":    "Supprimer un utilisateur",
      "GET    /api/users?role=X": "Filtrer par rôle (bonus)"
    }
  });
});

// ─────────────────────────────────────────────────
// Démarrage
// ─────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀  Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📚  Endpoints disponibles :`);
  console.log(`    GET    http://localhost:${PORT}/api/users`);
  console.log(`    GET    http://localhost:${PORT}/api/users/:id`);
  console.log(`    POST   http://localhost:${PORT}/api/users`);
  console.log(`    PUT    http://localhost:${PORT}/api/users/:id`);
  console.log(`    DELETE http://localhost:${PORT}/api/users/:id\n`);
});
