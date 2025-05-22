
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create error boundary to catch and log rendering errors
const renderApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("Root element with id 'root' not found in the document");
      return;
    }
    
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Error rendering application:", error);
  }
};

// Execute the renderApp function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', renderApp);
