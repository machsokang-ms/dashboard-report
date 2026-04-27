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
    loadSlides();
    fetchSettings();
}

// =============================================
// TAB SWITCHING
// =============================================
function switchTab(tab) {
    const tabs = ['platforms', 'slides'];
    tabs.forEach(t => {
        document.getElementById('panel' + t.charAt(0).toUpperCase() + t.slice(1)).style.display = (t === tab) ? 'block' : 'none';
        document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('active', t === tab);
    });
}

// =============================================
// PLATFORM MANAGEMENT
// =============================================
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
        if (platform.url !== '#') card.target = '_blank';

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
    if (!platform) return;

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
    const id          = document.getElementById('platformId').value;
    const title       = document.getElementById('platformName').value.trim();
    const url         = document.getElementById('platformUrl').value.trim();
    const description = document.getElementById('platformDesc').value.trim();
    const color       = document.getElementById('platformColor').value;
    const icon        = document.getElementById('platformIcon').value.trim();

    if (!title) return showToast('សូមបញ្ចូលឈ្មោះថ្នាល', true);

    const isEdit   = !!id;
    const method   = isEdit ? 'PUT' : 'POST';
    const endpoint = isEdit ? '/api/platforms/' + id : '/api/platforms';

    const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwtToken },
        body: JSON.stringify({ title, url, color, icon, description })
    });

    if (res.ok) {
        showToast(isEdit ? 'កែប្រែបានជោគជ័យ!' : 'បន្ថែមថ្នាលបានជោគជ័យ!');
        closeModal();
        loadPlatforms();
    } else {
        showToast('Not Authorized. Please login again.', true);
        logout();
    }
}

async function deletePlatform(id) {
    if (!confirm('តើអ្នកពិតជាចង់លុបថ្នាលនេះ?')) return;

    const res = await fetch('/api/platforms/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + jwtToken }
    });

    if (res.ok) {
        showToast('លុបបានជោគជ័យ!');
        loadPlatforms();
    } else {
        showToast('Failed to delete', true);
    }
}

// =============================================
// SLIDESHOW MANAGEMENT
// =============================================
let currentSlides = [];
let currentBgType = 'gradient';

async function loadSlides() {
    const res = await fetch('/api/slides');
    currentSlides = await res.json();
    renderSlidesGrid(currentSlides);
}

