const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// SECRET_KEY: In production, put this in a .env file!
// Both backends must know this secret to verify the token.
const JWT_SECRET = "super-secret-key-123";

// Mock Database of Users
const USERS = [
    { id: "uuid-student-001", username: "student", password: "123", role: "student" },
    { id: "uuid-teacher-999", username: "teacher", password: "123", role: "teacher" }
];

// LOGIN ROUTE
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // 1. Find user in DB
    const user = USERS.find(u => u.username === username && u.password === password);
    
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // 2. Create the Token (The "ID Badge")
    // We put the UUID and Role *inside* the token
    const token = jwt.sign(
        { 
            userId: user.id, // <--- THIS IS THE UUID YOU NEED LATER
            role: user.role  // <--- Role helps feature backend know permissions
        }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
    );

    // 3. Send token to Frontend
    res.json({ token, role: user.role });
});

app.listen(4000, () => console.log("Main Backend running on port 4000"));