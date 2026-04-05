/* Mini Game "Heart Shooter" Logic */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const winOverlay = document.getElementById('win-overlay');
const header = document.getElementById('canvas-header');

// Variabel Resolusi Logic Internal
let gameWidth = Math.min(window.innerWidth - 40, 500); 
let gameHeight = Math.min(window.innerHeight - header.offsetHeight - 60, 750);

// Setup Canvas Size Responsively untuk Resolusi Tinggi (Anti-Blur/DPR Fix)
function resizeCanvas() {
    gameWidth = Math.min(window.innerWidth - 40, 500); // Lebar maksimum 500
    let headerHeight = header.offsetHeight + 20;
    gameHeight = Math.min(window.innerHeight - headerHeight - 40, 750);

    const dpr = window.devicePixelRatio || 1;
    
    // Set resolusi fisik piksel (tinggi untuk tajam)
    canvas.width = gameWidth * dpr;
    canvas.height = gameHeight * dpr;
    
    // Set ukuran penampakan CSS di layar
    canvas.style.width = gameWidth + 'px';
    canvas.style.height = gameHeight + 'px';

    // Skalakan konteks untuk layar jernih
    ctx.scale(dpr, dpr);

    // Sinkronkan lebar header pilar skor
    header.style.width = gameWidth + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Panggil sekali saat dimuat

// Game State
let isPlaying = true;
let score = 0;
const WIN_SCORE = 15;

// Batasan posisi agar tidak keluar layar kanvas
const PADDING = 20;

// Player Object
const player = {
    x: gameWidth / 2,
    y: gameHeight - 50,
    emoji: '🌸', // Ikon player (bunga anggrek)
    size: 40
};

// Koleksi data array 
let bullets = [];
let enemies = [];
let explosions = [];

// Daftar kata pop-up pecahan hati
const romanticWords = [
    "Cantik!", "Jelita!", "Manis!", "Lucuu!",
    "DOR!", "PIU!"
];

// Pengaturan Kontrol Touch/Mouse (Terikat pada Window untuk mencegah hilangnya kursor)
let targetX = gameWidth / 2;

function movePlayer(e) {
    if (!isPlaying) return;
    
    // Jika targetnya kanvas, matikan default agar stabil di touch, tapi biarkan UI lain aktif
    if (e.target === canvas) {
        e.preventDefault(); 
    }
    
    let clientX;

    // Periksa sentuhan HP vs Mouse Biasa
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
    } else {
        clientX = e.clientX;
    }

    const rect = canvas.getBoundingClientRect();
    // Hitung posisi
    targetX = clientX - rect.left;
}

window.addEventListener('mousemove', movePlayer);
window.addEventListener('touchmove', movePlayer, { passive: false });
window.addEventListener('mousedown', movePlayer);     
window.addEventListener('touchstart', movePlayer, { passive: false }); 

// Logika Tembak Peluru Otomatis
setInterval(() => {
    if (isPlaying) {
        bullets.push({
            x: player.x,
            y: player.y - 20, // Muncul sedikit di atas bunga
            speed: 8,
            emoji: '✨', // Pelurunya berupa kilauan percikan magis
            size: 20
        });
    }
}, 300); // 1 tembakan tiap 300 milidetik (Cepat)

// Logika Spawner Musuh (Hati Cinta dari Langit)
setInterval(() => {
    if (isPlaying) {
        const mintEmojis = ['✨', '💎', '🤍', '🍃', '🐚'];
        const randomEmoji = mintEmojis[Math.floor(Math.random() * mintEmojis.length)];

        // Randomisasi awal musuh lahir secara horizontal
        const startX = Math.max(PADDING, Math.min(Math.random() * gameWidth, gameWidth - PADDING));

        enemies.push({
            x: startX,
            y: -30, // Mulai dari luar layar atas ke bawah
            speed: 1.5 + (Math.random() * 1.5), // Kecepatan turunan acak (1.5 - 3.0)
            emoji: randomEmoji,
            size: 35
        });
    }
}, 1000); // Spawn lebih cepat, 1 musuh per 1 detik

