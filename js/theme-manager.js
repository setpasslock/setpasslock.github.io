class ThemeManager {
    constructor() {
        this.themeButtons = document.querySelectorAll('.theme-button');
        this.menuIcon = document.querySelector('.theme-menu-icon');
        this.menu = document.querySelector('.theme-buttons');
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tema seçici butonları için event listener
        this.themeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const theme = button.dataset.theme;
                this.setTheme(theme);
                this.saveTheme(theme);
                
                // Aktif buton stilini güncelle
                this.updateActiveButton(theme);
                
                // Menüyü kapat
                this.toggleMenu(false);
            });
        });

        // Menü ikonu için click event listener
        this.menuIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Sayfa herhangi bir yerine tıklanınca menüyü kapat
        document.addEventListener('click', () => {
            this.toggleMenu(false);
        });

        // Menünün içine tıklanınca event'in sayfa tıklamasına ulaşmasını engelle
        this.menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    toggleMenu(force) {
        if (typeof force === 'boolean') {
            this.menu.classList.toggle('show', force);
        } else {
            this.menu.classList.toggle('show');
        }
    }

    setTheme(theme) {
        document.body.className = `theme-${theme}`;
    }

    saveTheme(theme) {
        localStorage.setItem('selectedTheme', theme);
    }

    updateActiveButton(theme) {
        this.themeButtons.forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'matrix';
        this.setTheme(savedTheme);
        this.updateActiveButton(savedTheme);
    }
}