class BlogManager {
    constructor() {
        this.blogList = document.getElementById('blog-list');
        this.blogContent = document.getElementById('blog-content');
        this.postContent = document.getElementById('post-content');
        this.terminalInput = document.getElementById('terminal-input');
        this.themeManager = new ThemeManager();
        this.posts = [];
        
        this.init();
    }

    async init() {
        await this.loadBlogConfig();
        this.setupEventListeners();
        this.checkUrlAndLoadPost();
        this.setupTerminal();
    }

    async loadBlogConfig() {
        try {
            const response = await fetch('configs/blog.json');
            if (!response.ok) throw new Error('Failed to load blog config');
            
            const config = await response.json();
            this.posts = config.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.renderBlogList();
        } catch (error) {
            console.error('Error loading blog config:', error);
            this.showError('Failed to load blog posts');
        }
    }

    renderBlogList() {
        this.blogList.innerHTML = this.posts.map(post => `
            <div class="blog-item" data-id="${post.id}">
                <div class="title">> ${post.title}</div>
                <div class="description">${post.description}</div>
                <div class="meta">
                    <span class="date">${this.formatDate(post.date)}</span>
                    <span class="tags">${post.tags.map(tag => `#${tag}`).join(' ')}</span>
                </div>
            </div>
        `).join('');
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    setupEventListeners() {
        this.blogList.addEventListener('click', (e) => {
            const blogItem = e.target.closest('.blog-item');
            if (blogItem) {
                const postId = blogItem.dataset.id;
                this.loadPost(postId);
                history.pushState({ postId }, '', `?post=${postId}`);
            }
        });

        window.addEventListener('popstate', (e) => {
            if (e.state?.postId) {
                this.loadPost(e.state.postId);
            } else {
                this.showList();
            }
        });
    }

    setupTerminal() {
        this.terminalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = this.terminalInput.value.trim();
                this.handleCommand(command);
                this.terminalInput.value = '';
            }
        });

        // Terminal inputa otomatik fokus
        this.terminalInput.focus();
        document.addEventListener('click', () => {
            this.terminalInput.focus();
        });
    }

    handleCommand(command) {
        switch (command.toLowerCase()) {
            case 'cd ..':
            case 'cd..':
                this.showList();
                history.pushState({}, '', window.location.pathname);
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'help':
                this.showHelp();
                break;
            default:
                this.showError(`Command not found: ${command}`);
        }
    }

    clearTerminal() {
        if (!this.blogContent.classList.contains('hidden')) {
            this.postContent.innerHTML = '';
        } else {
            this.blogList.innerHTML = '';
            this.renderBlogList();
        }
    }

    showHelp() {
        const helpHtml = `
            <div class="help-content">
                <div class="title">> Available Commands</div>
                <div class="commands">
                    cd ..     - Return to blog list
                    clear    - Clear terminal
                    help     - Show this help message
                </div>
            </div>
        `;
        
        if (!this.blogContent.classList.contains('hidden')) {
            this.postContent.innerHTML = helpHtml;
        } else {
            this.blogList.innerHTML = helpHtml;
        }
    }

    checkUrlAndLoadPost() {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post');
        if (postId) {
            this.loadPost(postId);
        }
    }

    async loadPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) {
            this.showError('Blog post not found');
            return;
        }

        try {
            const response = await fetch(`blog/${post.file}`);
            if (!response.ok) throw new Error('Failed to load blog post');
            
            const markdown = await response.text();
            
            // Marked.js ayarlarını güncelle
            marked.setOptions({
                highlight: function(code, lang) {
                    if (Prism.languages[lang]) {
                        return Prism.highlight(code, Prism.languages[lang], lang);
                    }
                    return code;
                }
            });

            this.postContent.innerHTML = marked.parse(markdown);
            
            // Kod bloklarına sınıf ekle
            this.postContent.querySelectorAll('pre code').forEach(block => {
                const language = block.getAttribute('class') || 'language-plaintext';
                block.parentElement.classList.add(language);
                block.classList.add(language);
            });
            
            // Prism.js'i yeni eklenen kod blokları için tetikle
            Prism.highlightAll();
            
            this.showPost();
        } catch (error) {
            console.error('Error loading blog post:', error);
            this.showError('Failed to load blog post');
        }
    }

    showError(message) {
        const errorHtml = `
            <div class="error-message">
                <div class="title">> Error</div>
                <div class="message">${message}</div>
            </div>
        `;
        
        if (this.blogContent.classList.contains('hidden')) {
            this.blogList.innerHTML = errorHtml;
        } else {
            this.postContent.innerHTML = errorHtml;
        }
    }

    showList() {
        this.blogList.classList.remove('hidden');
        this.blogContent.classList.add('hidden');
    }

    showPost() {
        this.blogList.classList.add('hidden');
        this.blogContent.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});
