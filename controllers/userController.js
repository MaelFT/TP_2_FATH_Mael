/**
 * controllers/userController.js
 * -------------------------------------------------
 * Couche CONTROLLER (C de MVC)
 *
 * Responsabilités :
 *   - Lire req.params / req.body / req.query
 *   - Valider les données (400, 404, 409…)
 *   - Appeler le Model pour accéder aux données
 *   - Envoyer la réponse HTTP appropriée via res
 *
 * Le controller ne touche PAS directement au tableau
 * de données — il délègue au Model.
 * -------------------------------------------------
 */

const userModel = require('../models/userModel');

const userController = {

  // ─────────────────────────────────────────────
  // GET /api/users
  // Retourne tous les utilisateurs (+ filtre rôle)
  // ─────────────────────────────────────────────
  getAllUsers(req, res) {
    const { role } = req.query; // Bonus A : ?role=admin
    const users = userModel.getAll(role || null);

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  },

  // ─────────────────────────────────────────────
  // GET /api/users/:id
  // Retourne un utilisateur par son id
  // ─────────────────────────────────────────────
  getUserById(req, res) {
    // ⚠️ req.params.id est toujours une STRING → parseInt
    const id = parseInt(req.params.id, 10);
    const user = userModel.getById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  },

  // ─────────────────────────────────────────────
  // POST /api/users
  // Crée un nouvel utilisateur
  // ─────────────────────────────────────────────
  createUser(req, res) {
    const { name, email, role } = req.body;

    // Validation : champs obligatoires
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Les champs 'name' et 'email' sont obligatoires"
      });
    }

    // Bonus B : email unique
    if (userModel.emailExists(email)) {
      return res.status(409).json({
        success: false,
        message: "Cet email est déjà utilisé par un autre utilisateur"
      });
    }

    const newUser = userModel.create({ name, email, role });

    return res.status(201).json({
      success: true,
      data: newUser
    });
  },

  // ─────────────────────────────────────────────
  // PUT /api/users/:id
  // Mise à jour partielle d'un utilisateur
  // ─────────────────────────────────────────────
  updateUser(req, res) {
    const id = parseInt(req.params.id, 10);

    // Vérifier que l'utilisateur existe
    const existing = userModel.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    const { email } = req.body;

    // Bonus B : si l'email change, vérifier l'unicité
    // excludeId = id → ne pas se comparer à soi-même
    if (email && email !== existing.email) {
      if (userModel.emailExists(email, id)) {
        return res.status(409).json({
          success: false,
          message: "Cet email est déjà utilisé par un autre utilisateur"
        });
      }
    }

    const updated = userModel.update(id, req.body);

    return res.status(200).json({
      success: true,
      data: updated
    });
  },

  // ─────────────────────────────────────────────
  // DELETE /api/users/:id
  // Supprime un utilisateur
  // ─────────────────────────────────────────────
  deleteUser(req, res) {
    const id = parseInt(req.params.id, 10);
    const deleted = userModel.remove(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // 204 No Content → pas de corps de réponse
    return res.status(204).send();
  }

};

module.exports = userController;