function renderSlidesGrid(slides) {
    const grid = document.getElementById('slides-admin-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!slides.length) {
        grid.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1; text-align:center; padding:40px;">មិនមាន Slide ទេ។ ចុច "+ បន្ថែម Slide ថ្មី" ដើម្បីចាប់ផ្ដើម</p>';
        return;
    }

    slides.forEach((slide, idx) => {
        const card = document.createElement('div');
        card.className = 'slide-admin-card';

        // Background
        const bgDiv = document.createElement('div');
        bgDiv.className = 'slide-admin-card-bg';
        if (slide.bgType === 'image' && slide.imageUrl) {
            bgDiv.style.backgroundImage = `url('${slide.imageUrl}')`;
        } else {
            bgDiv.style.background = slide.bgValue || 'linear-gradient(135deg, #1e3a8a, #2563eb)';
        }

        card.innerHTML = `
            <div class="slide-admin-card-bg" style="${
                slide.bgType === 'image' && slide.imageUrl
                    ? `background-image:url('${slide.imageUrl}'); background-size:cover; background-position:center;`
                    : `background:${slide.bgValue || 'linear-gradient(135deg, #1e3a8a, #2563eb)'};`
            }"></div>
            <div class="slide-admin-card-overlay"></div>
            <div class="slide-order-num">${idx + 1}</div>
            <div class="slide-admin-card-actions">
                <button class="slide-action-btn edit" onclick="openSlideModalForEdit('${slide.id}')" title="Edit">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="slide-action-btn delete" onclick="deleteSlide('${slide.id}')" title="Delete">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
            <div class="slide-admin-card-body">
                ${slide.tag ? `<span class="slide-tag">${slide.tag}</span>` : ''}
                <h4>${slide.title}</h4>
                ${slide.linkUrl ? `
                <div class="slide-has-url-icon">
                    <span class="material-symbols-outlined">link</span> ${slide.linkUrl.replace(/^https?:\/\//, '').split('/')[0]}
                </div>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Open modal for NEW slide
function openSlideModal() {
    document.getElementById('slideModalTitle').textContent = 'បន្ថែម Slide ថ្មី';
    document.getElementById('slideId').value    = '';
    document.getElementById('slideTag').value   = '';
    document.getElementById('slideTitle').value = '';
    document.getElementById('slideDesc').value  = '';
    document.getElementById('slideIcon').value  = 'monitoring';
    document.getElementById('slideLinkUrl').value = '';

    // Reset background type to gradient
    currentBgType = 'gradient';
    document.getElementById('slideGradient').value = 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)';
    setBgType('gradient');
    clearSlideImage();

    // Reset gradient preset selection
    document.querySelectorAll('.gradient-preset').forEach((btn, i) => btn.classList.toggle('selected', i === 0));

    updatePreview();
    document.getElementById('slideModal').classList.add('show');
}

// Open modal to EDIT existing slide
function openSlideModalForEdit(id) {
    const slide = currentSlides.find(s => s.id === id);
    if (!slide) return;

    document.getElementById('slideModalTitle').textContent = 'កែប្រែ Slide';
    document.getElementById('slideId').value    = slide.id;
    document.getElementById('slideTag').value   = slide.tag   || '';
    document.getElementById('slideTitle').value = slide.title || '';
    document.getElementById('slideDesc').value  = slide.desc  || '';
    document.getElementById('slideIcon').value  = slide.icon  || 'monitoring';
    document.getElementById('slideLinkUrl').value = slide.linkUrl || '';

    currentBgType = slide.bgType || 'gradient';

    if (currentBgType === 'image') {
        setBgType('image');
        if (slide.imageUrl) {
            document.getElementById('slideImageData').value = slide.imageUrl;
            const preview = document.getElementById('slideImagePreview');
            preview.src = slide.imageUrl;
            preview.style.display = 'block';
            document.getElementById('imageUploadArea').style.display = 'none';
            document.getElementById('clearImageBtn').style.display = 'inline-block';
        }
    } else {
        setBgType('gradient');
        const gradVal = slide.bgValue || 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)';
        document.getElementById('slideGradient').value = gradVal;
        document.querySelectorAll('.gradient-preset').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.gradient === gradVal);
        });
    }

    updatePreview();
    document.getElementById('slideModal').classList.add('show');
}

function closeSlideModal() {
    document.getElementById('slideModal').classList.remove('show');
}

// Save slide (add or update)
async function saveSlide() {
    const id      = document.getElementById('slideId').value;
    const tag     = document.getElementById('slideTag').value.trim();
    const title   = document.getElementById('slideTitle').value.trim();
    const desc    = document.getElementById('slideDesc').value.trim();
    const icon    = document.getElementById('slideIcon').value;
    const linkUrl = document.getElementById('slideLinkUrl').value.trim();

    if (!title) return showToast('សូមបញ្ចូលចំណងជើង Slide', true);

    const bgType  = currentBgType;
    const bgValue = currentBgType === 'gradient'
        ? document.getElementById('slideGradient').value
        : '';
    const imageUrl = currentBgType === 'image'
        ? document.getElementById('slideImageData').value
        : '';

    const isEdit   = !!id;
    const method   = isEdit ? 'PUT' : 'POST';
    const endpoint = isEdit ? '/api/slides/' + id : '/api/slides';

    const btn = document.getElementById('saveSlideBtn');
    btn.disabled = true;
    btn.textContent = 'កំពុងរក្សាទុក...';

    try {
        const res = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwtToken },
            body: JSON.stringify({ tag, title, desc, icon, bgType, bgValue, imageUrl, linkUrl })
        });

        if (res.ok) {
            showToast(isEdit ? '✅ កែប្រែ Slide បានជោគជ័យ!' : '✅ បន្ថែម Slide បានជោគជ័យ!');
            closeSlideModal();
            loadSlides();
        } else {
            showToast('Not Authorized. Please login again.', true);
            logout();
        }
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 រក្សាទុក Slide';
    }
}

