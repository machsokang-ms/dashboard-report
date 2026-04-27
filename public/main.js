// DOM Elements
const grid = document.getElementById('dashboard-grid');

// Fetch Platforms, Settings, and Slides from Backend
async function loadAll() {
    try {
        const [platformsRes, settingsRes, slidesRes] = await Promise.all([
            fetch('/api/platforms'),
            fetch('/api/settings'),
            fetch('/api/slides')
        ]);

        if (!platformsRes.ok || !settingsRes.ok || !slidesRes.ok)
            throw new Error('Network response was not ok');

        const platforms = await platformsRes.json();
        const settings  = await settingsRes.json();
        const slides    = await slidesRes.json();

        applySettings(settings);
        renderGrid(platforms);
        initSlideshow(slides);
    } catch (error) {
        console.error('Error loading data:', error);
        grid.innerHTML = '<p style="color:red;grid-column:1/-1;text-align:center;">Error loading platforms. Is the server running?</p>';
    }
}

// Apply global settings
function applySettings(settings) {
    document.getElementById('mainTitle').textContent    = settings.mainTitle   || '';
    document.getElementById('subTitle').textContent     = settings.subTitle    || '';
    document.getElementById('welcomeText').textContent  = settings.welcomeText || '';

    if (settings.logoUrl)       document.getElementById('logoImg').src                      = settings.logoUrl;
    if (settings.fontFamily)    document.body.style.fontFamily                               = settings.fontFamily;
    if (settings.logoSize)      document.getElementById('logoImg').style.width               = settings.logoSize + 'px';
    if (settings.mainTitleSize) document.getElementById('mainTitle').style.fontSize          = settings.mainTitleSize + 'rem';
    if (settings.subTitleSize)  document.getElementById('subTitle').style.fontSize           = settings.subTitleSize  + 'rem';

    if (settings.footerText) {
        const footer = document.getElementById('appFooter');
        if (footer) footer.textContent = settings.footerText;
    }
}

// Render platform cards
function renderGrid(platforms) {
    grid.innerHTML = '';
    platforms.forEach(platform => {
        const card = document.createElement('a');
        card.href      = platform.url;
        card.className = 'card';
        card.setAttribute('data-theme', platform.color);
        if (platform.url !== '#') card.target = '_blank';

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

// ========== DYNAMIC SLIDESHOW ==========
function initSlideshow(slides) {
    const slideshowEl = document.getElementById('slideshow');
    if (!slideshowEl || !slides || !slides.length) return;

    // Clear existing placeholder content
    slideshowEl.innerHTML = '';

    // Build slide elements
    slides.forEach((slide, idx) => {
        // Use <a> if has link, else <div>
        const isLink = slide.linkUrl && slide.linkUrl.trim() !== '';
        const el = document.createElement(isLink ? 'a' : 'div');
        el.className = 'slide' + (idx === 0 ? ' active' : '');

        if (isLink) {
            el.href   = slide.linkUrl;
            el.target = '_blank';
            el.rel    = 'noopener noreferrer';
            el.classList.add('slide-has-link');
        }

        if (slide.bgType === 'image' && slide.imageUrl) {
            el.style.backgroundImage    = `url('${slide.imageUrl}')`;
            el.style.backgroundSize     = 'cover';
            el.style.backgroundPosition = 'center';
        } else {
            el.style.background = slide.bgValue || 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)';
        }

        el.innerHTML = `
            <div class="slide-content">
                ${slide.tag ? `<span class="slide-tag">${slide.tag}</span>` : ''}
                <h2 class="slide-title">${slide.title}</h2>
                ${slide.desc ? `<p class="slide-desc">${slide.desc}</p>` : ''}
                ${isLink ? `<span class="slide-link-badge"><span class="material-symbols-outlined">open_in_new</span> ចូលមើល</span>` : ''}
            </div>
            <div class="slide-deco">
                <span class="material-symbols-outlined slide-icon">${slide.icon || 'monitoring'}</span>
            </div>
        `;
        slideshowEl.appendChild(el);
    });

    // Arrows
    const prevBtn = document.createElement('button');
    prevBtn.className = 'slide-btn prev';
    prevBtn.id = 'slidePrev';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'slide-btn next';
    nextBtn.id = 'slideNext';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';

    // Dots
    const dotsDiv = document.createElement('div');
    dotsDiv.className = 'slide-dots';
    dotsDiv.id = 'slideDots';
    slides.forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.className = 'dot' + (idx === 0 ? ' active' : '');
        btn.dataset.index = idx;
        dotsDiv.appendChild(btn);
    });

    slideshowEl.appendChild(prevBtn);
    slideshowEl.appendChild(nextBtn);
    slideshowEl.appendChild(dotsDiv);

    // Logic
    const allSlides = slideshowEl.querySelectorAll('.slide');
    const allDots   = dotsDiv.querySelectorAll('.dot');
    let current = 0;
    let timer   = null;

    function goTo(index) {
        const old = current;
        allSlides[old].classList.remove('active');
        allSlides[old].classList.add('exit');
        allDots[old].classList.remove('active');
        setTimeout(() => allSlides[old].classList.remove('exit'), 600);

        current = (index + allSlides.length) % allSlides.length;
        allSlides[current].classList.add('active');
        allDots[current].classList.add('active');

        // Reset progress bar
        slideshowEl.style.animation = 'none';
        slideshowEl.offsetHeight; // reflow
        slideshowEl.style.animation = '';
    }

    function startAuto() { timer = setInterval(() => goTo(current + 1), 5000); }
    function resetAuto() { clearInterval(timer); startAuto(); }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
    allDots.forEach(dot => {
        dot.addEventListener('click', () => { goTo(parseInt(dot.dataset.index)); resetAuto(); });
    });

    startAuto();
}

// Start everything
loadAll();
