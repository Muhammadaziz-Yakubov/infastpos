import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'
import useUIStore from './store/uiStore'
import { registerSW } from 'virtual:pwa-register'

// Register service worker
registerSW({ immediate: true })

// Initialize theme from store
const theme = JSON.parse(localStorage.getItem('ui-settings'))?.state?.theme || 'light';
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
