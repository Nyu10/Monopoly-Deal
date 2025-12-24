import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Lobby = () => {
    const [username, setUsername] = useState('');
    const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'));
    const [games, setGames] = useState([]);
    const [gameName, setGameName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Create session on mount if needed
    useEffect(() => {
        if (!sessionId) {
            const savedUsername = localStorage.getItem('username') || '';
            setUsername(savedUsername);
        } else {
            loadGames();
            // Refresh games every 5 seconds
            const interval = setInterval(loadGames, 5000);
            return () => clearInterval(interval);
        }
    }, [sessionId]);

    const createSession = async () => {
        if (!username.trim()) {
            alert('Please enter a username');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/lobby/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim() })
            });

            const data = await response.json();
            setSessionId(data.sessionId);
            localStorage.setItem('sessionId', data.sessionId);
            localStorage.setItem('username', data.username);
        } catch (error) {
            console.error('Failed to create session:', error);
            alert('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const loadGames = async () => {
        try {
            const response = await fetch(`${API_URL}/api/lobby/games`);
            const data = await response.json();
            setGames(data);
        } catch (error) {
            console.error('Failed to load games:', error);
        }
    };

    const createGame = async () => {
        if (!gameName.trim()) {
            alert('Please enter a game name');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/lobby/games`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Id': sessionId
                },
                body: JSON.stringify({
                    gameName: gameName.trim(),
                    maxPlayers: 4
                })
            });

            const data = await response.json();
            navigate(`/game/${data.roomId}`);
        } catch (error) {
            console.error('Failed to create game:', error);
            alert('Failed to create game');
        } finally {
            setLoading(false);
        }
    };

    const joinGame = async (roomId) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/lobby/games/${roomId}/join`, {
                method: 'POST',
                headers: {
                    'X-Session-Id': sessionId
                }
            });

            if (response.ok) {
                navigate(`/game/${roomId}`);
            } else {
                alert('Failed to join game');
            }
        } catch (error) {
            console.error('Failed to join game:', error);
            alert('Failed to join game');
        } finally {
            setLoading(false);
        }
    };

    const playWithBots = () => {
        // Use existing bot game
        const roomId = 'bot-game-' + Date.now();
        navigate(`/game/${roomId}`);
    };

    // Login screen
    if (!sessionId) {
        return (
            <div className="lobby-container">
                <div className="login-card">
                    <h1>🎴 Monopoly Deal</h1>
                    <p>Enter your username to play</p>
                    <input
                        type="text"
                        placeholder="Enter username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && createSession()}
                        maxLength={20}
                        disabled={loading}
                    />
                    <button onClick={createSession} disabled={loading || !username.trim()}>
                        {loading ? 'Connecting...' : 'Join Lobby'}
                    </button>
                    <div className="divider">or</div>
                    <button onClick={playWithBots} className="bot-button">
                        Play with Bots (Offline)
                    </button>
                </div>
            </div>
        );
    }

    // Lobby screen
    return (
        <div className="lobby-container">
            <div className="lobby-header">
                <h1>🎴 Game Lobby</h1>
                <p>Welcome, <strong>{localStorage.getItem('username')}</strong>!</p>
            </div>

            <div className="create-game-section">
                <h2>Create New Game</h2>
                <div className="create-game-form">
                    <input
                        type="text"
                        placeholder="Game name..."
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && createGame()}
                        maxLength={30}
                        disabled={loading}
                    />
                    <button onClick={createGame} disabled={loading || !gameName.trim()}>
                        Create Game
                    </button>
                </div>
            </div>

            <div className="games-section">
                <h2>Available Games ({games.length})</h2>
                {games.length === 0 ? (
                    <p className="no-games">No games available. Create one!</p>
                ) : (
                    <div className="games-list">
                        {games.map(game => (
                            <div key={game.roomId} className="game-card">
                                <div className="game-info">
                                    <h3>{game.gameName}</h3>
                                    <p>Created by: {game.createdBy}</p>
                                    <p>Players: {game.currentPlayers}/{game.maxPlayers}</p>
                                    <div className="player-list">
                                        {game.playerNames.map((name, i) => (
                                            <span key={i} className="player-badge">{name}</span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => joinGame(game.roomId)}
                                    disabled={loading || game.currentPlayers >= game.maxPlayers}
                                >
                                    {game.currentPlayers >= game.maxPlayers ? 'Full' : 'Join'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="lobby-footer">
                <button onClick={playWithBots} className="bot-button">
                    Play with Bots Instead
                </button>
            </div>
        </div>
    );
};

export default Lobby;
