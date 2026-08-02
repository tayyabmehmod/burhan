/* ============================================================
   BIRTHDAY EXPERIENCE — INTERACTIVE SCRIPT
   ============================================================ */

(function () {
    'use strict';

    // ---- State ----
    const state = {
        musicPlaying: false,
        landingDismissed: false,
        jarIndex: 0,
        quizStep: 0,
        quizScore: 0,
    };

    // ---- DOM Cache ----
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ============================================================
    //  LOADING SCREEN
    // ============================================================
    function initLoader() {
        const fill = $('#loaderBarFill');
        const percent = $('#loaderPercent');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) progress = 100;
            fill.style.width = progress + '%';
            percent.textContent = Math.floor(progress) + '%';
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    $('#loadingScreen').classList.add('hidden');
                }, 500);
            }
        }, 200);
    }

    // ============================================================
    //  CUSTOM CURSOR
    // ============================================================
    function initCursor() {
        const cursor = $('#customCursor');
        const trail = $('#customCursorTrail');
        if (!cursor || !trail) return;
        if (window.innerWidth <= 768) return;

        let cx = 0, cy = 0, tx = 0, ty = 0;

        document.addEventListener('mousemove', (e) => {
            cx = e.clientX;
            cy = e.clientY;
            cursor.style.left = cx + 'px';
            cursor.style.top = cy + 'px';
        });

        function animateTrail() {
            tx += (cx - tx) * 0.15;
            ty += (cy - ty) * 0.15;
            trail.style.left = tx + 'px';
            trail.style.top = ty + 'px';
            requestAnimationFrame(animateTrail);
        }
        animateTrail();

        // Hover detection
        document.addEventListener('mouseover', (e) => {
            const target = e.target;
            if (target.closest('button, a, .polaroid, .wish-bubble, .sticky-note, .jar, .quiz-option, .achievement-card, .reason-card')) {
                cursor.classList.add('hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            const target = e.target;
            if (target.closest('button, a, .polaroid, .wish-bubble, .sticky-note, .jar, .quiz-option, .achievement-card, .reason-card')) {
                cursor.classList.remove('hover');
            }
        });
    }

    // ============================================================
    //  SCROLL PROGRESS BAR
    // ============================================================
    function initScrollProgress() {
        const bar = $('#scrollProgress');
        window.addEventListener('scroll', () => {
            if (!state.landingDismissed) return;
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = (scrollTop / docHeight) * 100;
            bar.style.width = percent + '%';
        });
    }

    // ============================================================
    //  PARTICLE CANVAS (Stars + Floating Particles)
    // ============================================================
    function initParticles() {
        const canvas = $('#particleCanvas');
        const ctx = canvas.getContext('2d');
        let w, h;
        const particles = [];
        const stars = [];
        const PARTICLE_COUNT = 60;
        const STAR_COUNT = 120;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Init stars
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.5 + 0.3,
                alpha: Math.random(),
                speed: Math.random() * 0.005 + 0.002,
                phase: Math.random() * Math.PI * 2,
            });
        }

        // Init particles
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.3 + 0.1,
                color: Math.random() > 0.6 ? '59,130,246' : '212,168,67',
            });
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);

            // Draw stars
            for (const star of stars) {
                star.alpha = 0.3 + 0.7 * Math.abs(Math.sin(Date.now() * star.speed + star.phase));
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
                ctx.fill();
            }

            // Draw particles
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
                ctx.fill();

                // Glow
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
                gradient.addColorStop(0, `rgba(${p.color},${p.alpha * 0.5})`);
                gradient.addColorStop(1, `rgba(${p.color},0)`);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ============================================================
    //  LANDING — OPEN GIFT
    // ============================================================
    function initLanding() {
        const openBtn = $('#openBtn');
        const giftBox = $('#giftBox');
        const landing = $('#landingScreen');
        const mainContent = $('#mainContent');

        openBtn.addEventListener('click', () => {
            // Open gift box animation
            giftBox.classList.add('opened');

            // Launch confetti
            setTimeout(() => launchConfetti(3000), 400);

            // Start music
            setTimeout(() => {
                initMusicPlayer();
            }, 600);

            // Exit landing
            setTimeout(() => {
                landing.classList.add('exit');
                state.landingDismissed = true;
                mainContent.classList.add('visible');

                // Spawn balloons
                spawnBalloons(8);

                setTimeout(() => {
                    landing.style.display = 'none';
                    initScrollAnimations();
                    initTimelineScroll();
                    initCountdown();
                    initEndingCanvas();
                    spawnLanterns();
                }, 1000);
            }, 1500);
        });
    }

    // ============================================================
    //  CONFETTI
    // ============================================================
    function launchConfetti(duration = 3000) {
        const canvas = $('#confettiCanvas');
        canvas.classList.add('active');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = [];
        const colors = ['#3b82f6', '#d4a843', '#f0d078', '#8b5cf6', '#ec4899', '#22c55e', '#f59e0b', '#fff'];

        for (let i = 0; i < 200; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 8 + 4,
                h: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                rot: Math.random() * Math.PI * 2,
                rv: (Math.random() - 0.5) * 0.2,
                alpha: 1,
            });
        }

        const start = Date.now();

        function draw() {
            const elapsed = Date.now() - start;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const p of pieces) {
                p.x += p.vx;
                p.vy += 0.05;
                p.y += p.vy;
                p.rot += p.rv;
                if (elapsed > duration * 0.7) {
                    p.alpha -= 0.02;
                    if (p.alpha < 0) p.alpha = 0;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            }

            if (elapsed < duration) {
                requestAnimationFrame(draw);
            } else {
                canvas.classList.remove('active');
            }
        }
        draw();
    }

    // ============================================================
    //  BALLOONS
    // ============================================================
    function spawnBalloons(count = 5) {
        const container = $('#balloonsContainer');
        const balloonColors = [
            'radial-gradient(circle at 30% 30%, #5b9aff, #2563eb)',
            'radial-gradient(circle at 30% 30%, #f0d078, #d4a843)',
            'radial-gradient(circle at 30% 30%, #a78bfa, #7c3aed)',
            'radial-gradient(circle at 30% 30%, #fb7185, #e11d48)',
            'radial-gradient(circle at 30% 30%, #34d399, #059669)',
        ];

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const balloon = document.createElement('div');
                balloon.className = 'balloon';
                balloon.style.left = Math.random() * 90 + 5 + '%';
                balloon.style.background = balloonColors[i % balloonColors.length];
                balloon.style.setProperty('--duration', (10 + Math.random() * 8) + 's');
                balloon.style.setProperty('--drift', (Math.random() - 0.5) * 80 + 'px');
                balloon.style.setProperty('--spin', (Math.random() - 0.5) * 30 + 'deg');
                container.appendChild(balloon);

                setTimeout(() => balloon.remove(), 20000);
            }, i * 2000);
        }
    }

    // ============================================================
    //  SCROLL REVEAL ANIMATIONS
    // ============================================================
    function initScrollAnimations() {
        const reveals = $$('.reveal-up');
        const timelineItems = $$('.timeline-item');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        reveals.forEach((el) => observer.observe(el));
        timelineItems.forEach((el) => observer.observe(el));

        // Init handwritten text
        initHandwritten();
    }

    // ============================================================
    //  TIMELINE SCROLL FILL
    // ============================================================
    function initTimelineScroll() {
        const timeline = $('#timeline');
        const fill = $('#timelineFill');
        if (!timeline || !fill) return;

        window.addEventListener('scroll', () => {
            const rect = timeline.getBoundingClientRect();
            const timelineTop = rect.top;
            const timelineHeight = rect.height;
            const viewportH = window.innerHeight;

            if (timelineTop < viewportH && timelineTop + timelineHeight > 0) {
                const progress = Math.min(1, Math.max(0, (viewportH - timelineTop) / (timelineHeight + viewportH)));
                fill.style.height = progress * 100 + '%';
            }
        });
    }

    // ============================================================
    //  HANDWRITTEN TEXT (Section 4)
    // ============================================================
    function initHandwritten() {
        const lines = $$('.hw-line');
        const cursor = $('#hwCursor');
        const container = $('.section-wishes-text');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateLines();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(container);

        function animateLines() {
            if (cursor) cursor.style.opacity = '1';
            lines.forEach((line, i) => {
                setTimeout(() => {
                    line.classList.add('typed');
                }, i * 500);
            });

            // Hide cursor after all lines
            setTimeout(() => {
                if (cursor) cursor.style.opacity = '0';
            }, lines.length * 500 + 500);
        }
    }

    // ============================================================
    //  23 WISHES BUBBLES (Section 5)
    // ============================================================
    function initBubbles() {
        const wishes = [
            'More Happiness', 'Better Health', 'Dream Job', 'World Tour', 'Inner Peace',
            'Confidence', 'Success', 'Love', 'Adventure', 'Good Memories',
            'Financial Freedom', 'Smile Everyday', 'True Friends', 'Creative Energy', 'Self Growth',
            'Good Vibes', 'New Experiences', 'Courage', 'Gratitude', 'Strength',
            'Wisdom', 'Laughter', 'Bright Future'
        ];

        const grid = $('#bubblesGrid');
        wishes.forEach((wish, i) => {
            const bubble = document.createElement('div');
            bubble.className = 'wish-bubble';
            bubble.style.setProperty('--d', (i * 0.15) + 's');
            bubble.innerHTML = `<span>${wish}</span>`;

            bubble.addEventListener('click', () => {
                if (bubble.classList.contains('popped')) return;
                bubble.classList.add('popped');
                createMiniSparkles(bubble);
            });

            grid.appendChild(bubble);
        });
    }

    function createMiniSparkles(el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 12; i++) {
            const spark = document.createElement('div');
            spark.style.cssText = `
                position:fixed;
                width:4px;height:4px;
                background:${Math.random() > 0.5 ? '#d4a843' : '#3b82f6'};
                border-radius:50%;
                left:${centerX}px;top:${centerY}px;
                pointer-events:none;
                z-index:20000;
                transition:all 0.6s cubic-bezier(0.16,1,0.3,1);
            `;
            document.body.appendChild(spark);

            requestAnimationFrame(() => {
                const angle = (i / 12) * Math.PI * 2;
                const dist = 40 + Math.random() * 30;
                spark.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`;
                spark.style.opacity = '0';
            });

            setTimeout(() => spark.remove(), 700);
        }
    }

    // ============================================================
    //  MEMORY WALL (Section 6)
    // ============================================================
    function initMemoryWall() {
        const addBtn = $('#addNoteBtn');
        const modal = $('#memoryModal');
        const closeBtn = $('#memoryModalClose');
        const submitBtn = $('#memorySubmit');
        const wall = $('#memoryWall');

        addBtn.addEventListener('click', () => modal.classList.add('active'));
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });

        submitBtn.addEventListener('click', () => {
            const text = $('#memoryInput').value.trim();
            const author = $('#memoryAuthor').value.trim() || 'Anonymous';

            if (!text) return;

            const colors = ['#fef3c7', '#dbeafe', '#fce7f3', '#d1fae5', '#ede9fe'];
            const rotate = (Math.random() - 0.5) * 6;

            const note = document.createElement('div');
            note.className = 'sticky-note';
            note.style.setProperty('--bg', colors[Math.floor(Math.random() * colors.length)]);
            note.style.setProperty('--rotate', rotate + 'deg');
            note.innerHTML = `<p>${escapeHtml(text)}</p><span class="note-author">— ${escapeHtml(author)}</span>`;

            wall.insertBefore(note, addBtn);

            $('#memoryInput').value = '';
            $('#memoryAuthor').value = '';
            modal.classList.remove('active');
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================================
    //  FUN FACTS COUNTERS (Section 7)
    // ============================================================
    function initCounters() {
        const counters = $$('.fact-number');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach((el) => observer.observe(el));
    }

    function animateCounter(el) {
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';

        if (el.classList.contains('counter-infinity')) {
            el.textContent = suffix;
            return;
        }

        if (target > 100000) {
            // Abbreviate
            const formatted = formatNumber(target);
            animateText(el, formatted + suffix, 2000);
            return;
        }

        const duration = 2000;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current.toLocaleString() + (progress >= 1 ? suffix : '');
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function animateText(el, finalText, duration) {
        const start = performance.now();
        const chars = '0123456789';

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            if (progress >= 1) {
                el.textContent = finalText;
                return;
            }

            let text = '';
            for (let i = 0; i < finalText.length; i++) {
                if (chars.includes(finalText[i]) && Math.random() > progress) {
                    text += chars[Math.floor(Math.random() * chars.length)];
                } else {
                    text += finalText[i];
                }
            }
            el.textContent = text;
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function formatNumber(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(0) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
        return n.toLocaleString();
    }

    // ============================================================
    //  COUNTDOWN (Section 8)
    // ============================================================
    function initCountdown() {
        const container = $('#countdownContainer');
        // Set birthday date (August 2, current year or next year)
        const now = new Date();
        let birthdayYear = now.getFullYear();
        let birthday = new Date(birthdayYear, 7, 2, 0, 0, 0); // August 2

        // Check if birthday has passed this year
        if (now > new Date(birthdayYear, 7, 2, 23, 59, 59)) {
            birthday = new Date(birthdayYear + 1, 7, 2, 0, 0, 0);
        }

        function update() {
            const now = new Date();
            const todayStr = now.toDateString();
            const birthdayStr = birthday.toDateString();

            if (todayStr === birthdayStr || (now.getMonth() === 7 && now.getDate() === 2)) {
                container.innerHTML = `
                    <div class="countdown-celebration">
                        🎉 IT'S YOUR DAY! 🎉
                    </div>
                `;
                return;
            }

            const diff = birthday - now;
            if (diff <= 0) {
                container.innerHTML = `<div class="countdown-celebration">🎉 IT'S YOUR DAY! 🎉</div>`;
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            container.innerHTML = `
                <div class="countdown-unit">
                    <span class="countdown-value">${days}</span>
                    <span class="countdown-label">Days</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-value">${hours}</span>
                    <span class="countdown-label">Hours</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-value">${minutes}</span>
                    <span class="countdown-label">Minutes</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-value">${seconds}</span>
                    <span class="countdown-label">Seconds</span>
                </div>
            `;
        }

        update();
        setInterval(update, 1000);
    }

    // ============================================================
    //  FIREWORKS (Section 9)
    // ============================================================
    function initFireworks() {
        const btn = $('#celebrateBtn');
        btn.addEventListener('click', () => {
            launchFireworks();
            launchConfetti(4000);
            spawnBalloons(6);
        });
    }

    function launchFireworks() {
        const canvas = $('#fireworksCanvas');
        canvas.classList.add('active');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const rockets = [];
        const particles = [];
        const emojis = ['🎉', '🎊', '⭐', '✨', '💫', '🎂', '🥳'];
        const floatingEmojis = [];

        const start = Date.now();
        const duration = 5000;

        function addRocket() {
            rockets.push({
                x: Math.random() * canvas.width,
                y: canvas.height,
                targetY: Math.random() * canvas.height * 0.4 + 50,
                speed: 4 + Math.random() * 3,
                color: `hsl(${Math.random() * 360}, 80%, 60%)`,
                exploded: false,
            });
        }

        // Spawn rockets periodically
        for (let i = 0; i < 8; i++) {
            setTimeout(addRocket, i * 500);
        }

        // Floating emojis
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                emoji.style.cssText = `
                    position:fixed;
                    font-size:${1.5 + Math.random() * 1.5}rem;
                    left:${Math.random() * 90 + 5}%;
                    bottom:-40px;
                    z-index:15001;
                    pointer-events:none;
                    transition:all ${3 + Math.random() * 2}s cubic-bezier(0.16,1,0.3,1);
                    opacity:1;
                `;
                document.body.appendChild(emoji);

                requestAnimationFrame(() => {
                    emoji.style.bottom = (50 + Math.random() * 40) + '%';
                    emoji.style.opacity = '0';
                    emoji.style.transform = `translateX(${(Math.random() - 0.5) * 100}px)`;
                });

                setTimeout(() => emoji.remove(), 5000);
            }, i * 300);
        }

        function draw() {
            const elapsed = Date.now() - start;
            ctx.fillStyle = 'rgba(9,9,9,0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update rockets
            for (let i = rockets.length - 1; i >= 0; i--) {
                const r = rockets[i];
                if (!r.exploded) {
                    r.y -= r.speed;

                    // Trail
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = r.color;
                    ctx.fill();

                    if (r.y <= r.targetY) {
                        r.exploded = true;
                        // Create explosion particles
                        for (let j = 0; j < 60; j++) {
                            const angle = (j / 60) * Math.PI * 2;
                            const speed = 2 + Math.random() * 3;
                            particles.push({
                                x: r.x,
                                y: r.y,
                                vx: Math.cos(angle) * speed,
                                vy: Math.sin(angle) * speed,
                                color: r.color,
                                alpha: 1,
                                life: 80 + Math.random() * 40,
                                age: 0,
                                r: 1.5 + Math.random() * 1.5,
                            });
                        }
                    }
                }
            }

            // Update particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.03; // gravity
                p.age++;
                p.alpha = 1 - (p.age / p.life);

                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.fill();

                // Glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
                ctx.globalAlpha = p.alpha * 0.3;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            if (elapsed < duration || particles.length > 0) {
                requestAnimationFrame(draw);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.classList.remove('active');
            }
        }
        draw();
    }

    // ============================================================
    //  SECRET LETTER (Section 10)
    // ============================================================
    function initLetter() {
        const btn = $('#openLetterBtn');
        const envelope = $('#envelope');
        const content = $('#letterContent');

        btn.addEventListener('click', () => {
            envelope.classList.add('opened');
            btn.style.display = 'none';

            setTimeout(() => {
                envelope.style.display = 'none';
                content.style.display = 'block';
            }, 800);
        });
    }

    // ============================================================
    //  MUSIC PLAYER (Section 11)
    // ============================================================
    function initMusicPlayer() {
        const player = $('#musicPlayer');
        const playBtn = $('#musicPlayBtn');
        const visualizer = $('#musicVisualizer');
        const playIcon = playBtn.querySelector('.play-icon');
        const pauseIcon = playBtn.querySelector('.pause-icon');

        player.classList.add('visible');

        // We'll create a simple oscillator-based melody since we can't load external audio
        let audioCtx = null;
        let isPlaying = false;
        let melodyInterval = null;

        const melody = [
            { freq: 523.25, dur: 300 }, // C5
            { freq: 523.25, dur: 300 }, // C5
            { freq: 587.33, dur: 600 }, // D5
            { freq: 523.25, dur: 600 }, // C5
            { freq: 698.46, dur: 600 }, // F5
            { freq: 659.25, dur: 1200 }, // E5
            { freq: 523.25, dur: 300 }, // C5
            { freq: 523.25, dur: 300 }, // C5
            { freq: 587.33, dur: 600 }, // D5
            { freq: 523.25, dur: 600 }, // C5
            { freq: 783.99, dur: 600 }, // G5
            { freq: 698.46, dur: 1200 }, // F5
        ];

        function playMelody() {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

            let time = audioCtx.currentTime;
            let noteIndex = 0;

            function scheduleNotes() {
                if (!isPlaying) return;

                for (let i = 0; i < melody.length; i++) {
                    const note = melody[i];
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();

                    osc.type = 'sine';
                    osc.frequency.value = note.freq;

                    gain.gain.setValueAtTime(0, time);
                    gain.gain.linearRampToValueAtTime(0.08, time + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + note.dur / 1000);

                    osc.connect(gain);
                    gain.connect(audioCtx.destination);

                    osc.start(time);
                    osc.stop(time + note.dur / 1000);

                    time += note.dur / 1000;
                }

                // Loop
                const totalDuration = melody.reduce((sum, n) => sum + n.dur, 0);
                melodyInterval = setTimeout(() => {
                    time = audioCtx.currentTime;
                    scheduleNotes();
                }, totalDuration);
            }

            scheduleNotes();
        }

        playBtn.addEventListener('click', () => {
            if (isPlaying) {
                isPlaying = false;
                if (melodyInterval) clearTimeout(melodyInterval);
                if (audioCtx) audioCtx.suspend();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                visualizer.classList.remove('playing');
            } else {
                isPlaying = true;
                if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                    // Reschedule
                    const totalDuration = melody.reduce((sum, n) => sum + n.dur, 0);
                    melodyInterval = setTimeout(() => playMelody(), 100);
                } else {
                    playMelody();
                }
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                visualizer.classList.add('playing');
            }
            state.musicPlaying = isPlaying;
        });

        // Auto-play attempt (will likely need user gesture)
        // Don't auto-play; let user click
    }

    // ============================================================
    //  QUIZ (Section 12)
    // ============================================================
    function initQuiz() {
        const questions = [
            {
                q: "What's the birthday star's lucky number?",
                options: ['7', '23', '11', '3'],
                answer: 1,
            },
            {
                q: 'How would you describe them in one word?',
                options: ['Incredible', 'Boring', 'Average', 'Okay'],
                answer: 0,
            },
            {
                q: "What's their superpower?",
                options: ['Flying', 'Making Everyone Smile', 'Invisibility', 'Mind Reading'],
                answer: 1,
            },
            {
                q: 'Best plan for a birthday?',
                options: ['Study All Day', 'Epic Party with Friends', 'Sleep All Day', 'Work Overtime'],
                answer: 1,
            },
            {
                q: 'What does turning 23 mean?',
                options: ['Nothing Special', 'Peak Awesomeness Unlocked', 'Getting Old', 'Just Another Year'],
                answer: 1,
            },
        ];

        const questionEl = $('#quizQuestion');
        const optionsEl = $('#quizOptions');
        const progressFill = $('#quizProgressFill');
        const resultEl = $('#quizResult');

        function showQuestion() {
            if (state.quizStep >= questions.length) {
                showResult();
                return;
            }

            const q = questions[state.quizStep];
            progressFill.style.width = ((state.quizStep) / questions.length * 100) + '%';
            questionEl.textContent = q.q;
            optionsEl.innerHTML = '';

            q.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.textContent = opt;
                btn.addEventListener('click', () => handleAnswer(i, btn));
                optionsEl.appendChild(btn);
            });
        }

        function handleAnswer(index, btn) {
            const q = questions[state.quizStep];
            const options = optionsEl.querySelectorAll('.quiz-option');
            options.forEach((o) => (o.style.pointerEvents = 'none'));

            if (index === q.answer) {
                btn.classList.add('correct');
                state.quizScore++;
            } else {
                btn.classList.add('wrong');
                options[q.answer].classList.add('correct');
            }

            setTimeout(() => {
                state.quizStep++;
                showQuestion();
            }, 1200);
        }

        function showResult() {
            progressFill.style.width = '100%';
            questionEl.style.display = 'none';
            optionsEl.style.display = 'none';
            resultEl.style.display = 'block';

            const percentage = Math.round((state.quizScore / questions.length) * 100);
            let message = '';

            if (percentage >= 80) {
                message = "You really know the birthday star! 🌟";
            } else if (percentage >= 60) {
                message = "Not bad! You're a good friend! 😊";
            } else {
                message = "Time to learn more about them! 💪";
            }

            resultEl.innerHTML = `
                <h3>🎉 Quiz Complete!</h3>
                <p>Score: ${state.quizScore}/${questions.length} (${percentage}%)</p>
                <p style="margin-top:10px;">${message}</p>
            `;

            if (percentage >= 80) {
                launchConfetti(2000);
            }
        }

        showQuestion();
    }

    // ============================================================
    //  MEMORY JAR (Section 13)
    // ============================================================
    function initMemoryJar() {
        const jar = $('#memoryJar');
        const messageBox = $('#jarMessage');
        const messageText = $('#jarMessageText');
        const nextBtn = $('#jarNextBtn');

        const messages = [
            "Remember when we laughed so hard we cried? That's the kind of friendship we have. 😂",
            "You make the world brighter just by being in it. Never forget that. ✨",
            "Every moment with you is a memory I'll treasure forever. 💫",
            "Thank you for being the kind of friend everyone wishes they had. 💛",
            "Here's to more adventures, more laughs, and more incredible memories together. 🌍",
            "You're not just a year older — you're a year more amazing. 🎂",
            "Some friendships are measured in years. Ours is measured in unforgettable moments. 💎",
            "23 looks absolutely incredible on you. This is your year. 🚀",
            "If I could bottle up our friendship, it would be the most valuable thing in the world. 🍯",
            "You've grown into such an incredible person. I'm proud to be your friend. 🥹",
        ];

        jar.addEventListener('click', () => {
            if (state.jarIndex >= messages.length) state.jarIndex = 0;
            messageText.textContent = messages[state.jarIndex];
            messageBox.style.display = 'block';
            messageBox.style.animation = 'none';
            requestAnimationFrame(() => {
                messageBox.style.animation = 'fadeInUp 0.5s var(--ease-out-expo)';
            });
            state.jarIndex++;
        });

        nextBtn.addEventListener('click', () => {
            jar.click();
        });
    }

    // ============================================================
    //  LIGHTBOX (Section 3)
    // ============================================================
    function initLightbox() {
        const lightbox = $('#lightbox');
        const content = $('#lightboxContent');
        const close = $('#lightboxClose');
        const polaroids = $$('.polaroid');

        polaroids.forEach((p) => {
            p.addEventListener('click', () => {
                const imgDiv = p.querySelector('.polaroid-img');
                const caption = p.querySelector('.polaroid-caption').textContent;
                const bg = imgDiv.style.background;
                const placeholder = imgDiv.querySelector('.polaroid-placeholder').innerHTML;

                content.innerHTML = `
                    <div style="background:${bg};aspect-ratio:1;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:3rem;color:rgba(255,255,255,0.6);">${placeholder}</div>
                    <p style="text-align:center;margin-top:20px;font-family:var(--font-handwritten);font-size:1.3rem;color:var(--white-soft);">${caption}</p>
                `;
                lightbox.classList.add('active');
            });
        });

        close.addEventListener('click', () => lightbox.classList.remove('active'));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.classList.remove('active');
        });
    }

    // ============================================================
    //  ENDING CANVAS (slow fireworks + stars)
    // ============================================================
    function initEndingCanvas() {
        const canvas = $('#endingCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w, h;
        const particles = [];

        function resize() {
            w = canvas.width = canvas.offsetWidth;
            h = canvas.height = canvas.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Slow fireworks
        function addParticleBurst() {
            const cx = Math.random() * w;
            const cy = Math.random() * h * 0.5 + h * 0.1;
            const color = `hsl(${Math.random() * 60 + 30}, 70%, 60%)`;

            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2;
                const speed = 0.5 + Math.random() * 1;
                particles.push({
                    x: cx, y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 0.8,
                    color,
                    life: 120 + Math.random() * 60,
                    age: 0,
                    r: 1 + Math.random(),
                });
            }
        }

        const sectionEl = $('#sectionEnding');
        let isVisible = false;

        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0.1 });
        observer.observe(sectionEl);

        setInterval(() => {
            if (isVisible) addParticleBurst();
        }, 3000);

        function animate() {
            ctx.fillStyle = 'rgba(9,9,9,0.05)';
            ctx.fillRect(0, 0, w, h);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.005;
                p.age++;
                p.alpha = 0.8 * (1 - p.age / p.life);

                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ============================================================
    //  FLOATING LANTERNS
    // ============================================================
    function spawnLanterns() {
        const container = $('#floatingLanterns');
        if (!container) return;

        for (let i = 0; i < 12; i++) {
            const lantern = document.createElement('div');
            lantern.className = 'lantern';
            lantern.style.left = Math.random() * 100 + '%';
            lantern.style.setProperty('--duration', (12 + Math.random() * 10) + 's');
            lantern.style.setProperty('--drift', (Math.random() - 0.5) * 100 + 'px');
            lantern.style.animationDelay = Math.random() * 15 + 's';
            container.appendChild(lantern);
        }
    }

    // ============================================================
    //  INIT EVERYTHING
    // ============================================================
    function init() {
        initLoader();
        initCursor();
        initScrollProgress();
        initParticles();
        initLanding();
        initBubbles();
        initMemoryWall();
        initCounters();
        initFireworks();
        initLetter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
