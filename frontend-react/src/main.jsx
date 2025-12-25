import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import CardGallery from './pages/CardGallery.jsx'
import Lobby from './pages/Lobby.jsx'
import LandingPage from './pages/LandingPage.jsx'
import MultiplayerPage from './pages/MultiplayerPage.jsx'
import TutorialPage from './pages/TutorialPage.jsx'
import Game from './pages/Game.jsx'
import TestDeck from './pages/TestDeck.jsx'
import RulesChatWidget from './components/RulesChatWidget.jsx'

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
        <Route path="/test-deck" element={<TestDeck />} />

        <Route path="/stadium" element={<Game />} />
      </Routes>
      <RulesChatWidget />
    </BrowserRouter>
  </StrictMode>,
)
console.log('main.jsx: render() called.');
