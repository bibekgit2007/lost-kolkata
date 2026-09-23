/**
 * LOST KOLKATA - Core Application Logic
 * Interactive Excavator, Cartography Dossiers, Memory Vault, Audio Mixer, and Heritage Quest.
 */

document.addEventListener('DOMContentLoaded', () => {
    initDustCanvas();
    initTimeLens();
    initMapHotspots();
    initSoundscapeControls();
    initMemoryVault();
    initHeritageQuest();
    initNavigationScroll();
    initRajbariSlider();
});

/* ==========================================================================
   1. Atmospheric Dust Particles Canvas
   ========================================================================== */
function initDustCanvas() {
    const canvas = document.getElementById('dust-canvas');
    if (!canvas) return;

    // Completely disable on mobile/touch screens to ensure zero scroll lag on Android/iOS
    const isMobile = window.innerWidth <= 900 || 
                     window.matchMedia('(pointer: coarse)').matches ||
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        canvas.style.display = 'none';
        return;
    }

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 900) {
            canvas.style.display = 'none';
            return;
        }
        canvas.style.display = 'block';
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }, { passive: true });

    const particles = [];
    const particleCount = 28;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.6 + 0.6,
            speedY: - (Math.random() * 0.35 + 0.12),
            speedX: (Math.random() - 0.5) * 0.2,
            opacity: Math.random() * 0.45 + 0.15,
            pulseSpeed: Math.random() * 0.02 + 0.005
        });
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.opacity += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

            // wrap around
            if (p.y < 0) p.y = height;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;

            const alpha = Math.max(0.1, Math.min(0.55, p.opacity));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(225, 185, 120, ${alpha})`;
            ctx.fill();
        });

        requestAnimationFrame(render);
    }
    render();
}

/* ==========================================================================
   2. Interactive Time Slider (1826 Colonial Calcutta -> 2026 Modern Kolkata)
   Gesture-aware: vertical scrolls pass through cleanly; horizontal slides smoothly
   ========================================================================== */
function initTimeLens() {
    const container = document.getElementById('timelens-wrapper');
    const vintageLayer = document.getElementById('timelens-vintage-layer');
    const handle = document.getElementById('timelens-handle');
    const indicator = document.getElementById('excavation-year-badge');
    const depthMeter = document.getElementById('excavation-depth-fill');
    const timespanLabel = document.getElementById('meter-timespan-label');

    const preset1826 = document.getElementById('btn-preset-1826');
    const preset2026 = document.getElementById('btn-preset-2026');
    const presetSplit = document.getElementById('btn-preset-split');

    if (!container || !vintageLayer || !handle) return;

    let isDragging = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTrackingTouch = false;
    let isHorizontalGesture = false;

    function setPresetActive(activeBtn) {
        [preset1826, presetSplit, preset2026].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        if (activeBtn) activeBtn.classList.add('active');
    }

    function updateSlider(percent, triggerBtn = null) {
        // Clamp between 2% and 98%
        const clamped = Math.max(2, Math.min(98, percent));
        vintageLayer.style.width = `${clamped}%`;
        handle.style.left = `${clamped}%`;

        // Update active preset button highlight
        if (triggerBtn) {
            setPresetActive(triggerBtn);
        } else {
            if (clamped >= 85) setPresetActive(preset1826);
            else if (clamped <= 15) setPresetActive(preset2026);
            else if (Math.abs(clamped - 50) < 15) setPresetActive(presetSplit);
            else setPresetActive(null);
        }

        // 0% (right) = 2026 Modern -> 100% (left revealed) = 1826 Colonial Calcutta
        const yearsUnearthed = Math.round((clamped / 100) * 200);
        const year = Math.round(2026 - yearsUnearthed);

        if (indicator) {
            if (clamped >= 85) {
                indicator.textContent = `Excavated: Era 1826 CE (Faded Colonial Grandeur)`;
            } else if (clamped <= 15) {
                indicator.textContent = `Surface: Era 2026 CE (Modern Kolkata Metropolis)`;
            } else {
                indicator.textContent = `Chrono-Depth: Era ${year} CE (${yearsUnearthed} Years Unearthed)`;
            }
        }

        if (depthMeter) {
            depthMeter.style.width = `${clamped}%`;
        }

        if (timespanLabel) {
            timespanLabel.textContent = `${yearsUnearthed} / 200 Years Excavated`;
        }
    }

    function getPercentFromX(clientX) {
        const rect = container.getBoundingClientRect();
        const x = clientX - rect.left;
        return (x / rect.width) * 100;
    }

    // --- Desktop Mouse Dragging ---
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSlider(getPercentFromX(e.clientX));
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        requestAnimationFrame(() => updateSlider(getPercentFromX(e.clientX)));
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // --- Mobile Touch Gestures (Zero-Scroll-Lag & Direction Disambiguation) ---
    // Handle disc direct drag:
    handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        isHorizontalGesture = true;
    }, { passive: true });

    container.addEventListener('touchstart', (e) => {
        if (!e.touches || !e.touches[0]) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isTrackingTouch = true;
        isHorizontalGesture = false;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isTrackingTouch && !isDragging) return;
        if (!e.touches || !e.touches[0]) return;

        const curX = e.touches[0].clientX;
        const curY = e.touches[0].clientY;
        const diffX = Math.abs(curX - touchStartX);
        const diffY = Math.abs(curY - touchStartY);

        // If the movement is primarily vertical, abort slider dragging so native phone scrolling proceeds silky-smooth!
        if (!isHorizontalGesture) {
            if (diffY > diffX && diffY > 6) {
                isTrackingTouch = false;
                isDragging = false;
                return;
            }
            if (diffX > diffY && diffX > 8) {
                isHorizontalGesture = true;
                isDragging = true;
            }
        }

        if (isDragging && isHorizontalGesture) {
            requestAnimationFrame(() => updateSlider(getPercentFromX(curX)));
        }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        // If it was a quick stationary tap, jump to tapped position
        if (isTrackingTouch && !isHorizontalGesture) {
            const touch = e.changedTouches ? e.changedTouches[0] : null;
            if (touch) {
                updateSlider(getPercentFromX(touch.clientX));
            }
        }
        isDragging = false;
        isTrackingTouch = false;
        isHorizontalGesture = false;
    });

    // Preset quick buttons (easy touch targets)
    if (preset1826) preset1826.addEventListener('click', () => updateSlider(96, preset1826));
    if (preset2026) preset2026.addEventListener('click', () => updateSlider(4, preset2026));
    if (presetSplit) presetSplit.addEventListener('click', () => updateSlider(50, presetSplit));

    // Initialize at 50% split with active button
    updateSlider(50, presetSplit);
}

/* ==========================================================================
   3. The Cartography of Shadows - Interactive 1890 Map Pins & Dossiers
   ========================================================================== */
const HISTORICAL_DOSSIERS = {
    'adi-ganga': {
        title: 'The Lost Channel of Adi Ganga',
        bengali: 'আদি গঙ্গা (পুরাতন গঙ্গার প্রবাহ)',
        coords: '22.5218° N, 88.3482° E • Kalighat Channel',
        period: '15th - 18th Century CE',
        sound: 'temple',
        image: 'assets/images/realm_adi_ganga.jpg',
        quote: '"Where the mighty pilgrim fleets of Saptagram once anchored, silence now clings to dry silt and crumbling ghats."',
        text: `Long before Job Charnock set foot in Sutanuti, the true sacred course of the Ganges (Bhagirathi) did not flow through modern Hooghly's western channel. Instead, it carved its majestic path through the Adi Ganga — coursing past ancient Kalighat, Boral, and Baruipur towards the sea at Sagar Island. 
        Along its banks rose 108 Shiva terracotta atchala shrines, burning ghats, and pilgrim lodges. But by the late 18th century, natural siltation and the dredging of Tolly's Nullah diverted the river's lifeblood. Today, buried beneath metro pilings and urban expansion, the original Ganga is almost forgotten by the bustling metropolis that grew over its banks.`
    },
    'chitpur-tram': {
        title: 'Chitpur Road & Tramway Route 36',
        bengali: 'চিৎপুর রোড ও ট্রাম রুট ৩৬',
        coords: '22.5935° N, 88.3610° E • North Calcutta',
        period: '1873 - 1930s Golden Tram Era',
        sound: 'tram',
        image: 'assets/images/realm_ghost_tram.jpg',
        quote: '"The iron bell sang through the fog of Chitpur, past courtyards where sitars played and broadsheets dried."',
        text: `Chitpur Road is perhaps the oldest recorded artery of Calcutta, tracing an ancient pilgrimage track to the goddess Chittreswari. In February 1873, Asia's very first tramway ran here — initially powered by mighty Clydesdale horses imported from England, and later electrified in 1902 with mahogany-finished wooden tramcars.
        Route 36 wound past the palatial courtyards of the Sobhabazar Rajas, the famous perfumers of Nakhoda, and the noisy brass criers of Battala. Though much of the vintage tramway grid has been dismantled in modern times, the ghost bells of Route 36 still echo in the collective memory of old Calcutta.`
    },
    'tiretti-chinese': {
        title: 'The Melting Pot of Tiretti & Bowbazar',
        bengali: 'তেরেত্তি বাজার ও প্রাচীন চীনা পল্লী',
        coords: '22.5726° N, 88.3562° E • Old Chinatown',
        period: '1780 - 1950s',
        sound: 'press',
        image: 'assets/images/realm_cosmopolis.jpg',
        quote: '"In the morning mist, the fragrance of steamed bao mingled with Armenian incense and Baghdadi Hebrew psalms."',
        text: `Beneath the commercial bustle of Central Kolkata lies India's only historic Chinatown. Founded in the late 18th century when Chinese businessman Tong Achew arrived with a cargo of tea and sugar, the community established temples, leather tanneries, tooth-makers, and early morning noodle markets around Tiretti Bazaar.
        Just paces away stood the Beth El and Magen David Synagogues, built by the wealthy Baghdadi Jewish diaspora, and the Armenian Church of Holy Nazareth (1724). This dense quadrant was a glorious sanctuary of global cultures coexisting harmoniously in the heart of colonial Bengal.`
    },
    'battala-press': {
        title: 'The Battala Woodcuts & The Golden Adda',
        bengali: 'বটতলার কাঠের ব্লক ও সাহিত্যের আঁতুড়ঘর',
        coords: '22.5890° N, 88.3640° E • Chitpur Battala',
        period: '1820s - 1900s Print Renaissance',
        sound: 'press',
        image: 'assets/images/realm_battala_press.jpg',
        quote: '"The ink of Battala was raw, fearless, and democratic — prints carved on shisham wood sold for a copper paisa."',
        text: `Battala, named after a colossal ancient banyan tree (Bat-tala) near Chitpur, was the vibrant epicenter of Bengal's indigenous printing revolution. Long before high-society presses dominated, self-taught Bengali engravers carved exquisite illustrations on hardwood blocks to produce cheap, illustrated almanacs (Panjika), mythological romances, crime thrillers, and razor-sharp social satires.
        Around these printing shops sprang up legendary Adda sessions: hours-long passionate debates fueled by earthen cups of tea, tobacco smoke, and revolutionary political ideas that laid the foundations of modern Indian literature.`
    },
    'senate-house': {
        title: 'The Vanished Senate House & Lost Palaces',
        bengali: 'বিলুপ্ত সিনেট হাউস ও প্রাচীন রাজবাড়ি',
        coords: '22.5752° N, 88.3638° E • College Street',
        period: 'Erected 1872 • Demolished 1960',
        sound: 'temple',
        image: 'assets/images/realm_rajbari.jpg',
        quote: '"To destroy the Senate House was to amputate the architectural soul of intellectual Calcutta."',
        text: `Considered one of the grandest neoclassical structures in Asia, the Senate House of the University of Calcutta featured a breathtaking portico of gigantic fluted Corinthian columns, soaring pediments, and palatial halls where the giants of the Bengal Renaissance — Rabindranath Tagore, Swami Vivekananda, and Sir Ashutosh Mukherjee — walked and debated.
        In 1960, amidst fierce protests by artists and historians, this jewel of classical architecture was demolished to make way for a utilitarian concrete box. Along with numerous crumbling Rajbaris in North Kolkata, it stands as a poignant reminder of how fragile heritage is against the rush of unplanned modernity.`
    },
    'hooghly-ghats': {
        title: 'The Maritime Lifeline: Hooghly Steamers & Baboo Ghat',
        bengali: 'হুগলি নদী, প্রাচীন ঘাট ও বাষ্পীয় স্টিমার',
        coords: '22.5684° N, 88.3412° E • Strand Road',
        period: '1820s - 1940s Riverfront Era',
        sound: 'steamer',
        image: 'assets/images/hero.jpg',
        quote: '"The river carried the clippers of Boston, the steamers of Glasgow, and the eternal songs of Bengali boatmen."',
        text: `Strand Road was Calcutta's maritime face to the world. Baboo Ghat, designed with Grecian Doric columns by Walter Granville in 1838, welcomed governors, poets, freedom fighters, and humble bathers alike.
        Across the churning brown waters of the Hooghly plied paddle-wheel steamers, their deep brass foghorns piercing through morning monsoon fog. The ghats were more than transit hubs; they were theater stages of daily life, philosophical discourse, and emotional farewells.`
    }
};

function initMapHotspots() {
    const pins = document.querySelectorAll('.map-pin');
    const modal = document.getElementById('dossier-modal');
    const closeBtn = document.getElementById('modal-close-btn');

    if (!pins.length || !modal) return;

    pins.forEach(pin => {
        pin.addEventListener('click', () => {
            const relicId = pin.getAttribute('data-relic');
            const data = HISTORICAL_DOSSIERS[relicId];
            if (!data) return;

            // Populate Modal Content
            document.getElementById('modal-title').textContent = data.title;
            document.getElementById('modal-bengali').textContent = data.bengali;
            document.getElementById('modal-coords').textContent = data.coords;
            document.getElementById('modal-period').textContent = data.period;
            document.getElementById('modal-quote').textContent = data.quote;
            document.getElementById('modal-text').innerHTML = data.text.split('\n\n').map(p => `<p>${p}</p>`).join('');
            
            const modalImg = document.getElementById('modal-image');
            if (modalImg) modalImg.src = data.image;

            // Trigger associated sound if sound engine ready
            if (window.soundEngine) {
                if (data.sound === 'tram') window.soundEngine.playTramBell();
                else if (data.sound === 'steamer') window.soundEngine.playSteamerHorn();
                else if (data.sound === 'temple') window.soundEngine.playTempleBell();
                else if (data.sound === 'press') window.soundEngine.playPressClick();
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   4. Audio Archaeology Controls & Soundboard Mixer
   ========================================================================== */
function initSoundscapeControls() {
    const ambientBtn = document.getElementById('ambient-toggle-btn');
    const navAmbientBtn = document.getElementById('nav-ambient-toggle');
    const volumeSlider = document.getElementById('ambient-volume-slider');

    const btnTram = document.getElementById('snd-tram-bell');
    const btnSteamer = document.getElementById('snd-steamer-horn');
    const btnTemple = document.getElementById('snd-temple-bell');
    const btnPress = document.getElementById('snd-press-click');

    function updateAmbientUI(isPlaying) {
        const text = isPlaying ? 'Mute Atmosphere' : 'Enable 1890s Soundscape';
        if (ambientBtn) {
            ambientBtn.classList.toggle('playing', isPlaying);
            ambientBtn.querySelector('.btn-text').textContent = text;
        }
        if (navAmbientBtn) {
            navAmbientBtn.classList.toggle('playing', isPlaying);
            navAmbientBtn.title = isPlaying ? 'Soundscape Active' : 'Soundscape Inactive';
        }
    }

    if (window.soundEngine) {
        window.soundEngine.subscribe(updateAmbientUI);
    }

    if (ambientBtn) {
        ambientBtn.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.toggleAmbient();
        });
    }

    if (navAmbientBtn) {
        navAmbientBtn.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.toggleAmbient();
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (window.soundEngine) window.soundEngine.setMasterVolume(val);
        });
    }

    // One-shot triggers
    if (btnTram) btnTram.addEventListener('click', () => window.soundEngine && window.soundEngine.playTramBell());
    if (btnSteamer) btnSteamer.addEventListener('click', () => window.soundEngine && window.soundEngine.playSteamerHorn());
    if (btnTemple) btnTemple.addEventListener('click', () => window.soundEngine && window.soundEngine.playTempleBell());
    if (btnPress) btnPress.addEventListener('click', () => window.soundEngine && window.soundEngine.playPressClick());
}

/* ==========================================================================
   5. "Bring It Back" - Memory Vault (Community Submissions & Filter)
   ========================================================================== */
const DEFAULT_MEMORIES = [
    {
        id: 'mem-1',
        author: 'Debabrata Mukherjee',
        area: 'Pathuriaghata Rajbari Lane',
        era: '1930s',
        category: 'architecture',
        date: 'Recorded Heritage',
        text: 'My grandfather used to describe how the crystal chandeliers in the thakur dalan were brought all the way from Bohemia by ship to Baboo Ghat, then carried by sixteen bullock carts through the gaslit lanes of Chitpur.'
    },
    {
        id: 'mem-2',
        author: 'Lin Wei-Kuang',
        area: 'Tiretti Bazaar, Old Chinatown',
        era: '1940s',
        category: 'flavors',
        date: 'Recorded Heritage',
        text: 'At 5:00 AM sharp, before the morning mist lifted, my great-aunt would steam fish-ball soup and freshly pressed rice noodle rolls outside the Sea Ip Church. Rickshaw-pullers, British constables, and Bengali babus stood side by side in the dawn warmth.'
    },
    {
        id: 'mem-3',
        author: 'Shalini Sen',
        area: 'College Street & Battala',
        era: '1950s',
        category: 'streets',
        date: 'Recorded Heritage',
        text: 'Before they tore down the classical Senate House in 1960, we students would sit under its giant Corinthian colonnade with singara and tea, reciting Jibanananda Das while the iron wheels of Tram 36 rumbled past.'
    },
    {
        id: 'mem-4',
        author: 'Kazi Farhan',
        area: 'Nimtala & Baboo Ghat',
        era: '1920s',
        category: 'sounds',
        date: 'Recorded Heritage',
        text: 'The evening steam whistle of the Goalundo mail vessel on the Hooghly was our neighborhood clock. When it sounded at 6:15 PM, mother would light the brass pradip and the shankha (conch) would echo across all the river ghats.'
    }
];

function initMemoryVault() {
    const listEl = document.getElementById('memory-vault-list');
    const form = document.getElementById('memory-form');
    const filterBtns = document.querySelectorAll('.vault-filter-btn');

    if (!listEl) return;

    // Load from localStorage or defaults
    let stored = [];
    try {
        const raw = localStorage.getItem('lost_kolkata_memories');
        if (raw) stored = JSON.parse(raw);
    } catch(e) {}

    let allMemories = [...stored, ...DEFAULT_MEMORIES];

    function renderMemories(filter = 'all') {
        listEl.innerHTML = '';
        const filtered = filter === 'all' 
            ? allMemories 
            : allMemories.filter(m => m.category === filter);

        if (!filtered.length) {
            listEl.innerHTML = `<div class="vault-empty-notice">No memories found in this realm yet. Be the first to bring one back!</div>`;
            return;
        }

        filtered.forEach((m, idx) => {
            const card = document.createElement('article');
            card.className = 'memory-postcard';
            card.style.animationDelay = `${idx * 0.08}s`;
            card.innerHTML = `
                <div class="postcard-stamp">
                    <span class="stamp-icon">🪷</span>
                    <span class="stamp-text">LOST CALCUTTA<br>${m.era}</span>
                </div>
                <div class="postcard-header">
                    <span class="postcard-area"><i class="pin-icon">📍</i> ${m.area}</span>
                    <span class="postcard-date">${m.date || 'Community Archival Post'}</span>
                </div>
                <p class="postcard-body">"${escapeHtml(m.text)}"</p>
                <div class="postcard-footer">
                    <span class="postcard-author">— ${escapeHtml(m.author)}</span>
                    <span class="postcard-tag tag-${m.category}">${m.category.toUpperCase()}</span>
                </div>
            `;
            listEl.appendChild(card);
        });
    }

    // Filter clicks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMemories(btn.getAttribute('data-filter'));
        });
    });

    // Form submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const author = document.getElementById('mem-author').value.trim();
            const area = document.getElementById('mem-area').value.trim();
            const era = document.getElementById('mem-era').value;
            const category = document.getElementById('mem-category').value;
            const text = document.getElementById('mem-text').value.trim();

            if (!author || !area || !text) return;

            const newMem = {
                id: 'mem-' + Date.now(),
                author,
                area,
                era,
                category,
                date: 'Just Unearthed',
                text
            };

            stored.unshift(newMem);
            allMemories.unshift(newMem);

            try {
                localStorage.setItem('lost_kolkata_memories', JSON.stringify(stored));
            } catch(e) {}

            form.reset();
            renderMemories('all');

            // Success feedback
            const toast = document.getElementById('vault-success-toast');
            if (toast) {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 4000);
            }

            // Play pleasant press clack sound
            if (window.soundEngine) window.soundEngine.playPressClick();
        });
    }

    renderMemories('all');
}

/* ==========================================================================
   6. "The Calcutta Archivist Quest" & Certificate Generator
   ========================================================================== */
const QUEST_QUESTIONS = [
    {
        question: "Before silt and modern development turned it into Tolly's Nullah, what was the sacred ancient course of the Ganges in Kolkata called?",
        options: [
            "Adi Ganga (Original Ganges)",
            "Chitpur Khal",
            "Beliaghata Canal",
            "Maratha Ditch"
        ],
        correct: 0,
        explanation: "Adi Ganga was the ancient channel of the Bhagirathi-Hooghly river along which ancient Kalighat and pilgrim ghats originally flourished."
    },
    {
        question: "In which historic North Calcutta neighbourhood did 19th-century artisans carve hand-made woodblock prints and trigger a street literature revolution?",
        options: [
            "Alipore",
            "Battala (Chitpur)",
            "Park Circus",
            "Bhawanipore"
        ],
        correct: 1,
        explanation: "Battala was famous for its raw, democratic woodblock illustrations, mythological broadsheets, and satirical pamphlets that captivated Bengal."
    },
    {
        question: "What magnificent Victorian neoclassical building of Calcutta University with grand Corinthian columns was controversially torn down in 1960?",
        options: [
            "The Senate House",
            "Metcalfe Hall",
            "Town Hall",
            "Writers' Building"
        ],
        correct: 0,
        explanation: "The Senate House (built 1872) was widely regarded as one of Asia's finest neoclassical structures before its tragic demolition in 1960."
    },
    {
        question: "Which immigrant community established India's first Chinatown around Tiretti Bazaar in late 18th-century Calcutta?",
        options: [
            "The Dutch Traders",
            "The Chinese Community (originating with Tong Achew)",
            "The French of Chandernagore",
            "The Portuguese Mercenaries"
        ],
        correct: 1,
        explanation: "The Chinese community in Calcutta began with businessman Tong Achew in the 1780s, establishing early morning markets and temples that endure today."
    }
];

function initHeritageQuest() {
    let currentIdx = 0;
    let score = 0;

    const quizBox = document.getElementById('quest-box');
    const certBox = document.getElementById('certificate-result-box');
    const questionText = document.getElementById('quest-question-text');
    const optionsContainer = document.getElementById('quest-options-container');
    const progressText = document.getElementById('quest-progress-counter');
    const explanationBox = document.getElementById('quest-explanation');
    const nextBtn = document.getElementById('quest-next-btn');

    if (!quizBox || !questionText) return;

    function loadQuestion(idx) {
        const q = QUEST_QUESTIONS[idx];
        questionText.textContent = q.question;
        progressText.textContent = `Relic ${idx + 1} of ${QUEST_QUESTIONS.length}`;
        optionsContainer.innerHTML = '';
        explanationBox.classList.remove('show');
        nextBtn.style.display = 'none';

        q.options.forEach((opt, optIdx) => {
            const btn = document.createElement('button');
            btn.className = 'quest-opt-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => handleAnswer(optIdx, btn, q));
            optionsContainer.appendChild(btn);
        });
    }

    function handleAnswer(selectedIdx, selectedBtn, q) {
        const allBtns = optionsContainer.querySelectorAll('.quest-opt-btn');
        allBtns.forEach(b => b.disabled = true);

        const isCorrect = selectedIdx === q.correct;
        if (isCorrect) {
            score++;
            selectedBtn.classList.add('correct');
            if (window.soundEngine) window.soundEngine.playTramBell();
        } else {
            selectedBtn.classList.add('incorrect');
            allBtns[q.correct].classList.add('correct');
        }

        explanationBox.textContent = (isCorrect ? "✓ Correct! " : "✗ Not quite. ") + q.explanation;
        explanationBox.classList.add('show');
        nextBtn.style.display = 'inline-block';
    }

    nextBtn.addEventListener('click', () => {
        currentIdx++;
        if (currentIdx < QUEST_QUESTIONS.length) {
            loadQuestion(currentIdx);
        } else {
            showCertificate();
        }
    });

    function showCertificate() {
        quizBox.style.display = 'none';
        certBox.style.display = 'block';

        const nameInput = document.getElementById('cert-name-input');
        const generateBtn = document.getElementById('btn-issue-cert');
        const certHolder = document.getElementById('cert-holder-name');
        const certReg = document.getElementById('cert-reg-code');
        const certDate = document.getElementById('cert-date-issued');

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const regCode = 'CAL-' + Math.floor(100000 + Math.random() * 900000);

        if (certDate) certDate.textContent = dateStr;
        if (certReg) certReg.textContent = regCode;

        function updateName(name) {
            if (certHolder) certHolder.textContent = name || 'Custodian of Memory';
        }

        if (generateBtn && nameInput) {
            generateBtn.addEventListener('click', () => {
                const name = nameInput.value.trim();
                updateName(name);
                if (window.soundEngine) window.soundEngine.playTempleBell();
            });
        }

        const printBtn = document.getElementById('btn-print-cert');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
    }

    loadQuestion(0);
}

/* ==========================================================================
   7. Navigation & Smooth Anchor Scrolling
   ========================================================================== */
function initNavigationScroll() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('main-nav-links');

    function closeMobileMenu() {
        if (navMenu) navMenu.classList.remove('open');
        if (mobileToggle) {
            mobileToggle.textContent = '☰';
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
                closeMobileMenu();
            }
        });
    });

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('open');
            mobileToggle.textContent = isOpen ? '✕' : '☰';
            mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close on tap outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && e.target !== mobileToggle) {
                closeMobileMenu();
            }
        });
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* ==========================================================================
   8. Rajbari Courtyard Before & After Slider (CSS clip-path & Vintage Key Handle)
   Zero scroll trap: vertical gestures scroll page freely; horizontal swipes slide
   ========================================================================== */
function initRajbariSlider() {
    const sliderWrapper = document.getElementById('rajbariSlider');
    const sliderHandle = document.getElementById('sliderHandle');
    const srRange = document.getElementById('srSliderRange');
    const btnSketch = document.getElementById('btn-rajbari-sketch');
    const btnSplit = document.getElementById('btn-rajbari-split');
    const btnDecay = document.getElementById('btn-rajbari-decay');

    if (!sliderWrapper) return;

    let isDragging = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTrackingTouch = false;
    let isHorizontalGesture = false;

    function setPresetActive(activeBtn) {
        [btnSketch, btnSplit, btnDecay].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        if (activeBtn) activeBtn.classList.add('active');
    }

    function setSliderPercent(percent, triggerBtn = null) {
        const clamped = Math.max(0, Math.min(100, percent));
        sliderWrapper.style.setProperty('--clip-pos', `${clamped}%`);
        if (srRange) srRange.value = clamped;

        if (triggerBtn) {
            setPresetActive(triggerBtn);
        } else {
            if (clamped >= 85) setPresetActive(btnSketch);
            else if (clamped <= 15) setPresetActive(btnDecay);
            else if (Math.abs(clamped - 50) < 15) setPresetActive(btnSplit);
            else setPresetActive(null);
        }
    }

    function getPercentFromX(clientX) {
        const rect = sliderWrapper.getBoundingClientRect();
        const x = clientX - rect.left;
        return Math.max(0, Math.min(100, (x / rect.width) * 100));
    }

    // --- Desktop Mouse Dragging ---
    sliderWrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        sliderWrapper.classList.add('is-dragging');
        setSliderPercent(getPercentFromX(e.clientX));
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        requestAnimationFrame(() => setSliderPercent(getPercentFromX(e.clientX)));
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            sliderWrapper.classList.remove('is-dragging');
        }
    });

    // --- Mobile Touch Gestures (Zero-Scroll-Lag & Direction Disambiguation) ---
    const keyDisc = sliderHandle ? sliderHandle.querySelector('.handle-key-disc') : null;
    if (keyDisc) {
        keyDisc.addEventListener('touchstart', (e) => {
            isDragging = true;
            isHorizontalGesture = true;
            sliderWrapper.classList.add('is-dragging');
        }, { passive: true });
    }

    sliderWrapper.addEventListener('touchstart', (e) => {
        if (!e.touches || !e.touches[0]) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isTrackingTouch = true;
        isHorizontalGesture = false;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isTrackingTouch && !isDragging) return;
        if (!e.touches || !e.touches[0]) return;

        const curX = e.touches[0].clientX;
        const curY = e.touches[0].clientY;
        const diffX = Math.abs(curX - touchStartX);
        const diffY = Math.abs(curY - touchStartY);

        // If movement is vertical, cancel drag so native page scroll runs at 60fps!
        if (!isHorizontalGesture) {
            if (diffY > diffX && diffY > 6) {
                isTrackingTouch = false;
                isDragging = false;
                sliderWrapper.classList.remove('is-dragging');
                return;
            }
            if (diffX > diffY && diffX > 8) {
                isHorizontalGesture = true;
                isDragging = true;
                sliderWrapper.classList.add('is-dragging');
            }
        }

        if (isDragging && isHorizontalGesture) {
            requestAnimationFrame(() => setSliderPercent(getPercentFromX(curX)));
        }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        // Stationary tap
        if (isTrackingTouch && !isHorizontalGesture) {
            const touch = e.changedTouches ? e.changedTouches[0] : null;
            if (touch) {
                setSliderPercent(getPercentFromX(touch.clientX));
            }
        }
        isDragging = false;
        isTrackingTouch = false;
        isHorizontalGesture = false;
        sliderWrapper.classList.remove('is-dragging');
    });

    if (srRange) {
        srRange.addEventListener('input', (e) => {
            setSliderPercent(parseFloat(e.target.value));
        });
    }

    if (btnSketch) btnSketch.addEventListener('click', () => setSliderPercent(98, btnSketch));
    if (btnSplit) btnSplit.addEventListener('click', () => setSliderPercent(50, btnSplit));
    if (btnDecay) btnDecay.addEventListener('click', () => setSliderPercent(2, btnDecay));

    // Initialize at 50% comparison with active state
    setSliderPercent(50, btnSplit);
}

