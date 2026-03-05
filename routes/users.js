/**
 * routes/users.js
 * -------------------------------------------------
 * Couche ROUTE
 *
 * Rôle unique : associer les verbes HTTP aux
 * fonctions du Controller. Aucune logique ici.
 *
 * Objectif ≤ 10 lignes de code utile ✓
 * -------------------------------------------------
 */

const { Router } = require('express');
const c = require('../controllers/userController');

const router = Router();

router.get('/',     c.getAllUsers);    // GET    /api/users
router.get('/:id',  c.getUserById);   // GET    /api/users/:id
router.post('/',    c.createUser);    // POST   /api/users
router.put('/:id',  c.updateUser);    // PUT    /api/users/:id
router.delete('/:id', c.deleteUser); // DELETE /api/users/:id

module.exports = router;
