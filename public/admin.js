let jwtToken = localStorage.getItem('adminToken');

// On load
if (jwtToken) {
    showDashboard();
}

async function login() {
    const password = document.getElementById('adminPassword').value;
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        
        if (res.ok) {
            const data = await res.json();
            jwtToken = data.token;
            localStorage.setItem('adminToken', jwtToken);
            showDashboard();
        } else {
            const err = await res.json();
            showToast(err.error || 'Login Failed', true);
        }
    } catch (e) {
        showToast('Server error', true);
    }
}

function logout() {
    jwtToken = null;
    localStorage.removeItem('adminToken');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadPlatforms();
}

let currentPlatforms = [];

async function loadPlatforms() {
    const res = await fetch('/api/platforms');
    currentPlatforms = await res.json();
    renderGrid(currentPlatforms);
}

function renderGrid(platforms) {
    const grid = document.getElementById('admin-grid');
    grid.innerHTML = '';
    platforms.forEach(platform => {
        const card = document.createElement('a');
        card.className = 'card';
        card.setAttribute('data-theme', platform.color);
        card.href = platform.url;
        if(platform.url !== '#') card.target = '_blank';
        
        card.innerHTML = `
            <button class="delete-btn" onclick="event.preventDefault(); deletePlatform('${platform.id}')" title="Delete">
                <span class="material-symbols-outlined" style="font-size:16px;">delete</span>
            </button>
            <button class="edit-btn" onclick="event.preventDefault(); openModalForEdit('${platform.id}')" title="Edit">
                <span class="material-symbols-outlined" style="font-size:16px;">edit</span>
            </button>
            <div class="card-icon-wrapper">
                <span class="material-symbols-outlined card-icon">${platform.icon}</span>
            </div>
            <h3 class="card-title">${platform.title}</h3>
            ${platform.description ? `<p class="card-desc">${platform.description}</p>` : ''}
        `;
        grid.appendChild(card);
    });
}

function openModal() { 
    document.getElementById('modalTitle').textContent = 'បន្ថែមថ្នាលថ្មី (Add Platform)';
    document.getElementById('platformId').value = '';
    document.getElementById('platformName').value = '';
    document.getElementById('platformUrl').value = 'https://';
    document.getElementById('platformDesc').value = '';
    document.getElementById('platformColor').value = 'blue';
    document.getElementById('platformIcon').value = 'apps';
    document.getElementById('addPlatformModal').classList.add('show'); 
}

function openModalForEdit(id) {
    const platform = currentPlatforms.find(p => p.id === id);
    if(!platform) return;
    
    document.getElementById('modalTitle').textContent = 'កែប្រែថ្នាល (Edit Platform)';
    document.getElementById('platformId').value = platform.id;
    document.getElementById('platformName').value = platform.title;
    document.getElementById('platformUrl').value = platform.url;
    document.getElementById('platformDesc').value = platform.description || '';
    document.getElementById('platformColor').value = platform.color;
    document.getElementById('platformIcon').value = platform.icon;
    document.getElementById('addPlatformModal').classList.add('show');
}

function closeModal() { document.getElementById('addPlatformModal').classList.remove('show'); }

async function addPlatform() {
    const id = document.getElementById('platformId').value;
    const title = document.getElementById('platformName').value.trim();
    const url = document.getElementById('platformUrl').value.trim();
    const description = document.getElementById('platformDesc').value.trim();
    const color = document.getElementById('platformColor').value;
    const icon = document.getElementById('platformIcon').value.trim();

    if(!title) return showToast('Please enter a name', true);

    const isEdit = !!id;
    const method = isEdit ? 'PUT' : 'POST';
    const endpoint = isEdit ? '/api/platforms/' + id : '/api/platforms';

    const res = await fetch(endpoint, {
        method: method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        },
        body: JSON.stringify({ title, url, color, icon, description })
    });

    if (res.ok) {
        showToast(isEdit ? 'កែប្រែបានជោគជ័យស្តើរ!' : 'បន្ថែមថ្នាលបានជោគជ័យ!');
        closeModal();
        loadPlatforms();
    } else {
        showToast('Not Authorized. Please login again.', true);
        logout();
    }
}

async function deletePlatform(id) {
    if(!confirm("Are you sure you want to delete this platform?")) return;
    
    const res = await fetch('/api/platforms/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + jwtToken }
    });

    if (res.ok) {
        showToast('Deleted API');
        loadPlatforms();
    } else {
        showToast('Failed to delete', true);
    }
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = isError ? '#dc3545' : 'var(--color-green)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

let currentSettings = {};

async function fetchSettings() {
    const res = await fetch('/api/settings');
    currentSettings = await res.json();
    if(currentSettings.fontFamily) {
        document.body.style.fontFamily = currentSettings.fontFamily;
    }
    if(currentSettings.footerText) {
        const footer = document.getElementById('appFooter');
        if(footer) footer.textContent = currentSettings.footerText;
    }
}
fetchSettings();

function openSettingsModal() {
    const logoData = currentSettings.logoUrl || '';
    document.getElementById('setLogoData').value = logoData;
    const preview = document.getElementById('logoPreview');
    if (logoData) {
        preview.src = logoData;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
    document.getElementById('setMainTitle').value = currentSettings.mainTitle || '';
    document.getElementById('setSubTitle').value = currentSettings.subTitle || '';
    document.getElementById('setWelcomeText').value = currentSettings.welcomeText || '';
    document.getElementById('setFontFamily').value = currentSettings.fontFamily || "'Battambang', 'Inter', sans-serif";
    document.getElementById('setLogoSize').value = currentSettings.logoSize || 80;
    document.getElementById('setMainTitleSize').value = currentSettings.mainTitleSize || 1.8;
    document.getElementById('setSubTitleSize').value = currentSettings.subTitleSize || 1.5;
    document.getElementById('setFooterText').value = currentSettings.footerText || '';
    document.getElementById('settingsModal').classList.add('show');
}

function closeSettingsModal() { document.getElementById('settingsModal').classList.remove('show'); }

async function saveSettings() {
    const logoUrl = document.getElementById('setLogoData').value;
    const mainTitle = document.getElementById('setMainTitle').value.trim();
    const subTitle = document.getElementById('setSubTitle').value.trim();
    const welcomeText = document.getElementById('setWelcomeText').value.trim();
    const fontFamily = document.getElementById('setFontFamily').value;
    const logoSize = parseFloat(document.getElementById('setLogoSize').value);
    const mainTitleSize = parseFloat(document.getElementById('setMainTitleSize').value);
    const subTitleSize = parseFloat(document.getElementById('setSubTitleSize').value);
    const footerText = document.getElementById('setFooterText').value.trim();

    const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwtToken },
        body: JSON.stringify({ logoUrl, mainTitle, subTitle, welcomeText, fontFamily, logoSize, mainTitleSize, subTitleSize, footerText })
    });

    if (res.ok) {
        currentSettings = await res.json();
        if(currentSettings.fontFamily) document.body.style.fontFamily = currentSettings.fontFamily;
        showToast('រក្សាទុកការកំណត់បានជោគជ័យ');
        closeSettingsModal();
    } else {
        showToast('Not Authorized.', true);
    }
}

// Handle Logo File Upload
document.getElementById('setLogoFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(file) {
        if(file.size > 5 * 1024 * 1024) {
            showToast('ទំហំរូបធំពេក! អតិបរមា 5MB', true);
            this.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function(evt) {
            document.getElementById('setLogoData').value = evt.target.result;
            const preview = document.getElementById('logoPreview');
            preview.src = evt.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});
