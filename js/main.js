class BlogSystem {
    constructor() {
        this.blogDir = 'blog/';
        this.blogNav = document.getElementById('blog-nav');
        this.blogContent = document.getElementById('blog-content');
        this.blogPosts = [];
        
        this.init();
    }
    
    async init() {
        try {
            // Blog yazılarını yükle
            await this.loadBlogPosts();
            
            // URL'deki parametreleri kontrol et
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('post');
            
            if (postId) {
                await this.loadPost(postId);
            } else {
                this.showLatestPost();
            }
        } catch (error) {
            console.error('Blog yüklenirken hata:', error);
            this.showError('Blog yüklenirken bir hata oluştu.');
        }
    }
    
    async loadBlogPosts() {
        // Bu kısımda normalde bir API'den blog listesini alırdık
        // Şimdilik statik olarak tanımlıyoruz
        this.blogPosts = [
            { id: 'blog-1', title: 'Linux Güvenliği', file: 'blog-1.md' },
            // Diğer blog yazıları buraya eklenebilir
        ];
        
        this.renderBlogNav();
    }
    
    renderBlogNav() {
        this.blogNav.innerHTML = this.blogPosts
            .map(post => `
                <a href="?post=${post.id}" data-id="${post.id}">
                    > ${post.title}
                </a>
            `)
            .join('');
            
        // Event listeners ekle
        this.blogNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const postId = link.dataset.id;
                await this.loadPost(postId);
                // URL'yi güncelle
                window.history.pushState({}, '', `?post=${postId}`);
            });
        });
    }
    
    async loadPost(postId) {
        const post = this.blogPosts.find(p => p.id === postId);
        if (!post) {
            this.showError('Blog yazısı bulunamadı.');
            return;
        }
        
        try {
            const response = await fetch(`${this.blogDir}${post.file}`);
            if (!response.ok) throw new Error('Blog yazısı yüklenemedi.');
            
            const markdown = await response.text();
            this.renderPost(markdown);
        } catch (error) {
            console.error('Blog yazısı yüklenirken hata:', error);
            this.showError('Blog yazısı yüklenirken bir hata oluştu.');
        }
    }
    
    renderPost(markdown) {
        this.blogContent.innerHTML = marked.parse(markdown);
    }
    
    showLatestPost() {
        if (this.blogPosts.length > 0) {
            this.loadPost(this.blogPosts[0].id);
        }
    }
    
    showError(message) {
        this.blogContent.innerHTML = `<div class="error">${message}</div>`;
    }
}

// Blog sistemini başlat
document.addEventListener('DOMContentLoaded', () => {
    new BlogSystem();
});