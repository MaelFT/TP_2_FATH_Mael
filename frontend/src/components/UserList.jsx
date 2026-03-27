/**
 * src/components/UserList.jsx
 * ─────────────────────────────────────────────────
 * Affiche la liste des utilisateurs sous forme de grille.
 * Gère les états : chargement, erreur, liste vide, liste remplie.
 *
 * Props :
 *   users      {Array}     — tableau d'utilisateurs filtrés
 *   loading    {boolean}   — true pendant le chargement API
 *   error      {string}    — message d'erreur si requête échouée
 *   onDelete   {function}  — transmis à chaque UserCard
 *   onEdit     {function}  — (bonus) transmis à chaque UserCard
 *   isLoading  {boolean}   — désactive les boutons pendant une opération
 * ─────────────────────────────────────────────────
 */

import UserCard from './UserCard.jsx'

/**
 * Props mises à jour :
 *   isOperating  {boolean}   — true pendant création/mise à jour → désactive boutons Éditer
 *   deletingId   {string}    — _id de l'utilisateur en cours de suppression
 */
function UserList({ users, loading, error, onDelete, onEdit, isOperating, deletingId }) {
  // ── État : chargement en cours ─────────────────
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" role="status" aria-label="Chargement..." />
      </div>
    )
  }

  // ── État : erreur de chargement ────────────────
  if (error) {
    return (
      <p className="state-message state-message--error">
        ⚠️ {error}
      </p>
    )
  }

  // ── État : liste vide ──────────────────────────
  if (users.length === 0) {
    return (
      <p className="state-message">
        😔 Aucun utilisateur trouvé.
      </p>
    )
  }

  // ── État : liste remplie ──────────────────────
  return (
    // Grille CSS responsive : auto-fill, min 280px par carte
    <div className="user-grid">
      {users.map((user) => (
        <UserCard
          key={user._id}               // _id MongoDB comme clé unique React
          user={user}
          onDelete={onDelete}
          onEdit={onEdit}
          isDeleting={deletingId === user._id}   // seule cette carte est en cours
          isOperating={isOperating}              // désactive Éditer pendant create/update
        />
      ))}
    </div>
  )
}

export default UserList
