class TerminalLogin {
    constructor() {
        this.terminalText = document.getElementById('terminalText');
        this.accessText = document.getElementById('accessText');
        this.loginScreen = document.querySelector('.login-screen');
        this.loginSequence = [
            { 
                text: '> VPN Access successful.. ',
                typing: true,
                delay: 1000 
            },
            { 
                text: 'yd@arch$> sudo nmap -Pn -sV 10.243.200.246',
                typing: true,
                delay: 800 
            },
            { 
                text: `Starting Nmap 7.94 ( https://nmap.org )
Scanning 10.243.200.246 [1000 ports]
    PORT      STATE    SERVICE     VERSION
    22/tcp    open     ssh         OpenSSH 8.2p1
    80/tcp    open     http        Apache/2.4.41
    3000/tcp  open     http        Node.js Express
    5432/tcp  filtered postgresql  PostgreSQL DB

Nmap done: 1 IP address (1 host up) scanned in 3.52 seconds`,
                typing: false,
                delay: 2000
            },
            { 
                text: 'yd@arch$> python3 nodescan.py -h 10.243.200.246 -p 3000\nStarting vulnerability scan on Node.js service...',
                typing: true,
                delay: 1200
            },
            {
                text: '[+] Initiating scan on 10.243.200.246:3000\n[+] Detected potentially dangerous `eval()` usage in application logic\n[+] Warning: Unvalidated input passed to `eval()`\n[+] Exploitation possible: Remote Code Execution (RCE) achievable via crafted payloads\n',
                typing: false,
                delay: 1500
            },
            
            
            {
                text: 'yd@arch$> ./prepare_loader payload.bin stub.json | curl -X POST http://10.243.200.246:3000/api/upload -H "Content-Type: application/json" --data @-',
                typing: true,
                delay: 1500
            },
            {
                text: '[+] Generating shellcode...\n[+] Obfuscating payload...\n[+] Encoding payload...\n[+] Being inject...\n{ "status": "success", "data": { "fileId": "a7f8d9b2-1234-4f56-7890-abcdef123456", "uploadTime": "2024-12-23T15:45:30Z" } }',
                typing: false,
                delay: 2000
            },
            
            {
                text: 'yd@arch$> sudo agent-handler --listen 443\nListening on 0.0.0.0 443\n[!] Connection received from 10.243.200.246:39812',
                typing: true,
                delay: 2000
            },
            {
                text: '[+] Reverse shell established',
                typing: false,
                delay: 500
            },
            {
                text: '$ whoami\nvisitor',
                typing: true,
                delay: 1000
            }
        ];
        this.init();
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