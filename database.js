const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const slidesPath = path.join(__dirname, 'slides.json');

// Default initial data
const defaultData = [
    { id: '1', title: 'CDP Report', url: '#', color: 'blue', icon: 'bar_chart' },
    { id: '2', title: 'MoEYS Report', url: '#', color: 'green', icon: 'monitoring' },
    { id: '3', title: 'BEEP Program', url: '#', color: 'orange', icon: 'school' },
    { id: '4', title: 'SALA Digital', url: '#', color: 'purple', icon: 'account_balance' },
    { id: '5', title: 'Exam Results', url: '#', color: 'pink', icon: 'description' },
    { id: '6', title: 'eLearning App', url: '#', color: 'teal', icon: 'apps' }
];

function readDB() {
    if (!fs.existsSync(dbPath)) {
        writeDB(defaultData);
        return defaultData;
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// Settings DB Logic
const settingsPath = path.join(__dirname, 'settings.json');
const defaultSettings = {
    mainTitle: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    subTitle: 'នាយកដ្ឋានព័ត៌មានវិទ្យា',
    welcomeText: 'សូមស្វាគមន៍មកាន់ប្រព័ន្ធរបាយការណ៍សង្ខេបឌីជីថល',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Ministry_of_Education%2C_Youth_and_Sport_%28Cambodia%29.svg',
    fontFamily: "'Battambang', 'Inter', sans-serif",
    logoSize: 80,
    mainTitleSize: 1.8,
    subTitleSize: 1.5,
    footerText: "អភិវឌ្ឍដោយ៖ ក្រុមការងារព័ត៌មានវិទ្យា"
};

function readSettings() {
    if (!fs.existsSync(settingsPath)) {
        writeSettings(defaultSettings);
        return defaultSettings;
    }
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
}

function writeSettings(data) {
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8');
}

// Slides DB Logic
const defaultSlides = [
    {
        id: '1',
        tag: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
        title: 'ប្រព័ន្ធរបាយការណ៍ឌីជីថល',
        desc: 'ធ្វើឱ្យការគ្រប់គ្រងទិន្នន័យអប់រំកាន់តែទំនើប ឆ្លាតវៃ និងមានប្រសិទ្ធភាព',
        icon: 'monitoring',
        bgType: 'gradient',
        bgValue: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)',
        imageUrl: '',
        linkUrl: ''
    },
    {
        id: '2',
        tag: 'CDP Program',
        title: 'របាយការណ៍ស្ថិតិអប់រំ',
        desc: 'ទិន្នន័យពិតប្រាកដ ច្បាស់លាស់ ត្រូវអនុម័ត សម្រាប់ការអភិវឌ្ឍការអប់រំ',
        icon: 'bar_chart',
        bgType: 'gradient',
        bgValue: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',
        imageUrl: '',
        linkUrl: ''
    },
    {
        id: '3',
        tag: 'BEEP Program',
        title: 'ការអប់រំក្នុងយុគសម័យឌីជីថល',
        desc: 'ជំរុញឱ្យគ្រប់សិស្សសាលាទទួលបានការអប់រំល្អ ស្មើភាព ហើយមានគុណភាព',
        icon: 'school',
        bgType: 'gradient',
        bgValue: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)',
        imageUrl: '',
        linkUrl: ''
    },
    {
        id: '4',
        tag: 'SALA Digital',
        title: 'សាលាឌីជីថលថ្មី',
        desc: 'ការអប់រំទំនើប ប្រព័ន្ធគ្រប់គ្រងសាលា SALA Digital ដើម្បីអនាគតកម្ពុជា',
        icon: 'account_balance',
        bgType: 'gradient',
        bgValue: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fb923c 100%)',
        imageUrl: '',
        linkUrl: ''
    }
];

function readSlides() {
    if (!fs.existsSync(slidesPath)) {
        writeSlides(defaultSlides);
        return defaultSlides;
    }
    return JSON.parse(fs.readFileSync(slidesPath, 'utf8'));
}

function writeSlides(data) {
    fs.writeFileSync(slidesPath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readDB, writeDB, readSettings, writeSettings, readSlides, writeSlides };
