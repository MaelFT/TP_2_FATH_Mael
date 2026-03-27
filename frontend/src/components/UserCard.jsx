/**
 * src/components/UserCard.jsx
 * ─────────────────────────────────────────────────
 * Affiche un utilisateur sous forme de carte.
 *
 * Props :
 *   user       {object}    — objet utilisateur MongoDB
 *   onDelete   {function}  — appelé avec user._id au clic "Supprimer"
 *   onEdit     {function}  — (bonus) appelé avec l'objet user pour pré-remplir le form
 *   isLoading  {boolean}   — désactive les boutons pendant requêtes
 *
 * Style :
 *   - .user-card--admin → bordure rouge (rôle admin visuellement distinct)
 *   - .user-card--user  → bordure grise (rôle standard)
 * ─────────────────────────────────────────────────
 */

/**
 * Formate une date ISO en date française lisible.
 * ex: "2024-03-15T10:30:00.000Z" → "15/03/2024"
 */
function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  })
}

/**
 * Props mise à jour :
 *   isDeleting   {boolean}  — true uniquement pour la carte en cours de suppression
 *   isOperating  {boolean}  — true pendant create/update → désactive le bouton Éditer
 */
function UserCard({ user, onDelete, onEdit, isDeleting = false, isOperating = false }) {
  // Choisit la classe CSS selon le rôle
  const cardClass = `user-card user-card--${user.role}${isDeleting ? ' user-card--deleting' : ''}`
  const badgeClass = `user-card__role-badge role-badge--${user.role}`

  // Confirmation native avant suppression définitive (bonus UX)
  function handleDeleteClick() {
    const confirmed = window.confirm(
      `Supprimer l'utilisateur "${user.name}" ?\nCette action est irréversible.`
    )
    if (confirmed) onDelete(user._id)
  }

  return (
    <div className={cardClass}>
      {/* En-tête : nom + badge de rôle */}
      <div className="user-card__header">
        <span className="user-card__name">{user.name}</span>
        <span className={badgeClass}>{user.role}</span>
      </div>

      {/* Email */}
      <p className="user-card__email">📧 {user.email}</p>

      {/* Date de création formatée */}
      <p className="user-card__date">
        🗓 Créé le {formatDate(user.createdAt)}
      </p>

      {/* Boutons d'action */}
      <div className="user-card__actions">
        {/* Bouton Modifier (bonus) — affiché seulement si onEdit est fourni */}
        {onEdit && (
          <button
            className="btn btn--edit"
            onClick={() => onEdit(user)}
            disabled={isDeleting || isOperating}  // désactivé pendant toute opération
          >
            ✏️ Modifier
          </button>
        )}

        {/* Bouton Supprimer : affiche un spinner quand cette carte est en cours */}
        <button
          className="btn btn--danger"
          onClick={handleDeleteClick}
          disabled={isDeleting || isOperating}
          aria-busy={isDeleting}
        >
          {isDeleting ? '⏳ ...' : '🗑 Supprimer'}
        </button>
      </div>
    </div>
  )
}

export default UserCard