// --- GAME ENGINE UPDATE LOGIC ---
function update() {
    if (!isPlaying) return;

    // Movement player mengikuti kursor/jemari dibatasi kanvas logic (anti clamp error)
    player.x = Math.max(player.size / 2, Math.min(targetX, gameWidth - player.size / 2));
    player.y = gameHeight - 40; 

    // Hitung peluru bergerak ke atas
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < -20) {
            bullets.splice(i, 1);
        }
    }

    // Hitung pergerakan musuh
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        if (enemies[i].y > gameHeight + 30) {
            enemies.splice(i, 1);
        }
    }

    // Hitung transisi ledakan teks romantis (mengambang sedikit ke atas lalu life fade)
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].y -= 1; // Terbang perlahan menembus udara
        explosions[i].life -= 1;
        if (explosions[i].life <= 0) {
            explosions.splice(i, 1); // Hapus jika sudah expire
        }
    }

    // Hit Detection: Cek Tabrakan Fisika Lingkaran Sederhana!
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        let hit = false;

        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];

            let dx = enemy.x - bullet.x;
            let dy = enemy.y - bullet.y;
            let distance = Math.hypot(dx, dy);

            // Jari-jari tabrakan sekitar setengan ukuran objek gabungan
            if (distance < (enemy.size / 2 + bullet.size / 2 - 5)) {
                hit = true;
                bullets.splice(j, 1); // Hancurkan peluru
                break; // Stop cari tabrakan untuk musuh ini
            }
        }

        if (hit) {
            // Mainkan efek teks meledak!
            const randomWord = romanticWords[Math.floor(Math.random() * romanticWords.length)];
            explosions.push({
                x: enemy.x,
                y: enemy.y,
                text: randomWord,
                life: 60, // Lama frame dia hidup
                maxLife: 60
            });

            enemies.splice(i, 1); // Hancurkan hatinya
            increaseScore(); // Tambah skor
        }
    }
}

// Mekanis Peningkatan Skor dan Kondisi Menang
function increaseScore() {
    if (!isPlaying) return; // Mencegah bug double-score render apabila mati seketika
    
    score++;
    scoreSpan.innerText = score;

    // Animasi tombol indikator skor mendetak
    scoreSpan.parentElement.style.transition = "transform 0.1s ease";
    scoreSpan.parentElement.style.transform = "scale(1.1) translateY(-3px)";
    setTimeout(() => {
        scoreSpan.parentElement.style.transform = "scale(1)";
    }, 150);

    // WIN CONDITION CATCH!
    if (score >= WIN_SCORE) {
        isPlaying = false; // Freeze permainan

        // Timeout sedikit biar ledakan terakhir dinikmati baru modal win muncul
        setTimeout(() => {
            winOverlay.classList.remove('hidden');
            void winOverlay.offsetWidth; // Memicu reflow paksa animasi overlay 
            winOverlay.classList.add('active');
        }, 500);
    }
}

// DRAW ENGINE LOGIC (MENGGAMBAR KE LAYAR KANVAS)
function draw() {
    // Bersihkan layar bingkai lama secara manual 
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // Set parameter global font teks emoji sentris
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Cetak Peluru (✨)
    for (let b of bullets) {
        ctx.font = `${b.size}px Arial`;
        ctx.fillText(b.emoji, b.x, b.y);
    }

    // Cetak Hati Cinta turun (💖)
    for (let e of enemies) {
        ctx.font = `${e.size}px Arial`;
        ctx.fillText(e.emoji, e.x, e.y);
    }

    // Cetak Karakter Pemain (🌸)
    ctx.font = `${player.size}px Arial`;
    ctx.fillText(player.emoji, player.x, player.y);

    // Cetak Teks Cinta Mengambang sebagai Ledakan Visual
    for (let ex of explosions) {
        ctx.font = `bold 22px 'Outfit', sans-serif`;
        ctx.fillStyle = `#006064`; // Dark Tosca
        ctx.fillText(ex.text, ex.x, ex.y);
    }
}

// THE BEATING HEART OF THE GAME (Game loop)
let lastTime = 0;
const fpsInterval = 1000 / 60; // Paksa game berjalan 60 FPS di layar apapun

function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);

    // Hitung jarak waktu agar konsisten antar layar HP/Laptop
    if (!lastTime) lastTime = timestamp;
    let deltaTime = timestamp - lastTime;

    if (deltaTime >= fpsInterval) {
        update();
        // Koreksi sisa waktu agar tidak menumpuk framenya
        lastTime = timestamp - (deltaTime % fpsInterval);
    }
    
    // Tetap render gambar sesecepat mungkin agar tetap halus (Smooth Render)
    draw();
}

// Inisialisasi awal Player Berada di Tengah!
targetX = gameWidth / 2;
// Kick off game putarannya memakai sistem Request API DOM
requestAnimationFrame(gameLoop);
