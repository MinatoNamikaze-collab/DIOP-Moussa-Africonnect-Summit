// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
    conferenceDate: new Date('2026-07-23T09:00:00'),
    scrollThreshold: 80,
    backToTopThreshold: 300,
};

// ========================================
// 1. DARK MODE
// ========================================
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggle());
        }
    },
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    },
    
    toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
};

// ========================================
// 2. NAVBAR DYNAMIQUE
// ========================================
const NavbarManager = {
    init() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.querySelector('.navbar-links');
        
        if (this.hamburger && this.navLinks) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }
        
        window.addEventListener('scroll', () => this.handleScroll());
    },
    
    toggleMenu() {
        this.hamburger.classList.toggle('active');
        this.navLinks.classList.toggle('open');
        const expanded = this.hamburger.classList.contains('active');
        this.hamburger.setAttribute('aria-expanded', expanded);
    },
    
    handleScroll() {
        if (!this.navbar) return;
        
        if (window.scrollY > CONFIG.scrollThreshold) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
};

// ========================================
// 3. COMPTE À REBOURS
// ========================================
const CountdownManager = {
    init() {
        this.update();
        setInterval(() => this.update(), 1000);
    },
    
    update() {
        const now = new Date();
        const diff = CONFIG.conferenceDate - now;
        
        if (diff <= 0) {
            const container = document.getElementById('countdown');
            if (container) {
                container.innerHTML = '<p style="font-size:1.5rem; font-weight:600;">🎉 La conférence a commencé !</p>';
            }
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        this.setElement('days', days);
        this.setElement('hours', hours);
        this.setElement('minutes', minutes);
        this.setElement('seconds', seconds);
    },
    
    setElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = String(value).padStart(2, '0');
    }
};

// ========================================
// 4. COMPTEURS ANIMÉS AU SCROLL
// ========================================
const CounterManager = {
    init() {
        this.counters = document.querySelectorAll('.stat-number');
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );
        
        this.counters.forEach(counter => this.observer.observe(counter));
    },
    
    animateCounter(element) {
        const target = parseInt(element.dataset.target);
        if (isNaN(target) || element.dataset.animated) return;
        
        element.dataset.animated = 'true';
        const duration = 2000;
        const startTime = performance.now();
        const startValue = 0;
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeOutQuad(progress);
            const current = Math.floor(startValue + (target - startValue) * eased);
            
            element.textContent = current + (target > 1 ? '+' : '');
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target + (target > 1 ? '+' : '');
            }
        };
        
        requestAnimationFrame(update);
    },
    
    easeOutQuad(t) {
        return t * (2 - t);
    }
};

// ========================================
// 5. ANIMATIONS AU SCROLL (FADE-IN)
// ========================================
const ScrollAnimationManager = {
    init() {
        const elements = document.querySelectorAll('.fade-in, .why-item, .theme-item');
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { 
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );
        
        elements.forEach(el => observer.observe(el));
    }
};

// ========================================
// 6. ONGLETS DU PROGRAMME
// ========================================
const TabManager = {
    init() {
        this.tabs = document.querySelectorAll('.tab-btn');
        this.contents = document.querySelectorAll('.tab-content');
        
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    },
    
    switchTab(tabId) {
        this.tabs.forEach(tab => {
            const isActive = tab.dataset.tab === tabId;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });
        
        this.contents.forEach(content => {
            const isActive = content.id === tabId;
            content.classList.toggle('active', isActive);
        });
    }
};

// ========================================
// 7. FILTRAGE DES INTERVENANTS
// ========================================
const FilterManager = {
    init() {
        this.buttons = document.querySelectorAll('.filter-btn');
        this.cards = document.querySelectorAll('.speaker-card');
        
        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => this.filter(btn.dataset.filter));
        });
    },
    
    filter(category) {
        this.buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
        
        this.cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.classList.remove('hidden');
                card.classList.remove('visible');
                setTimeout(() => card.classList.add('visible'), 50);
            } else {
                card.classList.add('hidden');
            }
        });
    }
};

// ========================================
// 8. VALIDATION DE FORMULAIRE
// ========================================
const FormManager = {
    init() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;
        
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error') || input.classList.contains('success')) {
                    this.validateField(input);
                }
            });
        });
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },
    
    validateField(input) {
        const id = input.id;
        let isValid = true;
        let errorMessage = '';
        
        switch(id) {
            case 'name':
                isValid = input.value.trim().length >= 2;
                errorMessage = 'Le nom doit contenir au moins 2 caractères';
                break;
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                errorMessage = 'Veuillez entrer un email valide (ex: nom@domaine.com)';
                break;
            case 'phone':
                isValid = input.value.replace(/\D/g, '').length >= 8;
                errorMessage = 'Le téléphone doit contenir au moins 8 chiffres';
                break;
            case 'participantType':
                isValid = input.value !== '';
                errorMessage = 'Veuillez sélectionner un type de participation';
                break;
            case 'country':
                isValid = input.value !== '';
                errorMessage = 'Veuillez sélectionner votre pays';
                break;
            case 'message':
                isValid = input.value.trim().length >= 20;
                errorMessage = 'Le message doit contenir au moins 20 caractères';
                break;
            default:
                return true;
        }
        
        const errorEl = document.getElementById(id + 'Error');
        input.classList.remove('error', 'success');
        
        if (isValid) {
            input.classList.add('success');
            if (errorEl) {
                errorEl.classList.remove('show');
                errorEl.textContent = '';
            }
        } else {
            input.classList.add('error');
            if (errorEl) {
                errorEl.textContent = errorMessage;
                errorEl.classList.add('show');
            }
        }
        
        return isValid;
    },
    
    handleSubmit(e) {
        e.preventDefault();
        
        const inputs = this.form.querySelectorAll('input, select, textarea');
        let allValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                allValid = false;
            }
        });
        
        if (allValid) {
            this.showSuccess();
            this.form.reset();
            inputs.forEach(input => {
                input.classList.remove('success', 'error');
            });
        } else {
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.focus();
            }
        }
    },
    
    showSuccess() {
        const successEl = document.getElementById('formSuccess');
        if (successEl) {
            successEl.classList.add('show');
            setTimeout(() => {
                successEl.classList.remove('show');
            }, 5000);
        }
    }
};

// ========================================
// 9. BOUTON RETOUR EN HAUT
// ========================================
const BackToTopManager = {
    init() {
        this.button = document.getElementById('backToTop');
        if (!this.button) return;
        
        this.button.addEventListener('click', () => this.scrollToTop());
        window.addEventListener('scroll', () => this.toggleVisibility());
    },
    
    toggleVisibility() {
        if (window.scrollY > CONFIG.backToTopThreshold) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    },
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

// ========================================
// 10. ANNÉE DYNAMIQUE DANS LE FOOTER
// ========================================
const YearManager = {
    init() {
        const yearElements = document.querySelectorAll('#year');
        const currentYear = new Date().getFullYear();
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    }
};

// ========================================
// 11. INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.init();
    NavbarManager.init();
    CountdownManager.init();
    CounterManager.init();
    ScrollAnimationManager.init();
    TabManager.init();
    FilterManager.init();
    FormManager.init();
    BackToTopManager.init();
    YearManager.init();
});

