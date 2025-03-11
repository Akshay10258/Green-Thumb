import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

import { FirebaseProvider } from './context/Firebase';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    
  
      <FirebaseProvider>
      <App />
      </FirebaseProvider>
      
  </StrictMode>,
);
