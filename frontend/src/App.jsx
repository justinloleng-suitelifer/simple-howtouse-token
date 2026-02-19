import { useState, useEffect } from 'react';

function App() {
  // State for Auth
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State for Features
  const [letters, setLetters] = useState([]);
  const [letterContent, setLetterContent] = useState('');

  // --- 1. LOGIN (Port 4000) ---
  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.token) {
        setToken(data.token);
        // Clear inputs after success
        setUsername('');
        setPassword('');
      } else {
        alert("Login failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error connecting to Auth Backend (Port 4000). Is it running?");
      console.error(err);
    }
  };

  // --- 2. FETCH LETTERS (Port 5000) ---
  const fetchLetters = async () => {
    try {
      const res = await fetch('http://localhost:5000/letters');
      const data = await res.json();
      setLetters(data);
    } catch (err) {
      console.error("Error fetching letters (Port 5000). Is it running?", err);
    }
  };

  // Effect: Load letters automatically once we have a token (logged in)
  useEffect(() => {
    if (token) {
      fetchLetters();
    }
  }, [token]);

  // --- 3. SEND LETTER (Port 5000) ---
  const handleSendLetter = async () => {
    if (!letterContent) return;
    
    try {
      const res = await fetch('http://localhost:5000/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <--- PASSING THE TOKEN
        },
        body: JSON.stringify({ content: letterContent })
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error); // Show error if user is not authorized
      } else {
        alert("Sent!");
        setLetterContent(''); // Clear text box
        fetchLetters(); // Refresh the list
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- 4. LIKE LETTER (Port 5000) ---
  const handleLike = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/letters/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // <--- PASSING THE TOKEN
        }
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error); // E.g., "Only teachers can like letters"
      } else {
        fetchLetters(); // Refresh list to see new like count
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- RENDER UI ---
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>School System</h1>

      {/* CONDITIONAL RENDERING: Login Screen vs Dashboard */}
      {!token ? (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h2>Login (Main Backend)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              placeholder="Username (student or teacher)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '8px' }}
            />
            <input
              type="password"
              placeholder="Password (123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '8px' }}
            />
            <button 
              onClick={handleLogin}
              style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        <div style={{ border: '2px solid #28a745', padding: '20px', borderRadius: '8px' }}>
          <h2>Evaluation Letters (Feature Backend)</h2>
          <p style={{ color: 'green' }}>✅ Logged in successfully</p>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <textarea
              placeholder="Write your evaluation..."
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              style={{ flex: 1, padding: '8px', minHeight: '60px' }}
            />
            <button 
              onClick={handleSendLetter}
              style={{ background: '#28a745', color: 'white', border: 'none', padding: '0 20px', cursor: 'pointer' }}
            >
              Send
            </button>
          </div>
          
          <hr />
          
          <div id="letters-list">
            {letters.length === 0 && <p>No letters yet...</p>}
            {letters.map((l) => (
              <div key={l.id} style={{ background: '#f4f4f4', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  Letter #{l.id} <span style={{ fontWeight: 'normal', fontSize: '0.8em', color: '#666' }}>(Author: {l.authorId})</span>
                </div>
                <div style={{ marginBottom: '10px' }}>{l.content}</div>
                <div>
                  Likes: <strong>{l.likes}</strong> 
                  <button 
                    onClick={() => handleLike(l.id)}
                    style={{ marginLeft: '15px', cursor: 'pointer', background: 'white', border: '1px solid #ccc', padding: '2px 8px' }}
                  >
                    Like 👍
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setToken('')} 
            style={{ marginTop: '20px', background: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;