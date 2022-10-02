globalThis.global = globalThis;

import React from 'react';
import ReactDOM from 'react-dom/client';
// import "./stuquery";
// import "./virtualsky";
import App from './App';
import './index.css';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
