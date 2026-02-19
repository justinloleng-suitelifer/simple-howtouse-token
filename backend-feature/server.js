const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const JWT_SECRET = "super-secret-key-123"; // Must match Main Backend!

// --- DATABASE (In-Memory for this demo) ---
// We only store the userId (UUID), not the name/email.
let letters = []; 

// --- MIDDLEWARE: The "Gatekeeper" ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Remove "Bearer "

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) return res.sendStatus(403);
        
        // SUCCESS! We extracted the data from the token.
        // req.user will look like: { userId: "uuid-student-001", role: "student" }
        req.user = decodedUser; 
        next();
    });
};

// --- ROUTE 1: Student creates a letter ---
app.post('/letters', authenticateToken, (req, res) => {
    // Check permission
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: "Only students can write letters" });
    }

    const newLetter = {
        id: Date.now(),
        content: req.body.content,
        authorId: req.user.userId, // <--- SAVING THE UUID FROM TOKEN
        likes: 0
    };

    letters.push(newLetter);
    res.json({ message: "Letter sent!", letter: newLetter });
});

// --- ROUTE 2: Teacher likes a letter ---
app.post('/letters/:id/like', authenticateToken, (req, res) => {
    // Check permission
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Only teachers can like letters" });
    }

    const letter = letters.find(l => l.id == req.params.id);
    if (!letter) return res.status(404).json({ error: "Letter not found" });

    letter.likes += 1;
    // We could also record WHO liked it: 
    // letter.likedBy = req.user.userId;

    res.json({ message: "Like added", likes: letter.likes });
});

// --- ROUTE 3: Get all letters (Public or Protected) ---
app.get('/letters', (req, res) => {
    res.json(letters);
});

app.listen(5000, () => console.log("Feature Backend running on port 5000"));