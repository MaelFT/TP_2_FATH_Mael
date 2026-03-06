/**
 * models/userModel.js
 * -------------------------------------------------
 * Schéma et Modèle Mongoose pour les utilisateurs.
 *
 * Mongoose fait le lien entre JavaScript et MongoDB :
 *   - SchemaType  → définit le type et les règles
 *   - Model       → objet JS avec les méthodes CRUD
 *
 * MongoDB génère automatiquement le champ `_id`
 * (ObjectId) qui remplace l'ancien `id` numérique.
 * -------------------------------------------------
 */

const mongoose = require('mongoose');

// ─────────────────────────────────────────────────
// Définition du schéma
// ─────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Le champ 'name' est obligatoire"],
      trim:     true   // supprime les espaces en début/fin
    },

    email: {
      type:      String,
      required:  [true, "Le champ 'email' est obligatoire"],
      unique:    true,              // index unique dans MongoDB
      lowercase: true,              // normalise en minuscules avant save
      trim:      true
    },

    role: {
      type:    String,
      enum:    {
        values:  ['admin', 'user'],
        message: "Le rôle doit être 'admin' ou 'user'"
      },
      default: 'user'
    },

    createdAt: {
      type:    Date,
      default: Date.now  // ← référence, pas appel de fonction
    }
  },
  {
    // Désactive les champs __v (version interne Mongoose)
    // et versionKey pour garder les réponses propres
    versionKey: false
  }
);

// ─────────────────────────────────────────────────
// Export du modèle
// Mongoose crée la collection "users" (pluriel de "User")
// ─────────────────────────────────────────────────
module.exports = mongoose.model('User', userSchema);

