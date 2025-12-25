import React, { useState, useEffect } from 'react';
import { generateOfficialDeck } from '../utils/deckGenerator';

export default function TestDeck() {
  const [deck, setDeck] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const d = generateOfficialDeck();
      setDeck(d);
    } catch (e) {
      setError(e.toString());
    }
  }, []);

  return (
    <div className="p-10 bg-white text-black">
        <h1>Test Deck Generation</h1>
        {error && <div className="text-red-500">{error}</div>}
        <div>Count: {deck.length}</div>
        <pre>{JSON.stringify(deck.slice(0, 5), null, 2)}</pre>
    </div>
  );
}
