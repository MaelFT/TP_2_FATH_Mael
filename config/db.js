/**
 * config/db.js
 * -------------------------------------------------
 * Connexion à MongoDB via Mongoose.
 *
 * On exporte une fonction `connectDB` appelée une
 * seule fois au démarrage de server.js.
 *
 * Bonnes pratiques :
 *   - URI stockée dans .env (jamais en dur dans le code)
 *   - process.exit(1) en cas d'échec → le serveur
 *     ne démarre pas sans base de données
 * -------------------------------------------------
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect() retourne une Promise — on attend la connexion
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅  MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  Erreur de connexion MongoDB : ${error.message}`);
    // Code 1 = erreur — arrête le processus Node
    process.exit(1);
  }
};

module.exports = connectDB;
