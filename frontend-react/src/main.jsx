import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CardGallery from './pages/CardGallery.jsx'
import Lobby from './pages/Lobby.jsx'
import StadiumDemo from './pages/StadiumDemo.jsx'

console.log('main.jsx: Rendering root...');
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game/:roomId" element={<App />} />
        <Route path="/cards" element={<CardGallery />} />
        <Route path="/stadium" element={<StadiumDemo />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
console.log('main.jsx: render() called.');
