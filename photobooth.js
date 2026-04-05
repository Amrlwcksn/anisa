document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-photobooth-btn');
    const photoboothView = document.getElementById('photobooth-view');
    const video = document.getElementById('video-preview');
    const captureBtn = document.getElementById('capture-btn');
    const closeBtn = document.getElementById('close-photobooth-btn');
    const flashEffect = document.getElementById('flash-effect');
    const countdownDisplay = document.getElementById('countdown-display');
    const statusDisplay = document.getElementById('capture-status');
    const resultContainer = document.getElementById('captured-strip-container');
    const stripImgPreview = document.getElementById('strip-img-preview');
    const downloadBtn = document.getElementById('download-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const canvas = document.getElementById('captured-canvas');
    const ctx = canvas.getContext('2d');

    let stream = null;
    let capturedPhotos = [];
    const MAX_PHOTOS = 3;
    let isCapturing = false;

    // --- Core Functions ---

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            video.srcObject = stream;
            video.play();

            photoboothView.classList.add('active');
            startBtn.style.display = 'none';
            resultContainer.classList.remove('active');
            capturedPhotos = [];
            statusDisplay.textContent = 'Siap? Klik tombol kamera! ✨';
        } catch (err) {
            console.error("Error accessing webcam:", err);
            alert("Akses kamera ditolak atau tidak tersedia. Pastikan izin kamera sudah diberikan yaa! 💖");
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        video.srcObject = null;
        photoboothView.classList.remove('active');
        startBtn.style.display = 'inline-block';
    }

    async function captureSequence() {
        if (isCapturing) return;
        isCapturing = true;
        capturedPhotos = [];
        captureBtn.disabled = true;

        for (let i = 0; i < MAX_PHOTOS; i++) {
            statusDisplay.textContent = `Foto ke-${i + 1} dari ${MAX_PHOTOS}`;

            // Countdown 3...2...1
            for (let count = 3; count > 0; count--) {
                countdownDisplay.textContent = count;
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            countdownDisplay.textContent = '❤️';
            await new Promise(resolve => setTimeout(resolve, 500));
            countdownDisplay.textContent = '';

            // Flash & Capture
            flashEffect.classList.add('active');
            capturePhoto();
            await new Promise(resolve => setTimeout(resolve, 500));
            flashEffect.classList.remove('active');

            // Wait before next photo
            if (i < MAX_PHOTOS - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        generateStrip();
        isCapturing = false;
        captureBtn.disabled = false;
        statusDisplay.textContent = 'Selesai! ✨';
    }

    function capturePhoto() {
        // Create temp canvas for 1:1 crop
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const size = Math.min(video.videoWidth, video.videoHeight);
        tempCanvas.width = 600;
        tempCanvas.height = 600;

        // Crop center and draw mirrored
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;

        tempCtx.translate(600, 0);
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(video, startX, startY, size, size, 0, 0, 600, 600);

        // Add romantic sepia filter like in style.css
        tempCtx.filter = 'sepia(30%) contrast(1.05) brightness(0.95)';
        tempCtx.drawImage(tempCanvas, 0, 0); // Apply filter by redrawing

        capturedPhotos.push(tempCanvas.toDataURL('image/jpeg', 0.9));
    }

    function generateStrip() {
        const stripWidth = 400;
        const photoSize = 360;
        const padding = 20;
        const footerHeight = 100;
        const stripHeight = (padding * (MAX_PHOTOS + 1)) + (photoSize * MAX_PHOTOS) + footerHeight;

        canvas.width = stripWidth;
        canvas.height = stripHeight;

        // Background (White like paper)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, stripWidth, stripHeight);

        // Draw Photos
        capturedPhotos.forEach((photoData, index) => {
            const img = new Image();
            img.onload = () => {
                const y = padding + (index * (photoSize + padding));

                // Photo Border/Stroke
                ctx.strokeStyle = '#eeeeee';
                ctx.lineWidth = 1;
                ctx.strokeRect(padding, y, photoSize, photoSize);

                ctx.drawImage(img, padding, y, photoSize, photoSize);

                // If last photo, draw caption and show result
                if (index === MAX_PHOTOS - 1) {
                    drawCaption(stripWidth, stripHeight);
                    stripImgPreview.src = canvas.toDataURL('image/jpeg', 1.0);
                    resultContainer.classList.add('active');
                    video.parentElement.style.opacity = '0.3'; // Dim camera preview
                }
            };
            img.src = photoData;
        });
    }

    function drawCaption(width, height) {
        ctx.save();

        // Use a nice font (Outfit falls back to Sans)
        ctx.fillStyle = '#444444';
        ctx.textAlign = 'center';

        // "Handwritten" feel caption
        ctx.font = 'italic 900 32px "Playfair Display", serif';
        ctx.translate(width / 2, height - 60);
        ctx.rotate(-2 * Math.PI / 180); // Slight tilt
        ctx.fillText('Anamir ✨', 0, 0);

        ctx.restore();
    }

    function downloadStrip() {
        const link = document.createElement('a');
        link.download = `photobooth-Anisa-${Date.now()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 1.0);
        link.click();
    }

    // --- Event Listeners ---

    startBtn.addEventListener('click', startCamera);
    closeBtn.addEventListener('click', stopCamera);
    captureBtn.addEventListener('click', captureSequence);
    downloadBtn.addEventListener('click', downloadStrip);

    retakeBtn.addEventListener('click', () => {
        resultContainer.classList.remove('active');
        video.parentElement.style.opacity = '1';
        statusDisplay.textContent = 'Ayo foto lagi! ✨';
    });
});
