// DOM Elements
const grid = document.getElementById('dashboard-grid');

// Fetch Platforms and Settings from Backend
async function loadPlatforms() {
    try {
        const [platformsRes, settingsRes] = await Promise.all([
            fetch('/api/platforms'),
            fetch('/api/settings')
        ]);
        
        if (!platformsRes.ok || !settingsRes.ok) throw new Error('Network response was not ok');
        
        const platforms = await platformsRes.json();
        const settings = await settingsRes.json();
        
        applySettings(settings);
        renderGrid(platforms);
    } catch (error) {
        console.error('Error loading data:', error);
        grid.innerHTML = '<p style="color: red; grid-column: 1/-1; text-align: center;">Error loading platforms. Is the server running?</p>';
    }
}

function applySettings(settings) {
    document.getElementById('mainTitle').textContent = settings.mainTitle;
    document.getElementById('subTitle').textContent = settings.subTitle;
    document.getElementById('welcomeText').textContent = settings.welcomeText;
    if(settings.logoUrl) {
        document.getElementById('logoImg').src = settings.logoUrl;
    }
    if(settings.fontFamily) {
        document.body.style.fontFamily = settings.fontFamily;
    }
    if(settings.logoSize) {
        document.getElementById('logoImg').style.width = settings.logoSize + 'px';
    }
    if(settings.mainTitleSize) {
        document.getElementById('mainTitle').style.fontSize = settings.mainTitleSize + 'rem';
    }
    if(settings.subTitleSize) {
        document.getElementById('subTitle').style.fontSize = settings.subTitleSize + 'rem';
    }
    if(settings.footerText) {
        const footer = document.getElementById('appFooter');
        if(footer) footer.textContent = settings.footerText;
    }
}

// Render Grid
function renderGrid(platforms) {
    grid.innerHTML = '';
    
    platforms.forEach(platform => {
        const card = document.createElement('a');
        card.href = platform.url;
        card.className = 'card';
        card.setAttribute('data-theme', platform.color);
        // target="_blank" if it's a real URL
        if(platform.url !== '#') card.target = '_blank';
        
        card.innerHTML = `
            <div class="card-icon-wrapper">
                <span class="material-symbols-outlined card-icon">${platform.icon}</span>
            </div>
            <h3 class="card-title">${platform.title}</h3>
            ${platform.description ? `<p class="card-desc">${platform.description}</p>` : ''}
        `;
        grid.appendChild(card);
    });
}

// Initial Fetch
loadPlatforms();
