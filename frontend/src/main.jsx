import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { GameProvider } from './contexts/GameContext.jsx';
import { VoiceProvider } from './contexts/VoiceContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameProvider>
      <VoiceProvider>
        <App />
      </VoiceProvider>
    </GameProvider>
  </StrictMode>
);
