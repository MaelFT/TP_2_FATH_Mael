/**
 * src/main.jsx
 * ─────────────────────────────────────────────────
 * Point d'entrée de l'application React.
 *
 * ReactDOM.createRoot() monte l'arbre de composants
 * React dans l'élément HTML #root (défini dans index.html).
 *
 * StrictMode active des vérifications supplémentaires
 * en développement (double-render, détection effets...).
 * ─────────────────────────────────────────────────
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
