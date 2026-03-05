/**
 * data/users.js
 * -------------------------------------------------
 * Tableau stocké EN MÉMOIRE qui joue le rôle de
 * base de données pour ce TP.
 *
 * ⚠️  Ces données sont réinitialisées à chaque
 *     redémarrage du serveur (pas de persistance).
 * -------------------------------------------------
 */

const users = [
  {
    id: 1,
    name: "Alice Martin",
    email: "alice@example.com",
    role: "admin",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Jean Dupont",
    email: "jean@example.com",
    role: "user",
    createdAt: "2024-02-10"
  },
  {
    id: 3,
    name: "Sophie Bernard",
    email: "sophie@example.com",
    role: "user",
    createdAt: "2024-03-01"
  }
];

module.exports = users;
