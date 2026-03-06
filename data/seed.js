/**
 * data/seed.js
 * -------------------------------------------------
 * Script d'initialisation de la base de données.
 *
 * Ce script est indépendant du serveur Express :
 * il se connecte à MongoDB, insère des données de
 * test, puis ferme la connexion et s'arrête.
 *
 * Utilisation :
 *   node data/seed.js
 *
 * Idempotent : n'insère les données que si la
 * collection est vide → safe à relancer.
 * -------------------------------------------------
 */

require('dotenv').config(); // charge .env avant tout

const mongoose = require('mongoose');
const User     = require('../models/userModel');

// Données initiales (mêmes que l'ancien data/users.js)
const seedUsers = [
  {
    name:      "Alice Martin",
    email:     "alice@example.com",
    role:      "admin",
    createdAt: new Date("2024-01-15")
  },
  {
    name:      "Jean Dupont",
    email:     "jean@example.com",
    role:      "user",
    createdAt: new Date("2024-02-10")
  },
  {
    name:      "Sophie Bernard",
    email:     "sophie@example.com",
    role:      "user",
    createdAt: new Date("2024-03-01")
  }
];

const seed = async () => {
  try {
    // 1. Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  Connecté à MongoDB');

    // 2. Vérifier si la collection est déjà peuplée
    const count = await User.countDocuments();

    if (count > 0) {
      console.log(`ℹ️   La collection contient déjà ${count} utilisateur(s). Seed ignoré.`);
      console.log('    (supprimez les données manuellement pour relancer le seed)');
    } else {
      // 3. Insérer les données initiales
      const inserted = await User.insertMany(seedUsers);
      console.log(`🌱  ${inserted.length} utilisateurs insérés avec succès :`);
      inserted.forEach(u => console.log(`    - [${u._id}] ${u.name} (${u.role})`));
    }
  } catch (error) {
    console.error('❌  Erreur lors du seed :', error.message);
    process.exit(1);
  } finally {
    // 4. Fermer la connexion dans tous les cas
    await mongoose.connection.close();
    console.log('🔌  Connexion MongoDB fermée');
  }
};

seed();
