import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import './index.css';
// Initialize Dependency Injection Container
import { initializeApp } from './init.js';

// Initialize DI container before rendering the app
initializeApp();

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
