document.addEventListener('DOMContentLoaded', () => {
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const popupOverlay = document.getElementById('popup-overlay');
    const btnPopupOk = document.getElementById('btn-popup-ok');

    // === (index.html) ===
    if (btnNo && popupOverlay && btnPopupOk) {
        const originalContainer = btnNo.parentElement;

        // Runaway Button Logic
        btnNo.addEventListener('mouseover', () => {
            if (btnNo.parentElement !== document.body) {
                const rect = btnNo.getBoundingClientRect();
                btnNo.style.width = rect.width + 'px';
                btnNo.style.height = rect.height + 'px';
                btnNo.style.left = rect.left + 'px';
                btnNo.style.top = rect.top + 'px';
                btnNo.style.position = 'fixed';
                btnNo.style.zIndex = '9999';
                document.body.appendChild(btnNo);
            }

            const btnWidth = btnNo.getBoundingClientRect().width;
            const btnHeight = btnNo.getBoundingClientRect().height;
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = document.documentElement.clientHeight;
            const maxSafeX = viewportWidth - btnWidth - 30;
            const maxSafeY = viewportHeight - btnHeight - 30;

            let randomX = Math.floor(Math.random() * maxSafeX);
            let randomY = Math.floor(Math.random() * maxSafeY);

            randomX = Math.max(30, Math.min(randomX, maxSafeX));
            randomY = Math.max(30, Math.min(randomY, maxSafeY));

            btnNo.style.left = `${randomX}px`;
            btnNo.style.top = `${randomY}px`;
        });

        // Tampilkan Popup 
        btnNo.addEventListener('click', () => {
            popupOverlay.classList.add('active');
        });

        // Tutup Popup
        btnPopupOk.addEventListener('click', () => {
            popupOverlay.classList.remove('active');
            if (btnNo.parentElement === document.body) {
                originalContainer.appendChild(btnNo);
                btnNo.style.position = 'relative';
                btnNo.style.left = 'auto';
                btnNo.style.top = 'auto';
                btnNo.style.width = 'auto';
                btnNo.style.height = 'auto';
                btnNo.style.zIndex = 'auto';
            }
        });
    }

    if (btnYes) {
        // Navigasi ke halaman utama menu
        btnYes.addEventListener('click', () => {
            if (btnNo && btnNo.parentElement === document.body) {
                btnNo.style.opacity = '0';
                btnNo.style.pointerEvents = 'none';
            }
            window.location.href = 'home.html';
        });
    }

});
