class Terminal {
    constructor() {
        this.terminalText = document.getElementById('terminalText');
        this.commandInput = document.getElementById('commandInput');
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentPath = '/';
        
        this.fileSystem = {
            '/': {
                type: 'dir',
                contents: {
                    'blog': {
                        type: 'dir',
                        contents: {
                            'index.md': { type: 'file', size: 2048, lastModified: new Date('2024-12-22') }
                        }
                    },
                    'projects': {
                        type: 'dir',
                        contents: {
                            'project1.md': { type: 'file', size: 1024, lastModified: new Date('2024-12-22') }
                        }
                    },
                    'about.md': { type: 'file', size: 1234, lastModified: new Date('2024-12-22') }
                }
            }
        };
        
        this.setupEventListeners();
        this.setupTerminalControls();
        this.showWelcomeMessage();
    }
 
    setupTerminalControls() {
        const close = document.querySelector('.terminal-button.close');
        const back = document.querySelector('.terminal-button.minimize');
        const forward = document.querySelector('.terminal-button.maximize');
 
        close.addEventListener('click', () => window.location.href = '/');
        back.addEventListener('click', () => window.history.back());
        forward.addEventListener('click', () => window.history.forward());
    }
 
    setupEventListeners() {
        this.commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.commandInput.value.trim();
                this.executeCommand(command);
                this.commandInput.value = '';
                
                if (command) {
                    this.commandHistory.push(command);
                    this.historyIndex = this.commandHistory.length;
                }
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.commandInput.value = this.commandHistory[this.historyIndex];
                }
            }
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    this.commandInput.value = this.commandHistory[this.historyIndex];
                } else {
                    this.historyIndex = this.commandHistory.length;
                    this.commandInput.value = '';
                }
            }
        });
    }
 
    async showWelcomeMessage() {
        const welcomeMsg = [
            "Welcome to Terminal v1.0",
            "Type 'help' to see available commands",
            ""
        ];
 
        for (const msg of welcomeMsg) {
            await this.typeText(msg);
        }
    }
 
    async typeText(text, speed = 30) {
        const lineElement = document.createElement('div');
        lineElement.className = 'terminal-line';
        this.terminalText.appendChild(lineElement);
 
        for (let i = 0; i < text.length; i++) {
            const currentText = text.substring(0, i + 1);
            lineElement.innerHTML = `${currentText}`;
            await this.wait(speed);
        }
    }
 
    parseCommand(commandStr) {
        const parts = commandStr.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        return { command, args };
    }
 
    getAbsolutePath(path) {
        if (path.startsWith('/')) return path;
        return this.currentPath === '/' ? 
            '/' + path : 
            this.currentPath + '/' + path;
    }
 
    executeCommand(commandStr) {
        const lineElement = document.createElement('div');
        lineElement.className = 'terminal-line';
        lineElement.innerHTML = `<span class="prompt">visitor@system:${this.currentPath}$</span> ${commandStr}`;
        this.terminalText.appendChild(lineElement);
 
        const { command, args } = this.parseCommand(commandStr);
 
        switch (command) {
            case 'help':
                this.showHelp();
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'ls':
                this.listDirectory(args);
                break;
            case 'cd':
                this.changeDirectory(args[0] || '/');
                break;
            case 'pwd':
                this.showCurrentPath();
                break;
            case 'about':
                window.location.href = '/about.html';
                break;
            case 'blog':
                window.location.href = '/blog.html';
                break;
            case 'projects':
                window.location.href = '/projects.html';
                break;
            case 'home':
                window.location.href = '/';
                break;
            case 'date':
                this.showDate();
                break;
            case 'whoami':
                this.showWhoami();
                break;
            default:
                if (command) {
                    this.showError(`Command not found: ${command}`);
                }
        }
 
        this.commandInput.scrollIntoView({ behavior: 'smooth' });
    }
 
    listDirectory(args) {
        const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
        
        let targetPath = this.currentPath;
        const pathArg = args.find(arg => !arg.startsWith('-'));
        if (pathArg) {
            targetPath = this.getAbsolutePath(pathArg);
        }
        
        let contents = [
            ['blog', { type: 'dir', size: 4096, lastModified: new Date('2024-12-22') }],
            ['projects', { type: 'dir', size: 4096, lastModified: new Date('2024-12-22') }],
            ['about.md', { type: 'file', size: 1234, lastModified: new Date('2024-12-22') }]
        ];
        
        if (targetPath === '/blog') {
            contents = [
                ['index.md', { type: 'file', size: 2048, lastModified: new Date('2024-12-22') }]
            ];
        } else if (targetPath === '/projects') {
            contents = [
                ['project1.md', { type: 'file', size: 1024, lastModified: new Date('2024-12-22') }]
            ];
        }
 
        if (showLong) {
            let allEntries = [...contents];
            if (showAll) {
                allEntries.unshift(
                    ['.', { type: 'dir', size: 4096, lastModified: new Date() }],
                    ['..', { type: 'dir', size: 4096, lastModified: new Date() }]
                );
            }
            allEntries.sort((a, b) => a[0].localeCompare(b[0]));
            allEntries.forEach(([name, item]) => {
                const prefix = item.type === 'dir' ? 'd' : '-';
                const size = item.type === 'dir' ? 4096 : item.size;
                const date = item.lastModified.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                this.appendLine(`${prefix}rwxr-xr-x 2 visitor visitor ${size.toString().padStart(4)} ${date} ${name}`);
            });
        } else {
            const names = contents.map(([name]) => name);
            if (showAll) names.unshift('.', '..');
            this.appendLine(names.join('  '));
        }
    }
 
    changeDirectory(path) {
        if (!path) return;
        
        let newPath;
        if (path === '/') {
            newPath = '/';
        } else if (path === '..') {
            const parts = this.currentPath.split('/').filter(Boolean);
            parts.pop();
            newPath = '/' + parts.join('/');
        } else if (path === '.') {
            newPath = this.currentPath;
        } else {
            newPath = this.getAbsolutePath(path);
        }
 
        if (path === 'blog' || path === 'projects') {
            window.location.href = `/${path}.html`;
            return;
        }
 
        if (newPath !== '/' && newPath !== '/blog' && newPath !== '/projects') {
            this.showError(`cd: no such directory: ${path}`);
            return;
        }
 
        this.currentPath = newPath === '/' ? '/' : newPath.replace(/\/$/, '');
    }
 
    getDirectoryAt(path) {
        if (path === '/') return this.fileSystem['/'];
        
        const parts = path.split('/').filter(Boolean);
        let current = this.fileSystem['/'];
        
        for (const part of parts) {
            current = current.contents[part];
            if (!current) return null;
        }
        
        return current;
    }
 
    showCurrentPath() {
        this.appendLine('/home/visitor/');
    }
 
    appendLine(text) {
        const lineElement = document.createElement('div');
        lineElement.className = 'terminal-line command-output';
        lineElement.textContent = text;
        this.terminalText.appendChild(lineElement);
    }
 
    showHelp() {
        const helpText = [
            "Available commands:",
            "  help     - Show this help message",
            "  clear    - Clear terminal",
            "  ls       - List directory contents",
            "  cd       - Change directory",
            "  pwd      - Print working directory",
            "  date     - Show current date",
            "  whoami   - Show current user",
            "  blog     - Go to blog page",
            "  about    - About me",
            "  projects - View projects",
            "  home     - Go to home page",
            ""
        ];
 
        helpText.forEach(line => this.appendLine(line));
    }
 
    showError(message) {
        const lineElement = document.createElement('div');
        lineElement.className = 'terminal-line error-text';
        lineElement.textContent = message;
        this.terminalText.appendChild(lineElement);
    }
 
    clearTerminal() {
        this.terminalText.innerHTML = '';
    }
 
    showDate() {
        const lineElement = document.createElement('div');
        lineElement.className = 'terminal-line command-output';
        lineElement.textContent = new Date().toLocaleString();
        this.terminalText.appendChild(lineElement);
    }
 
    showWhoami() {
        const lineElement = document.createElement('div');
        lineElement.className = 'terminal-line command-output';
        lineElement.textContent = 'visitor';
        this.terminalText.appendChild(lineElement);
    }
 
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
 }
 
 document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new Terminal();
 });