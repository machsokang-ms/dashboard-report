require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const { readDB, writeDB, readSettings, writeSettings, readSlides, writeSlides } = require('./database');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

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

// ---- SLIDES API ROUTES ---- //

// Get all slides (Public)
app.get('/api/slides', (req, res) => {
    res.json(readSlides());
});

// Add a new slide (Protected)
app.post('/api/slides', authenticateToken, (req, res) => {
    const { tag, title, desc, icon, bgType, bgValue, imageUrl, linkUrl } = req.body;
    if (!title) return res.status(400).json({ error: 'Missing title' });
    const slides = readSlides();
    const newSlide = {
        id: Date.now().toString(),
        tag: tag || '',
        title,
        desc: desc || '',
        icon: icon || 'monitoring',
        bgType: bgType || 'gradient',
        bgValue: bgValue || 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)',
        imageUrl: imageUrl || '',
        linkUrl: linkUrl || ''
    };
    slides.push(newSlide);
    writeSlides(slides);
    res.json(newSlide);
});

// Update a slide (Protected)
app.put('/api/slides/:id', authenticateToken, (req, res) => {
    const { tag, title, desc, icon, bgType, bgValue, imageUrl, linkUrl } = req.body;
    let slides = readSlides();
    const index = slides.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Slide not found' });
    slides[index] = {
        ...slides[index],
        tag:      tag      !== undefined ? tag      : slides[index].tag,
        title:    title    || slides[index].title,
        desc:     desc     !== undefined ? desc     : slides[index].desc,
        icon:     icon     || slides[index].icon,
        bgType:   bgType   || slides[index].bgType,
        bgValue:  bgValue  || slides[index].bgValue,
        imageUrl: imageUrl !== undefined ? imageUrl : slides[index].imageUrl,
        linkUrl:  linkUrl  !== undefined ? linkUrl  : (slides[index].linkUrl || '')
    };
    writeSlides(slides);
    res.json(slides[index]);
});

// Delete a slide (Protected)
app.delete('/api/slides/:id', authenticateToken, (req, res) => {
    let slides = readSlides();
    slides = slides.filter(s => s.id !== req.params.id);
    writeSlides(slides);
    res.sendStatus(204);
});

// Reorder slides (Protected)
app.put('/api/slides-reorder', authenticateToken, (req, res) => {
    const { slides } = req.body;
    if (!Array.isArray(slides)) return res.status(400).json({ error: 'Invalid data' });
    writeSlides(slides);
    res.json(slides);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
