/**
 * src/components/UserForm.jsx
 * ─────────────────────────────────────────────────
 * Formulaire contrôlé pour créer ou modifier un utilisateur.
 *
 * "Contrôlé" signifie que React est la source de vérité :
 *   - Chaque input a value={state} + onChange={handler}
 *   - On ne touche JAMAIS au DOM directement (pas de getElementById)
 *
 * Props :
 *   onSubmit       {function}  — appelé avec { name, email, role }
 *   initialData    {object}    — (bonus) pré-remplit le formulaire en mode édition
 *   isLoading      {boolean}   — désactive le bouton pendant la requête
 *   onCancelEdit   {function}  — (bonus) annule le mode édition
 *
 * Validation côté client :
 *   - name  : obligatoire
 *   - email : obligatoire + format email basique
 *   - role  : enum 'user' | 'admin'
 * ─────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react'

// Valeurs par défaut du formulaire vide
const EMPTY_FORM = { name: '', email: '', role: 'user' }

function UserForm({ onSubmit, initialData = null, isLoading = false, onCancelEdit }) {
  // ── State : valeurs des champs ─────────────────
  const [formData, setFormData] = useState(EMPTY_FORM)

  // ── State : erreurs de validation par champ ────
  const [fieldErrors, setFieldErrors] = useState({})

  // ── Effet : synchronise le formulaire quand initialData change ──
  // En mode édition, App.jsx passe selectedUser → le form se pré-remplit.
  // Quand selectedUser redevient null, le form se vide.
  useEffect(() => {
    if (initialData) {
      // Pré-remplir avec les données de l'utilisateur sélectionné
      setFormData({
        name:  initialData.name  || '',
        email: initialData.email || '',
        role:  initialData.role  || 'user',
      })
    } else {
      // Mode création : vider le formulaire
      setFormData(EMPTY_FORM)
    }
    // Effacer les erreurs à chaque changement de mode
    setFieldErrors({})
  }, [initialData])

  // ── Gestionnaire de changement générique ──────
  // Une seule fonction pour tous les inputs (pattern React standard).
  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Effacer l'erreur du champ en cours de saisie
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // ── Validation ────────────────────────────────
  function validate() {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Le nom est obligatoire.'
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format d'email invalide."
    }

    return errors
  }

  // ── Soumission ────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault() // Empêche le rechargement de page

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return // Stoppe si validation échouée
    }

    // Délègue au parent (App.jsx) qui fait l'appel API.
    // Si onSubmit throw (erreur API), on NE vide PAS le formulaire
    // afin que l'utilisateur puisse corriger et réessayer.
    try {
      await onSubmit(formData)
      // ✅ Succès : vider uniquement en mode création
      if (!initialData) {
        setFormData(EMPTY_FORM)
      }
    } catch {
      // L'erreur est déjà affichée dans App.jsx via setError()
      // On ne fait rien ici, le formulaire reste rempli
    }
  }

  // Détermine les labels selon le mode
  const isEditMode = Boolean(initialData)
  const title      = isEditMode ? '✏️ Modifier l\'utilisateur' : '➕ Ajouter un utilisateur'
  const submitLabel = isEditMode ? 'Enregistrer' : 'Ajouter'

  return (
    <div className="form-card">
      <h2 className="form-card__title">{title}</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">

          {/* ── Champ Nom ── */}
          <div className="form-group">
            <label htmlFor="name">Nom *</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Alice Dupont"
              value={formData.name}
              onChange={handleChange}
              className={fieldErrors.name ? 'input--error' : ''}
              disabled={isLoading}
              autoComplete="off"
            />
            {/* Toujours rendu (même vide) pour maintenir la hauteur du groupe.
                Cela évite que le champ Rôle glisse vers le bas quand une erreur
                apparaît dans un autre groupe. */}
            <span className="form-error" role={fieldErrors.name ? 'alert' : undefined}>
              {fieldErrors.name || '\u00a0'}
            </span>
          </div>

          {/* ── Champ Email ── */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="alice@example.com"
              value={formData.email}
              onChange={handleChange}
              className={fieldErrors.email ? 'input--error' : ''}
              disabled={isLoading || isEditMode} // email non modifiable en édition
              autoComplete="off"
            />
            {/* Même logique : toujours rendu pour garder la hauteur cohérente */}
            <span className="form-error" role={fieldErrors.email ? 'alert' : undefined}>
              {fieldErrors.email || '\u00a0'}
            </span>
          </div>

          {/* ── Champ Rôle ── */}
          <div className="form-group">
            <label htmlFor="role">Rôle</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="user">👤 User</option>
              <option value="admin">🛡 Admin</option>
            </select>
            {/* Spacer identique aux autres groupes → alignement cohérent */}
            <span className="form-error" aria-hidden="true">{' '}</span>
          </div>

          {/* ── Boutons ── */}
          {/* form-group--actions a un label invisible + span spacer
              pour être de la même hauteur que les 3 autres colonnes */}
          <div className="form-group form-group--actions">
            {/* Label invisible — réserve l'espace du label des autres groupes */}
            <span className="form-group__label-spacer" aria-hidden="true">&nbsp;</span>

            {/* Ligne des boutons */}
            <div className="form-group--actions__btns">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isLoading}
              >
                {isLoading ? '⏳ ...' : submitLabel}
              </button>

              {isEditMode && onCancelEdit && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={onCancelEdit}
                  disabled={isLoading}
                >
                  Annuler
                </button>
              )}
            </div>

            {/* Spacer erreur — aligne le bas avec les autres groupes */}
            <span className="form-error" aria-hidden="true">&nbsp;</span>
          </div>

        </div>
      </form>
    </div>
  )
}

export default UserForm
