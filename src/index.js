import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './index.css';
import App from './App';

// Манифест TON Connect
const manifestUrl = 'https://fancy-melomakarona-ceb24e.netlify.app/tonconnect-manifest.json';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
); 