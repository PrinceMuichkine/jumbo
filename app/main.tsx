import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './router';

// Import style sheets directly
import '@unocss/reset/tailwind-compat.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/index.scss';
import '@xterm/xterm/css/xterm.css';
import 'virtual:uno.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </React.StrictMode>
);
