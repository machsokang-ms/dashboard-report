const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

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

module.exports = { readDB, writeDB, readSettings, writeSettings };
