/**
 * controllers/userController.js
 * -------------------------------------------------
 * Couche CONTROLLER (C de MVC) — version MongoDB
 *
 * Chaque fonction est async/await car toutes les
 * opérations Mongoose sont asynchrones (I/O réseau).
 *
 * Gestion des erreurs :
 *   - try/catch sur chaque handler
 *   - ObjectId invalide → 400 Bad Request
 *   - Document introuvable → 404 Not Found
 *   - Email dupliqué (code 11000) → 409 Conflict
 *   - ValidationError Mongoose → 400
 *   - Autres erreurs → transmises au middleware global
 * -------------------------------------------------
 */

const mongoose = require('mongoose');
const User     = require('../models/userModel');

const userController = {

  // ─────────────────────────────────────────────
  // GET /api/users
  // Optionnel : ?role=admin  ?search=ali  ?page=1&limit=2
  // ─────────────────────────────────────────────
  async getAllUsers(req, res, next) {
    try {
      const { role, search, page, limit } = req.query;

      // Construction du filtre dynamique
      const filter = {};

      if (role) {
        filter.role = role; // filtre exact sur le rôle
      }

      if (search) {
        // Bonus — Recherche insensible à la casse dans le nom
        // new RegExp(search, 'i') → /ali/i → "Alice", "ALICIA"...
        filter.name = new RegExp(search, 'i');
      }

      // ── Bonus : Pagination ───────────────────
      if (page || limit) {
        const pageNum  = Math.max(1, parseInt(page)  || 1);
        const limitNum = Math.max(1, parseInt(limit) || 10);
        const skip     = (pageNum - 1) * limitNum;

        // Exécute les deux requêtes en parallèle (plus rapide)
        const [users, totalCount] = await Promise.all([
          User.find(filter).skip(skip).limit(limitNum),
          User.countDocuments(filter)
        ]);

        return res.status(200).json({
          success:    true,
          page:       pageNum,
          limit:      limitNum,
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
          data:       users
        });
      }
      // ─────────────────────────────────────────

      // Requête standard sans pagination
      const users = await User.find(filter);

      return res.status(200).json({
        success: true,
        count:   users.length,
        data:    users
      });

    } catch (error) {
      next(error); // transmet au middleware d'erreurs global
    }
  },

  // ─────────────────────────────────────────────
  // GET /api/users/:id
  // ─────────────────────────────────────────────
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      // Valider le format ObjectId AVANT la requête MongoDB
      // Évite l'erreur "Cast to ObjectId failed" de Mongoose
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: `ObjectId invalide : "${id}"`
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      return res.status(200).json({
        success: true,
        data:    user
      });

    } catch (error) {
      next(error);
    }
  },

  // ─────────────────────────────────────────────
  // POST /api/users
  // ─────────────────────────────────────────────
  async createUser(req, res, next) {
    try {
      const { name, email, role } = req.body;

      // Validation manuelle pour un message d'erreur lisible
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: "Les champs 'name' et 'email' sont obligatoires"
        });
      }

      // User.create() = new User(data) + save()
      // Mongoose valide via le schéma avant d'insérer
      const newUser = await User.create({ name, email, role });

      return res.status(201).json({
        success: true,
        data:    newUser
      });

    } catch (error) {
      // Erreur MongoDB : index unique violé (email dupliqué)
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Cet email est déjà utilisé par un autre utilisateur"
        });
      }
      // Erreur de validation Mongoose (required, enum…)
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors).map(e => e.message).join(', ')
        });
      }
      next(error);
    }
  },

  // ─────────────────────────────────────────────
  // PUT /api/users/:id
  // ─────────────────────────────────────────────
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: `ObjectId invalide : "${id}"`
        });
      }

      // Protéger les champs immuables : l'appelant
      // ne peut pas écraser _id ou createdAt
      const { _id, createdAt, ...updateData } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        {
          new:            true,  // retourne le document APRÈS modification
          runValidators:  true   // rejoue les validations du schéma
        }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      return res.status(200).json({
        success: true,
        data:    updatedUser
      });

    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Cet email est déjà utilisé par un autre utilisateur"
        });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors).map(e => e.message).join(', ')
        });
      }
      next(error);
    }
  },

  // ─────────────────────────────────────────────
  // DELETE /api/users/:id
  // ─────────────────────────────────────────────
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: `ObjectId invalide : "${id}"`
        });
      }

      const deleted = await User.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      // 204 No Content → pas de corps de réponse
      return res.status(204).send();

    } catch (error) {
      next(error);
    }
  }

};

module.exports = userController;

