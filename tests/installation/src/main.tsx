
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

import 'virtual:svg-icons/register';


const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
