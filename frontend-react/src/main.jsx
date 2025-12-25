import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import AppOld from './AppOld.jsx'
import CardGallery from './pages/CardGallery.jsx'
import Lobby from './pages/Lobby.jsx'
import LandingPage from './pages/LandingPage.jsx'
import MultiplayerPage from './pages/MultiplayerPage.jsx'
import TutorialPage from './pages/TutorialPage.jsx'
import Game from './pages/Game.jsx'

console.log('main.jsx: Rendering root...');
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/multiplayer" element={<MultiplayerPage />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game/:roomId" element={<Game />} />
        <Route path="/cards" element={<CardGallery />} />
        <Route path="/old-game" element={<AppOld />} />
        <Route path="/stadium" element={<Game />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
console.log('main.jsx: render() called.');
