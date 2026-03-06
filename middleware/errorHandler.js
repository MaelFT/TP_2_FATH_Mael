/**
 * middleware/errorHandler.js
 * -------------------------------------------------
 * Middleware Express de gestion centralisée des erreurs.
 *
 * Il doit être monté EN DERNIER dans server.js,
 * après toutes les routes.
 *
 * Signature à 4 paramètres obligatoire pour qu'Express
 * le reconnaisse comme middleware d'erreurs.
 *
 * Les routes appellent next(error) pour y arriver.
 * -------------------------------------------------
 */

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Log interne (utile pour le débogage)
  console.error(`[ERROR] ${req.method} ${req.url} →`, err.message);

  // ── Erreur de validation Mongoose ────────────
  // Déclenchée par required, enum, minlength…
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }

  // ── Clé dupliquée MongoDB (index unique) ─────
  // code 11000 = E11000 duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `La valeur du champ '${field}' est déjà utilisée`
    });
  }

  // ── ObjectId malformé (cast Mongoose) ────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({
      success: false,
      message: `ObjectId invalide : "${err.value}"`
    });
  }

  // ── Erreur générique ─────────────────────────
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Erreur interne du serveur" : err.message
  });
};

module.exports = errorHandler;