// Delete a slide
async function deleteSlide(id) {
    if (!confirm('តើអ្នកពិតជាចង់លុប Slide នេះ?')) return;

    const res = await fetch('/api/slides/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + jwtToken }
    });

    if (res.ok) {
        showToast('🗑️ លុប Slide បានជោគជ័យ!');
        loadSlides();
    } else {
        showToast('Failed to delete slide', true);
    }
}

// Toggle BG type (gradient / image)
function setBgType(type) {
    currentBgType = type;
    document.getElementById('btnGradient').classList.toggle('active', type === 'gradient');
    document.getElementById('btnImage').classList.toggle('active', type === 'image');
    document.getElementById('gradientSection').style.display = type === 'gradient' ? 'flex' : 'none';
    document.getElementById('imageSection').style.display   = type === 'image'    ? 'flex' : 'none';
    updatePreview();
}

// Select a gradient preset
function selectGradient(btn) {
    document.querySelectorAll('.gradient-preset').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('slideGradient').value = btn.dataset.gradient;
    updatePreview();
}

// Handle slide image file upload
function handleSlideImage(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
        showToast('រូបភាពធំពេក! អតិបរមា 10MB', true);
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const dataUrl = e.target.result;
        document.getElementById('slideImageData').value = dataUrl;

        const preview = document.getElementById('slideImagePreview');
        preview.src = dataUrl;
        preview.style.display = 'block';

        document.getElementById('imageUploadArea').style.display = 'none';
        document.getElementById('clearImageBtn').style.display = 'inline-block';

        updatePreview();
    };
    reader.readAsDataURL(file);
}

// Clear selected image
function clearSlideImage() {
    document.getElementById('slideImageData').value = '';
    document.getElementById('slideImageFile').value = '';

    const preview = document.getElementById('slideImagePreview');
    preview.src = '';
    preview.style.display = 'none';

    document.getElementById('imageUploadArea').style.display = 'flex';
    document.getElementById('clearImageBtn').style.display = 'none';

    updatePreview();
}

// Update live preview inside the modal
function updatePreview() {
    const tag     = document.getElementById('slideTag')     ? document.getElementById('slideTag').value     : '';
    const title   = document.getElementById('slideTitle')   ? document.getElementById('slideTitle').value   : '';
    const desc    = document.getElementById('slideDesc')    ? document.getElementById('slideDesc').value    : '';
    const icon    = document.getElementById('slideIcon')    ? document.getElementById('slideIcon').value    : 'monitoring';
    const linkUrl = document.getElementById('slideLinkUrl') ? document.getElementById('slideLinkUrl').value.trim() : '';

    const previewTag       = document.getElementById('previewTag');
    const previewTitle     = document.getElementById('previewTitle');
    const previewDesc      = document.getElementById('previewDesc');
    const previewIcon      = document.getElementById('previewIcon');
    const previewLinkBadge = document.getElementById('previewLinkBadge');
    const previewEl        = document.getElementById('slidePreview');

    if (previewTag)   { previewTag.textContent = tag || 'Tag'; previewTag.style.display = tag ? 'inline-block' : 'none'; }
    if (previewTitle) previewTitle.textContent = title || 'ចំណងជើង Slide';
    if (previewDesc)  previewDesc.textContent  = desc  || 'ការពិពណ៌នានៃ slide...';
    if (previewIcon)  previewIcon.textContent  = icon;

    // Show/hide link badge in preview
    if (previewLinkBadge) {
        previewLinkBadge.style.display = linkUrl ? 'inline-flex' : 'none';
    }

    if (previewEl) {
        if (currentBgType === 'image') {
            const imgData = document.getElementById('slideImageData') ? document.getElementById('slideImageData').value : '';
            if (imgData) {
                previewEl.style.backgroundImage = `url('${imgData}')`;
                previewEl.style.backgroundSize = 'cover';
                previewEl.style.backgroundPosition = 'center';
                previewEl.style.background = '';
            } else {
                previewEl.style.backgroundImage = '';
                previewEl.style.background = 'linear-gradient(135deg, #374151, #6b7280)';
            }
        } else {
            const grad = document.getElementById('slideGradient') ? document.getElementById('slideGradient').value : '';
            previewEl.style.backgroundImage = '';
            previewEl.style.background = grad || 'linear-gradient(135deg, #1e3a8a, #2563eb)';
        }
    }
}

