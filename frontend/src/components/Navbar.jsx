/**
 * src/components/Navbar.jsx
 * ─────────────────────────────────────────────────
 * Barre de navigation supérieure.
 *
 * Props :
 *   count  {number}  — nombre total d'utilisateurs affichés
 *
 * Utilisation :
 *   <Navbar count={users.length} />
 * ─────────────────────────────────────────────────
 */

function Navbar({ count }) {
  return (
    <nav className="navbar">
      {/* Titre de l'application */}
      <span className="navbar__title">👥 Gestion des utilisateurs</span>

      {/* Badge dynamique affichant le nombre d'utilisateurs */}
      <span className="navbar__badge">
        {count} utilisateur{count !== 1 ? 's' : ''}
      </span>
    </nav>
  )
}

export default Navbar
