/**
 * models/userModel.js
 * -------------------------------------------------
 * Couche MODEL (M de MVC)
 *
 * Seule responsabilité : manipuler le tableau de
 * données. Aucune notion de requête HTTP ici
 * (pas de req, pas de res).
 *
 * Fonctions exposées :
 *   getAll(role?)     → tableau d'utilisateurs
 *   getById(id)       → utilisateur | undefined
 *   emailExists(email, excludeId?) → bool
 *   create(data)      → nouvel utilisateur
 *   update(id, data)  → utilisateur mis à jour | null
 *   remove(id)        → true | false
 * -------------------------------------------------
 */

const users = require('../data/users');

// Compteur d'ID auto-incrémenté
// Part de 4 car les données initiales vont jusqu'à 3
let nextId = 4;

const userModel = {

  /**
   * Retourne tous les utilisateurs.
   * Si `role` est fourni, filtre sur ce rôle.
   * → Utilisé aussi pour le Bonus A (filtrage par rôle)
   */
  getAll(role = null) {
    if (role) {
      return users.filter(u => u.role === role);
    }
    return users;
  },

  /**
   * Retourne l'utilisateur dont l'id correspond,
   * ou undefined si inexistant.
   */
  getById(id) {
    return users.find(u => u.id === id);
  },

  /**
   * Vérifie si un email est déjà pris.
   * `excludeId` permet d'ignorer l'utilisateur
   * en cours de modification (PUT).
   */
  emailExists(email, excludeId = null) {
    return !!users.find(u => u.email === email && u.id !== excludeId);
  },

  /**
   * Crée un utilisateur, l'ajoute au tableau
   * et retourne l'objet créé.
   */
  create({ name, email, role = 'user' }) {
    const newUser = {
      id: nextId++,
      name,
      email,
      role,
      createdAt: new Date().toISOString().split('T')[0] // "YYYY-MM-DD"
    };
    users.push(newUser);
    return newUser;
  },

  /**
   * Mise à jour partielle : seuls les champs
   * présents dans `data` sont modifiés.
   * `id` et `createdAt` sont volontairement exclus.
   * Retourne l'utilisateur mis à jour, ou null.
   */
  update(id, data) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const allowed = ['name', 'email', 'role'];
    allowed.forEach(field => {
      if (data[field] !== undefined) {
        users[index][field] = data[field];
      }
    });

    return users[index];
  },

  /**
   * Supprime l'utilisateur du tableau.
   * Retourne true si supprimé, false si introuvable.
   */
  remove(id) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  }

};

module.exports = userModel;
