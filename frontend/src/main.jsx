import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.onerror = function (message, source, lineno, colno, error) {
  alert('JAVASCRIPT ERROR:\n' + message + '\n\nFile: ' + source + '\nLine: ' + lineno);
};
window.addEventListener('unhandledrejection', function (event) {
  alert('PROMISE ERROR:\n' + event.reason);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