// =============================================
// TOAST
// =============================================
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = isError ? '#dc3545' : 'var(--color-green)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// =============================================
// SETTINGS
// =============================================
let currentSettings = {};

async function fetchSettings() {
    const res = await fetch('/api/settings');
    currentSettings = await res.json();
    if (currentSettings.fontFamily) document.body.style.fontFamily = currentSettings.fontFamily;
    if (currentSettings.footerText) {
        const footer = document.getElementById('appFooter');
        if (footer) footer.textContent = currentSettings.footerText;
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
    document.getElementById('setMainTitle').value      = currentSettings.mainTitle    || '';
    document.getElementById('setSubTitle').value       = currentSettings.subTitle     || '';
    document.getElementById('setWelcomeText').value    = currentSettings.welcomeText  || '';
    document.getElementById('setFontFamily').value     = currentSettings.fontFamily   || "'Battambang', 'Inter', sans-serif";
    document.getElementById('setLogoSize').value       = currentSettings.logoSize      || 80;
    document.getElementById('setMainTitleSize').value  = currentSettings.mainTitleSize || 1.8;
    document.getElementById('setSubTitleSize').value   = currentSettings.subTitleSize  || 1.5;
    document.getElementById('setFooterText').value     = currentSettings.footerText   || '';
    document.getElementById('settingsModal').classList.add('show');
}

function closeSettingsModal() { document.getElementById('settingsModal').classList.remove('show'); }

async function saveSettings() {
    const logoUrl      = document.getElementById('setLogoData').value;
    const mainTitle    = document.getElementById('setMainTitle').value.trim();
    const subTitle     = document.getElementById('setSubTitle').value.trim();
    const welcomeText  = document.getElementById('setWelcomeText').value.trim();
    const fontFamily   = document.getElementById('setFontFamily').value;
    const logoSize     = parseFloat(document.getElementById('setLogoSize').value);
    const mainTitleSize = parseFloat(document.getElementById('setMainTitleSize').value);
    const subTitleSize  = parseFloat(document.getElementById('setSubTitleSize').value);
    const footerText   = document.getElementById('setFooterText').value.trim();

    const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwtToken },
        body: JSON.stringify({ logoUrl, mainTitle, subTitle, welcomeText, fontFamily, logoSize, mainTitleSize, subTitleSize, footerText })
    });

    if (res.ok) {
        currentSettings = await res.json();
        if (currentSettings.fontFamily) document.body.style.fontFamily = currentSettings.fontFamily;
        showToast('✅ រក្សាទុកការកំណត់បានជោគជ័យ');
        closeSettingsModal();
    } else {
        showToast('Not Authorized.', true);
    }
}

// Logo file upload handler
document.getElementById('setLogoFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showToast('ទំហំរូបធំពេក! អតិបរមា 5MB', true);
            this.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function (evt) {
            document.getElementById('setLogoData').value = evt.target.result;
            const preview = document.getElementById('logoPreview');
            preview.src = evt.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});
