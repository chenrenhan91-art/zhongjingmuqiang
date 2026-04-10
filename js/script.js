document.addEventListener('DOMContentLoaded', () => {

    const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
    const revealTargets = Array.from(document.querySelectorAll('.section, .trust-bar, .banner-cta, .site-footer'));

    revealTargets.forEach((element) => element.classList.add('reveal-section'));

    const setActiveNavLink = (sectionId) => {
        navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${sectionId}`;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-visible');

            if (entry.target.id) {
                setActiveNavLink(entry.target.id);
            }
        });
    }, {
        threshold: 0.28,
        rootMargin: '0px 0px -12% 0px'
    });

    revealTargets.forEach((element) => sectionObserver.observe(element));

    const heroSection = document.getElementById('hero');
    if (heroSection) {
        setActiveNavLink('hero');
    }

    const interactiveCards = Array.from(document.querySelectorAll('.service-card, .project-card, .stat-box'));
    const canUseFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (canUseFinePointer && interactiveCards.length > 0) {
        interactiveCards.forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;

                const rotateY = (x - 0.5) * 8;
                const rotateX = (0.5 - y) * 7;

                card.style.setProperty('--mouse-x', `${(x * 100).toFixed(2)}%`);
                card.style.setProperty('--mouse-y', `${(y * 100).toFixed(2)}%`);
                card.style.setProperty('--card-rotate-x', `${rotateX.toFixed(2)}deg`);
                card.style.setProperty('--card-rotate-y', `${rotateY.toFixed(2)}deg`);
                card.classList.add('is-tilting');
            });

            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--card-rotate-x', '0deg');
                card.style.setProperty('--card-rotate-y', '0deg');
                card.style.setProperty('--mouse-x', '50%');
                card.style.setProperty('--mouse-y', '50%');
                card.classList.remove('is-tilting');
            });
        });
    }

    /* -----------------------------------------------------------
       Header Scroll Effect
       ----------------------------------------------------------- */
    const header = document.getElementById('site-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* -----------------------------------------------------------
       1. 初始化动态玻璃网格 (Interactive Glass Grid)
       ----------------------------------------------------------- */
    const gridContainer = document.getElementById('glass-grid');
    if(gridContainer) {
        const panelSize = 120; // 面板近似大小: 120px

        let columns = 0;
        let rows = 0;

        function buildGrid() {
            gridContainer.innerHTML = '';
            
            const width = window.innerWidth * 1.1;
            const height = window.innerHeight * 1.1;

            columns = Math.ceil(width / panelSize);
            rows = Math.ceil(height / panelSize);

            gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

            const totalPanels = columns * rows;
            for (let i = 0; i < totalPanels; i++) {
                const panel = document.createElement('div');
                panel.classList.add('glass-panel');
                panel.addEventListener('mouseenter', () => activatePanel(panel));
                gridContainer.appendChild(panel);
            }
        }

        let activeTimeoutMap = new Map();

        function activatePanel(panel) {
            if (activeTimeoutMap.has(panel)) {
                clearTimeout(activeTimeoutMap.get(panel));
            }

            panel.classList.add('lit');

            const timeout = setTimeout(() => {
                panel.classList.remove('lit');
                activeTimeoutMap.delete(panel);
            }, 150);

            activeTimeoutMap.set(panel, timeout);
        }

        buildGrid();
        window.addEventListener('resize', () => {
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(buildGrid, 200);
        });
    }

    /* -----------------------------------------------------------
       2. 动态光源追踪 & 沉浸式视差效果 (Dynamic Spotlight & Micro Parallax)
       ----------------------------------------------------------- */
    const spotlight = document.getElementById('spotlight');
    const bgWrapper = document.getElementById('bg-wrapper');
    const reflectionLayer = document.getElementById('reflection-layer');

    if(spotlight && bgWrapper) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        
        let currentX = mouseX;
        let currentY = mouseY;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateMovement() {
            // Smooth interpolation
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;

            // Update Spotlight & Fresnel Reflection Mask
            const lightOffsetX = currentX + (window.innerWidth * 0.05);
            const lightOffsetY = currentY + (window.innerHeight * 0.05);
            
            spotlight.style.transform = `translate(${lightOffsetX}px, ${lightOffsetY}px) translate(-50%, -50%)`;
            
            if (reflectionLayer) {
                reflectionLayer.style.setProperty('--mouse-x', `${lightOffsetX}px`);
                reflectionLayer.style.setProperty('--mouse-y', `${lightOffsetY}px`);
            }

            // Update Parallax
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            const deltaX = (currentX - centerX) / centerX;
            const deltaY = (currentY - centerY) / centerY;

            const parallaxOffsetX = -deltaX * 30; 
            const parallaxOffsetY = -deltaY * 30;

            bgWrapper.style.transform = `translate3d(${parallaxOffsetX}px, ${parallaxOffsetY}px, 0)`;

            requestAnimationFrame(animateMovement);
        }

        animateMovement();
    }
});
