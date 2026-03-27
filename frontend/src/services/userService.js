/**
 * src/services/userService.js
 * ─────────────────────────────────────────────────
 * Couche SERVICE — centralise tous les appels HTTP.
 *
 * Principe de responsabilité unique :
 *   Les composants React ne doivent PAS contenir
 *   de logique HTTP (axios). Ils délèguent au service,
 *   qui est le seul à connaître l'URL et le format.
 *
 * L'instance axios a :
 *   baseURL: '/api'  → prefixe automatique sur chaque requête
 *   Vite proxy redirige /api → http://localhost:3001/api
 *
 * Format des réponses backend :
 *   Succès : { success: true, data: ... }
 *   Erreur : { success: false, message: "..." }
 * ─────────────────────────────────────────────────
 */

import axios from 'axios'

// ── Instance axios configurée ─────────────────────
const api = axios.create({
  baseURL: '/api',                          // Vite proxy → http://localhost:3001/api
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,                            // Abandonne la requête après 8s
})

// ── Intercepteur de réponse ───────────────────────
// Transforme les erreurs Axios en messages lisibles.
// Toutes les fonctions du service peuvent throw une Error
// avec .message contenant le texte du backend ou un message générique.
api.interceptors.response.use(
  // 2xx → passe directement
  (response) => response,

  // 4xx / 5xx / réseau → on normalise l'erreur
  (error) => {
    // Erreur réseau (backend hors ligne, timeout…)
    if (!error.response) {
      return Promise.reject(
        new Error('Impossible de contacter le serveur. Vérifiez que le backend est démarré.')
      )
    }

    // Erreur HTTP avec corps JSON (ex: 409, 400, 404…)
    const message =
      error.response.data?.message ||
      `Erreur ${error.response.status} : ${error.response.statusText}`

    return Promise.reject(new Error(message))
  }
)

// ── Méthodes CRUD ─────────────────────────────────

/**
 * Récupère tous les utilisateurs.
 * Supporte les query params optionnels : role, search, page, limit
 * @param {object} params - ex: { role: 'admin' }
 * @returns {Promise<Array>} tableau d'utilisateurs
 */
const getAll = (params = {}) =>
  api.get('/users', { params }).then((res) => res.data.data)

/**
 * Récupère un utilisateur par son _id MongoDB.
 * @param {string} id - ObjectId MongoDB
 * @returns {Promise<object>} l'utilisateur
 */
const getById = (id) =>
  api.get(`/users/${id}`).then((res) => res.data.data)

/**
 * Crée un nouvel utilisateur.
 * @param {{ name: string, email: string, role: string }} data
 * @returns {Promise<object>} l'utilisateur créé (avec _id généré)
 */
const create = (data) =>
  api.post('/users', data).then((res) => res.data.data)

/**
 * Met à jour un utilisateur existant.
 * @param {string} id   - ObjectId MongoDB
 * @param {object} data - champs à modifier
 * @returns {Promise<object>} l'utilisateur mis à jour
 */
const update = (id, data) =>
  api.put(`/users/${id}`, data).then((res) => res.data.data)

/**
 * Supprime un utilisateur.
 * @param {string} id - ObjectId MongoDB
 * @returns {Promise<void>}
 */
const remove = (id) =>
  api.delete(`/users/${id}`).then((res) => res.data)

// ── Export du service ─────────────────────────────
const userService = { getAll, getById, create, update, remove }

export default userService
