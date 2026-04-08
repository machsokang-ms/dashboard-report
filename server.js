require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const { readDB, writeDB, readSettings, writeSettings } = require('./database');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback password if not set
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// JWT Validation Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ---- API ROUTES ---- //

// Login route for Admin
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវ (Invalid Password)' });
    }
});

// Get all platforms (Public API)
app.get('/api/platforms', (req, res) => {
    const platforms = readDB();
    res.json(platforms);
});

// Get settings
app.get('/api/settings', (req, res) => {
    res.json(readSettings());
});

// Update settings (Protected)
app.put('/api/settings', authenticateToken, (req, res) => {
    const data = req.body;
    let settings = readSettings();
    settings = { ...settings, ...data };
    writeSettings(settings);
    res.json(settings);
});

// Add a new platform (Protected API)
app.post('/api/platforms', authenticateToken, (req, res) => {
    const { title, url, color, icon, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Missing title' });
    }
    const platforms = readDB();
    const newPlatform = {
        id: Date.now().toString(),
        title,
        url: url || '#',
        color: color || 'blue',
        icon: icon || 'apps',
        description: description || ''
    };
    platforms.push(newPlatform);
    writeDB(platforms);
    res.json(newPlatform);
});

// Delete a platform (Protected API)
app.delete('/api/platforms/:id', authenticateToken, (req, res) => {
    let platforms = readDB();
    platforms = platforms.filter(p => p.id !== req.params.id);
    writeDB(platforms);
    res.sendStatus(204);
});

// Update a platform (Protected API)
app.put('/api/platforms/:id', authenticateToken, (req, res) => {
    const { title, url, color, icon, description } = req.body;
    let platforms = readDB();
    const index = platforms.findIndex(p => p.id === req.params.id);
    
    if (index !== -1) {
        platforms[index] = {
            ...platforms[index],
            title: title || platforms[index].title,
            url: url || platforms[index].url,
            color: color || platforms[index].color,
            icon: icon || platforms[index].icon,
            description: description !== undefined ? description : platforms[index].description
        };
        writeDB(platforms);
        res.json(platforms[index]);
    } else {
        res.status(404).json({ error: 'Platform not found' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
