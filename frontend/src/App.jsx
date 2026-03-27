/**
 * src/App.jsx
 * ─────────────────────────────────────────────────
 * Composant racine — "Chef d'orchestre" de l'application.
 *
 * Responsabilités :
 *   1. Gérer les states globaux (users, loading, error…)
 *   2. Effectuer les appels API via userService
 *   3. Passer les données et handlers aux composants enfants
 *
 * Flux des données (unidirectionnel — règle React fondamentale) :
 *   App → props → Navbar / UserForm / UserList → UserCard
 *                                                    ↓
 *   App ← callbacks ←─────────────────────────── onDelete/onEdit
 *
 * Bonus implémentés :
 *   - Modification d'utilisateur (selectedUser + handleUpdate)
 *   - Filtrage côté client par rôle (filterRole)
 *   - Message de succès temporaire
 *   - Désactivation des boutons pendant les opérations API
 * ─────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react'
import userService from './services/userService.js'
import Navbar    from './components/Navbar.jsx'
import UserForm  from './components/UserForm.jsx'
import UserList  from './components/UserList.jsx'

function App() {
  // ── States principaux ──────────────────────────

  /** @type {[Array, Function]} Liste complète des utilisateurs */
  const [users, setUsers] = useState([])

  /** @type {[boolean, Function]} Chargement initial de la liste */
  const [loading, setLoading] = useState(true)

  /**
   * loadError : erreur lors du chargement initial de la liste.
   * Affiché dans UserList (là où la liste devrait être).
   */
  const [loadError, setLoadError] = useState(null)

  /**
   * error : erreur lors d'une opération formulaire (create/update/delete).
   * Affiché uniquement dans l'alerte globale, jamais dans UserList.
   */
  const [error, setError] = useState(null)

  /** @type {[boolean, Function]} true pendant une opération create/update */
  const [isOperating, setIsOperating] = useState(false)

  /** @type {[string|null, Function]} _id de l'utilisateur en cours de suppression */
  const [deletingId, setDeletingId] = useState(null)

  // ── States bonus ───────────────────────────────

  /** @type {[object|null, Function]} Utilisateur sélectionné pour édition */
  const [selectedUser, setSelectedUser] = useState(null)

  /** @type {[string, Function]} Filtre actif : 'all' | 'admin' | 'user' */
  const [filterRole, setFilterRole] = useState('all')

  /** @type {[string|null, Function]} Message de succès temporaire */
  const [successMessage, setSuccessMessage] = useState(null)

  // ── Chargement initial ─────────────────────────
  // useEffect avec [] → s'exécute UNE SEULE FOIS au montage du composant.
  useEffect(() => {
    loadUsers()
  }, [])

  /**
   * Charge la liste complète des utilisateurs depuis le backend.
   * Met à jour users, loading, error en conséquence.
   */
  async function loadUsers() {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await userService.getAll()
      setUsers(data)
    } catch (err) {
      // Erreur de chargement → stockée séparément, affichée dans UserList
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Handlers CRUD ──────────────────────────────

  /**
   * Crée un nouvel utilisateur.
   * Ajoute le résultat directement dans le state sans recharger la liste.
   * @param {{ name: string, email: string, role: string }} formData
   */
  async function handleCreate(formData) {
    setIsOperating(true)
    setError(null)
    try {
      const newUser = await userService.create(formData)
      // Mise à jour optimiste : ajoute à la liste existante
      setUsers((prev) => [...prev, newUser])
      showSuccess(`✅ "${newUser.name}" a été créé avec succès.`)
    } catch (err) {
      setError(err.message)
      // On relance pour que UserForm sache que la soumission a échoué
      // et ne vide PAS les champs (l'utilisateur peut corriger et réessayer)
      throw err
    } finally {
      setIsOperating(false)
    }
  }

  /**
   * Met à jour un utilisateur existant (bonus).
   * @param {{ name: string, email: string, role: string }} formData
   */
  async function handleUpdate(formData) {
    if (!selectedUser) return
    setIsOperating(true)
    setError(null)
    try {
      const updated = await userService.update(selectedUser._id, formData)
      // Remplace l'ancien objet par le nouveau dans le state
      setUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u))
      )
      showSuccess(`✅ "${updated.name}" a été modifié.`)
      setSelectedUser(null) // Quitter le mode édition
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsOperating(false)
    }
  }

  /**
   * Supprime un utilisateur.
   * La confirmation window.confirm est gérée dans UserCard.
   * @param {string} id — ObjectId MongoDB
   */
  async function handleDelete(id) {
    setDeletingId(id)   // ← seule cette carte sera désactivée
    setError(null)
    try {
      await userService.remove(id)
      // Retire l'utilisateur du state sans recharger
      setUsers((prev) => prev.filter((u) => u._id !== id))
      showSuccess('🗑 Utilisateur supprimé.')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  /**
   * Sélectionne un utilisateur pour l'édition (bonus).
   * UserForm détecte initialData !== null et se pré-remplit.
   */
  function handleEdit(user) {
    setSelectedUser(user)
    // Scroll vers le formulaire pour la commodité
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /** Annule le mode édition */
  function handleCancelEdit() {
    setSelectedUser(null)
    setError(null)
  }

  /**
   * Affiche un message de succès pendant 3 secondes.
   */
  function showSuccess(message) {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // ── Filtrage côté client (bonus) ───────────────
  // Pas besoin de requête API supplémentaire :
  // on filtre le tableau "users" déjà en mémoire.
  const filteredUsers =
    filterRole === 'all'
      ? users
      : users.filter((u) => u.role === filterRole)

  // ── Rendu ──────────────────────────────────────
  return (
    <>
      {/* Barre de navigation avec compteur d'utilisateurs filtrés */}
      <Navbar count={filteredUsers.length} />

      <main className="app-container">

        {/* ── Notifications ── */}
        {successMessage && (
          <div className="alert alert--success">{successMessage}</div>
        )}
        {error && !loading && (
          <div className="alert alert--error">⚠️ {error}</div>
        )}

        {/* ── Formulaire création / édition ── */}
        <UserForm
          onSubmit={selectedUser ? handleUpdate : handleCreate}
          initialData={selectedUser}
          isLoading={isOperating}
          onCancelEdit={handleCancelEdit}
        />

        {/* ── Séparateur ── */}
        <div className="section-divider" />

        {/* ── En-tête de section : titre + filtres ── */}
        <div className="section-header">
          <h2 className="section-header__title">
            {filterRole === 'all'
              ? 'Tous les utilisateurs'
              : `Utilisateurs — ${filterRole}`}
            <span className="section-header__count">({filteredUsers.length})</span>
          </h2>

          {/* ── Filtres par rôle (bonus) ── */}
          <div className="filter-bar">
            <span className="filter-bar__label">Filtrer :</span>
            {['all', 'admin', 'user'].map((role) => (
              <button
                key={role}
                className={`filter-btn${filterRole === role ? ' filter-btn--active' : ''}`}
                onClick={() => setFilterRole(role)}
              >
                {role === 'all' ? 'Tous' : role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Liste des utilisateurs ── */}
        {/* loadError uniquement — les erreurs de formulaire n'apparaissent pas ici */}
        <UserList
          users={filteredUsers}
          loading={loading}
          error={loadError}
          onDelete={handleDelete}
          onEdit={handleEdit}
          isOperating={isOperating}
          deletingId={deletingId}
        />

      </main>
    </>
  )
}

export default App
