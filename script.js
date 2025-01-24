document.addEventListener('DOMContentLoaded', () => {
    const lookupBtn = document.getElementById('lookupBtn');
    const userIdInput = document.getElementById('userId');
    const resultContainer = document.querySelector('.result-container');
    let serverProcess = null;

    // Sunucuyu başlatma fonksiyonu
    async function startServer() {
        try {
            showToast('Sunucu başlatılıyor...', false);
            const response = await fetch('http://localhost:3000/api/status');
            if (response.ok) {
                return true; // Sunucu zaten çalışıyor
            }
        } catch {
            // Sunucu çalışmıyor, başlatalım
            const command = 'start cmd.exe /K "cd /d f:/Anothers/Windsurf-Projects/örnek-mc_sitesi/smooth+perfect && npm start"';
            await new Promise((resolve) => {
                const exec = require('child_process').exec;
                serverProcess = exec(command);
                setTimeout(resolve, 3000); // Sunucunun başlaması için 3 saniye bekle
            });
            return true;
        }
    }

    // Sunucuyu kapatma fonksiyonu
    async function stopServer() {
        if (serverProcess) {
            const exec = require('child_process').exec;
            exec('taskkill /F /IM node.exe');
            serverProcess = null;
            showToast('Sunucu kapatıldı', false);
        }
    }

    // Toast bildirim fonksiyonu
    function showToast(message, isError = false) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "center",
            stopOnFocus: true,
            style: {
                background: isError ? "#ef4444" : "#10b981",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                padding: "12px 24px",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif"
            }
        }).showToast();
    }

    // Loading durumunu yönetme
    function setLoading(isLoading) {
        lookupBtn.disabled = isLoading;
        lookupBtn.innerHTML = isLoading ? 
            '<span class="loading-spinner"></span> Aranıyor...' : 
            'Ara';
        userIdInput.disabled = isLoading;
    }

    lookupBtn.addEventListener('click', async () => {
        try {
            await startServer();
            await lookupUser();
            // Kullanıcı bilgileri başarıyla alındıktan sonra sunucuyu kapat
            setTimeout(stopServer, 1000);
        } catch (error) {
            showToast('Sunucu başlatılamadı', true);
        }
    });

    userIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            lookupBtn.click();
        }
    });

    async function lookupUser() {
        const userId = userIdInput.value.trim();
        if (!userId) {
            showToast('Lütfen bir Discord kullanıcı ID\'si girin', true);
            return;
        }

        if (!/^\d+$/.test(userId)) {
            showToast('Geçersiz ID formatı. Sadece rakam kullanın.', true);
            return;
        }

        setLoading(true);
        resultContainer.style.display = 'none';

        try {
            const response = await fetch(`http://localhost:3000/api/discord/user/${userId}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API ile iletişim kurulurken bir hata oluştu');
            }

            const data = await response.json();
            
            if (!data || !data.id) {
                throw new Error('Geçersiz API yanıtı');
            }

            displayUserInfo(data);
            showToast('Kullanıcı başarıyla bulundu!');
        } catch (error) {
            console.error('Hata:', error);
            showToast(error.message || 'Bir hata oluştu', true);
            resultContainer.style.display = 'none';
        } finally {
            setLoading(false);
        }
    }

    function displayUserInfo(user) {
        // Avatar
        document.getElementById('userAvatar').src = user.avatar 
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
            : 'https://cdn.discordapp.com/embed/avatars/0.png';

        // User ID
        document.getElementById('displayUserId').textContent = user.id;

        // Username
        document.getElementById('username').textContent = `${user.username}${user.discriminator !== '0' ? `#${user.discriminator}` : ''}`;

        // Badges
        const badges = [];
        if (user.flags) {
            if (user.flags & 1) badges.push('🏢 Discord Çalışanı');
            if (user.flags & 2) badges.push('🤝 Discord Partner');
            if (user.flags & 4) badges.push('🎉 HypeSquad Events');
            if (user.flags & 8) badges.push('🐛 Bug Hunter Level 1');
            if (user.flags & 64) badges.push('🏠 House Bravery');
            if (user.flags & 128) badges.push('🏠 House Brilliance');
            if (user.flags & 256) badges.push('🏠 House Balance');
            if (user.flags & 512) badges.push('💎 Early Supporter');
            if (user.flags & 16384) badges.push('🐛 Bug Hunter Level 2');
            if (user.flags & 131072) badges.push('👨‍💻 Early Verified Bot Developer');
        }
        document.getElementById('badges').textContent = badges.length ? badges.join(' • ') : 'Rozet yok';

        // Created At
        const createdAt = new Date(parseInt(user.id) / 4194304 + 1420070400000);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('created').textContent = createdAt.toLocaleDateString('tr-TR', options);

        // Banner Color
        const bannerColorElement = document.getElementById('bannerColor');
        if (user.banner_color) {
            bannerColorElement.style.backgroundColor = user.banner_color;
        } else {
            bannerColorElement.style.backgroundColor = '#7289DA';
        }

        // Show result container with animation
        resultContainer.style.display = 'block';
        resultContainer.style.opacity = '0';
        setTimeout(() => {
            resultContainer.style.opacity = '1';
        }, 50);
    }
});
