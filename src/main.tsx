
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create error boundary to catch and log rendering errors
const renderApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      createRoot(rootElement).render(<App />);
    } else {
      console.error("Root element not found");
    }
  } catch (error) {
    console.error("Error rendering application:", error);
  }
};

renderApp();
