// NeuroFlow AI - Next-Gen Operations Engine (Phase 1 Hackathon Specs)

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------
    // 0. LOADER ORCHESTRATION (Under 500ms Performance Cap)
    // ----------------------------------------------------------------
    const loaderBar = document.getElementById('loader-bar');
    if (loaderBar) {
        // Fast hardware-accelerated fill
        loaderBar.style.width = '100%';
        setTimeout(() => {
            loaderBar.style.opacity = '0';
            setTimeout(() => {
                loaderBar.style.display = 'none';
            }, 150);
        }, 350); // Fully interactive and cleared at 350ms, beating 500ms cap
    }

    // ----------------------------------------------------------------
    // 1. FLOATING TELEMETRY MONITOR LOGGER
    // ----------------------------------------------------------------
    const consoleLogs = document.getElementById('console-logs');
    const clearConsoleBtn = document.getElementById('clear-console-btn');

    function logToConsole(type, text) {
        if (!consoleLogs) return;

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

        entry.innerHTML = `[${timeStr}] ${text}`;
        consoleLogs.appendChild(entry);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;

        // Caps output count
        while (consoleLogs.childElementCount > 30) {
            consoleLogs.removeChild(consoleLogs.firstChild);
        }
    }

    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener('click', () => {
            consoleLogs.innerHTML = `<div class="log-entry system">[Console Cleared] Tracking active...</div>`;
        });
    }

    // ----------------------------------------------------------------
    // 2. FEATURE 1: MATRIX-DRIVEN PRICING ENGINE
    // ----------------------------------------------------------------
    // Pricing configuration matrix representing base tiers, currencies, and annual discount coefficients
    const pricingMatrix = {
        baseRates: {
            developer: 19,
            scale: 59,
            enterprise: 139
        },
        currencyConfig: {
            USD: { symbol: '$', rate: 1.0, multiplier: 1.0 },
            INR: { symbol: '₹', rate: 83.5, multiplier: 0.82 }, // Purchasing power parity discount factor
            EUR: { symbol: '€', rate: 0.92, multiplier: 0.98 }
        },
        annualDiscount: 0.20 // 20% flat discount on annual subscriptions
    };

    // Isolated State Nodes
    let billingCycle = 'monthly'; // 'monthly' or 'annual'
    let activeCurrency = 'USD'; // 'USD', 'INR', or 'EUR'

    // DOM Target Nodes for Isolated Updates (Re-render Guardrail)
    const priceNodes = {
        developer: document.getElementById('price-developer'),
        scale: document.getElementById('price-scale'),
        enterprise: document.getElementById('price-enterprise')
    };

    const symbolNodes = {
        developer: document.getElementById('symbol-developer'),
        scale: document.getElementById('symbol-scale'),
        enterprise: document.getElementById('symbol-enterprise')
    };

    // Interactive Controller Elements
    const billingToggleBtn = document.getElementById('billing-toggle');
    const currencySelect = document.getElementById('currency-select');
    const labelMonthly = document.getElementById('label-monthly');
    const labelAnnual = document.getElementById('label-annual');

    // Isolated Price Calculation & DOM Node Injection
    function updatePrices() {
        const t0 = performance.now(); // benchmark duration
        
        const currencyData = pricingMatrix.currencyConfig[activeCurrency];
        const conversionRate = currencyData.rate;
        const regionalDiscount = currencyData.multiplier;

        logToConsole('system', `Pricing Trigger: Currency=${activeCurrency} | Schedule=${billingCycle}`);

        // Iterate through tiers and update text values in place (zero component re-renders)
        Object.keys(priceNodes).forEach(tier => {
            const baseRate = pricingMatrix.baseRates[tier];
            
            // Apply conversion rates and regional multipliers
            let finalPrice = baseRate * conversionRate * regionalDiscount;
            
            // Apply 20% annual discount if active
            if (billingCycle === 'annual') {
                finalPrice = finalPrice * (1 - pricingMatrix.annualDiscount);
            }

            // Update text nodes directly - isolated updates
            const priceTextNode = priceNodes[tier];
            const symbolTextNode = symbolNodes[tier];
            
            if (priceTextNode && symbolTextNode) {
                const formattedPrice = Math.round(finalPrice);
                
                // PERFORMANCE GUARDRAIL: We only mutate the specific text nodes
                priceTextNode.textContent = formattedPrice.toString();
                symbolTextNode.textContent = currencyData.symbol;
                
                logToConsole('mutate', ` -> Node '#price-${tier}' mutated: ${currencyData.symbol}${formattedPrice}`);
            }
        });

        const t1 = performance.now();
        const latency = (t1 - t0).toFixed(3);
        logToConsole('success', `Isolated DOM update complete. Latency: ${latency}ms | 0% Parent reflows`);
    }

    // Toggle Handler (150ms-200ms Transition Curve compliant)
    if (billingToggleBtn) {
        billingToggleBtn.addEventListener('click', () => {
            // State swap
            if (billingCycle === 'monthly') {
                billingCycle = 'annual';
                billingToggleBtn.classList.add('active');
                labelMonthly.classList.remove('active');
                labelAnnual.classList.add('active');
            } else {
                billingCycle = 'monthly';
                billingToggleBtn.classList.remove('active');
                labelMonthly.classList.add('active');
                labelAnnual.classList.remove('active');
            }
            
            // Execute performance-isolated pricing update
            updatePrices();
        });
    }

    // Currency Dropdown Handler
    if (currencySelect) {
        currencySelect.addEventListener('change', (e) => {
            activeCurrency = e.target.value;
            // Execute performance-isolated pricing update
            updatePrices();
        });
    }

    // Initialize pricing numbers
    updatePrices();


    // ----------------------------------------------------------------
    // 3. FEATURE 2: BENTO-TO-ACCORDION WITH CONTEXT LOCK
    // ----------------------------------------------------------------
    const bentoCards = document.querySelectorAll('.bento-card');
    let activeIndex = 0; // Global layout index state
    let isMobile = window.innerWidth < 768;

    // Apply active class to DOM elements
    function updateLayoutStyles() {
        bentoCards.forEach((card, idx) => {
            if (idx === activeIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // Setup interactive hooks
    bentoCards.forEach((card, idx) => {
        // Desktop Hover Trigger
        card.addEventListener('mouseenter', () => {
            if (!isMobile) {
                activeIndex = idx;
                updateLayoutStyles();
            }
        });

        // Mobile Touch/Click Trigger (Accordion Expansion)
        card.addEventListener('click', () => {
            if (isMobile) {
                activeIndex = idx;
                updateLayoutStyles();
                logToConsole('system', `Accordion row ${activeIndex} expanded on mobile.`);
            }
        });
    });

    // Context Lock Tracker on Viewport Resize
    window.addEventListener('resize', () => {
        const wasMobile = isMobile;
        isMobile = window.innerWidth < 768;

        // Breakpoint transition occurred (Desktop <-> Mobile)
        if (wasMobile !== isMobile) {
            updateLayoutStyles();
            logToConsole('warn', `Viewport Reflow: Context index ${activeIndex} locked and transferred.`);
        }
    });

    // Run initial style pass
    updateLayoutStyles();


    // ----------------------------------------------------------------
    // 4. INTERACTIVE BACKGROUND CANVAS (HERO SECTION)
    // ----------------------------------------------------------------
    const canvas = document.getElementById('hero-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        const numberOfParticles = 45;
        let mouse = { x: null, y: null, radius: 100 };

        function setCanvasDimensions() {
            const rect = canvas.parentNode.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
        }

        window.addEventListener('resize', setCanvasDimensions);
        setCanvasDimensions();

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                const rect = canvas.getBoundingClientRect();
                this.x = Math.random() * rect.width;
                this.y = Math.random() * rect.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.6;
                this.speedY = (Math.random() - 0.5) * 0.6;
            }

            update(width, height) {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > width) this.speedX *= -1;
                if (this.y < 0 || this.y > height) this.speedY *= -1;

                // Mouse interaction
                if (mouse.x && mouse.y) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= (dx / distance) * force * 0.4;
                        this.y -= (dy / distance) * force * 0.4;
                    }
                }
            }

            draw() {
                ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        function drawConnections() {
            const rect = canvas.getBoundingClientRect();
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a + 1; b < particlesArray.length; b++) {
                    const dx = particlesArray[a].x - particlesArray[b].x;
                    const dy = particlesArray[a].y - particlesArray[b].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const connectionRange = 75;

                    if (dist < connectionRange) {
                        const opacity = (1 - (dist / connectionRange)) * 0.12;
                        ctx.strokeStyle = `rgba(174, 61, 242, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            const rect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);

            particlesArray.forEach(p => {
                p.update(rect.width, rect.height);
                p.draw();
            });

            drawConnections();
            requestAnimationFrame(animate);
        }

        initParticles();
        animate();
    }
});
