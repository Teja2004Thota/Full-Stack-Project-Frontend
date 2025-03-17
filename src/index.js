import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot instead of ReactDOM
import './index.css';
import App from './App';

// Prevent Ethereum object conflict (MetaMask-related issue)
if (typeof window.ethereum !== 'undefined') {
  try {
    Object.defineProperty(window, 'ethereum', { configurable: true });
  } catch (error) {
    console.warn("Ethereum object redefinition prevented:", error);
  }
}

// Ensure the root element exists before rendering
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement); // Create a root
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found. Ensure your index.html contains a div with id='root'.");
}
