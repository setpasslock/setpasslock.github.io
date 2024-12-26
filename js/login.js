class TerminalLogin {
    constructor() {
        this.terminalText = document.getElementById('terminalText');
        this.accessText = document.getElementById('accessText');
        this.loginScreen = document.querySelector('.login-screen');
        this.loginSequence = [];
        this.init();
    }

    updateDynamicTime(text) {
        if (text.includes('%%DYNAMIC_DATE%%')) {
            const now = new Date();
            return text.replace('%%DYNAMIC_DATE%%', now.toISOString().replace('T', ' ').split('.')[0]);
        }
        return text;
     }

    async loadScenario() {
        try {
            const response = await fetch('/configs/terminal.json');
            const config = await response.json();
            const scenarios = config.scenarios;
            const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
            this.loginSequence = randomScenario.sequence.map(item => ({
                ...item,
                text: this.updateDynamicTime(item.text)
            }));
        } catch (error) {
            console.error('Error loading scenario:', error);
        }
    }

    async typeText(text, shouldType = true) {
        const lineElement = document.createElement('div');
        lineElement.className = 'terminal-line';
        this.terminalText.appendChild(lineElement);

        if (shouldType) {
            for (let i = 0; i < text.length; i++) {
                const currentText = text.substring(0, i + 1);
                lineElement.textContent = currentText;
                await this.wait(10);
                this.autoScroll();
            }
        } else {
            lineElement.textContent = text;
            this.autoScroll();
        }

        const emptyLine = document.createElement('div');
        emptyLine.className = 'terminal-line';
        emptyLine.innerHTML = '&nbsp;';
        this.terminalText.appendChild(emptyLine);
        this.autoScroll();
    }

    autoScroll() {
        this.loginScreen.scrollTop = this.loginScreen.scrollHeight;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async init() {
        this.accessText.style.display = 'none';
        await this.loadScenario();
        
        for (const sequence of this.loginSequence) {
            await this.typeText(sequence.text, sequence.typing);
            await this.wait(sequence.delay);
        }

        await this.wait(1000);
        this.accessText.style.display = 'block';
        await this.wait(100);
        this.accessText.classList.add('show');
        this.autoScroll();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new TerminalLogin();
});
