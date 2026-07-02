document.addEventListener("DOMContentLoaded", () => {
    const loading = document.getElementById("loading-screen");
    const loaderName = document.getElementById("loader-name");
    let weddingData;

    /* =========================
       LOAD JSON DATA
    ========================= */
    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            weddingData = data;
            
            // Mengatur nama pada loader
            const name = data.mempelai.wanita.namaPanggilan + " & " + data.mempelai.pria.namaPanggilan;
            if(loaderName) loaderName.innerHTML = name;

            // Menghilangkan loading screen
            setTimeout(() => {
                if(loading) {
                    loading.style.opacity = "0";
                    setTimeout(() => {
                        loading.remove();
                    }, 800);
                }
            }, 1200);

            // Inisialisasi Fungsi
            loadWeddingData();
            startCountdown();
            renderStory();
            renderGift();
            setupWish();
            
            // PENTING: Panggil observer SETELAH semua elemen selesai dirender ke HTML
            setupIntersectionObserver();
        })
        .catch(error => console.error("Error loading JSON:", error));

    /* =========================
   OPEN INVITATION
========================= */

const openButton = document.getElementById("openInvitation");
const cover = document.getElementById("cover");
const main = document.getElementById("main-content");

const music = document.getElementById("music");
const musicButton = document.getElementById("musicButton");

let isPlaying = false;

/* =========================
   BUKA UNDANGAN
========================= */

if (openButton) {
    openButton.addEventListener("click", () => {

        cover.style.opacity = "0";

        setTimeout(() => {
            cover.style.display = "none";
            main.classList.remove("hidden");

            if (music) {
                music.play()
                    .then(() => {
                        isPlaying = true;
                    })
                    .catch(err => {
                        console.log("Autoplay prevented:", err);
                    });
            }

        }, 200);
    });
}

/* =========================
   TOMBOL MUSIC
========================= */

if (musicButton) {

    musicButton.addEventListener("click", () => {

        if (music.paused) {
            music.play();
        } else {
            music.pause();
        }

    });

}

/* =========================
   SINKRONKAN STATUS AUDIO
========================= */

if (music) {

    music.addEventListener("play", () => {
        isPlaying = true;
        musicButton.classList.add("playing");
    });

    music.addEventListener("pause", () => {
        isPlaying = false;
        musicButton.classList.remove("playing");
    });

    music.addEventListener("ended", () => {
        isPlaying = false;
        musicButton.classList.remove("playing");
    });

}

    /* =========================
       LOAD BASIC DATA
    ========================= */
    function loadWeddingData() {
        const wanita = weddingData.mempelai.wanita;
        const pria = weddingData.mempelai.pria;
        const acara = weddingData.acara;
        const coupleName = wanita.namaPanggilan + "<br><span class='ampersand'>&</span>" + pria.namaPanggilan;

        // Set global names & dates
        document.querySelectorAll("#desktop-name, #cover-name, #intro-name, #closing-names").forEach(el => {
            if (el) el.innerHTML = coupleName;
        });
        document.querySelectorAll("#desktop-date, #cover-date, #intro-date, #event-date").forEach(el => {
            if (el) el.innerHTML = acara.tanggalTeks;
        });

        // Event Location
        const mapEl = document.getElementById("event-map");
        const locNameEl = document.getElementById("event-location-name");
        const locAddrEl = document.getElementById("event-address");
        if(locNameEl) locNameEl.innerHTML = acara.lokasi.nama;
        if(locAddrEl) locAddrEl.innerHTML = acara.lokasi.alamat;
        if(mapEl) mapEl.href = acara.lokasi.maps;

        // Set Data Wanita
        const bridePhoto = document.getElementById("bride-photo");
        if(bridePhoto) bridePhoto.src = wanita.foto;
        const brideNick = document.getElementById("bride-nick");
        if(brideNick) brideNick.innerHTML = wanita.namaPanggilan;
        const brideName = document.getElementById("bride-name");
        if(brideName) brideName.innerHTML = wanita.namaLengkap;
        const brideParent = document.getElementById("bride-parent");
        if(brideParent) brideParent.innerHTML = wanita.namaOrangTua;

        // Set Data Pria
        const groomPhoto = document.getElementById("groom-photo");
        if(groomPhoto) groomPhoto.src = pria.foto;
        const groomNick = document.getElementById("groom-nick");
        if(groomNick) groomNick.innerHTML = pria.namaPanggilan;
        const groomName = document.getElementById("groom-name");
        if(groomName) groomName.innerHTML = pria.namaLengkap;
        const groomParent = document.getElementById("groom-parent");
        if(groomParent) groomParent.innerHTML = pria.namaOrangTua;
        
        // Setup Guest Name from URL (?to=Nama_Tamu)
        const urlParams = new URLSearchParams(window.location.search);
        const guestName = urlParams.get('to');
        if(guestName) {
            const guestEl = document.getElementById('guest-name');
            if(guestEl) guestEl.innerHTML = guestName.replace(/_/g, ' ');
        }
    }

    /* =========================
       COUNTDOWN
    ========================= */
    function startCountdown() {
        const target = new Date(weddingData.acara.tanggalCountdown).getTime();
        setInterval(() => {
            const now = new Date().getTime();
            const distance = target - now;

            if (distance < 0) return;

            const daysEl = document.getElementById("days");
            const hoursEl = document.getElementById("hours");
            const minutesEl = document.getElementById("minutes");
            const secondsEl = document.getElementById("seconds");

            if(daysEl) daysEl.innerHTML = Math.floor(distance / (1000 * 60 * 60 * 24));
            if(hoursEl) hoursEl.innerHTML = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if(minutesEl) minutesEl.innerHTML = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            if(secondsEl) secondsEl.innerHTML = Math.floor((distance % (1000 * 60)) / 1000);
        }, 1000);
    }

    /* =========================
       OUR STORY
    ========================= */
    function renderStory() {
    const container = document.getElementById("story-container");
    if(!container) return;
    container.innerHTML = ""; // Bersihkan kontainer
    
    weddingData.ourStory.forEach(item => {
        // Kita menambahkan class "section-content" di sini
        container.innerHTML += `
            <div class="story-item reveal section-content">
                <span style="display:block; font-size:12px; color:var(--sage-dark); font-weight:bold;">${item.tanggal}</span>
                <h3 style="margin: 5px 0;">${item.judul}</h3>
                <p>${item.cerita}</p>
            </div>
        `;
    });
}

    /* =========================
       GIFT (ATM CARD STRUCTURE)
    ========================= */
    function renderGift() {
        const container = document.getElementById("gift-container");
        if(!container) return;
        container.innerHTML = ""; 
        
        weddingData.gifts.forEach(item => {
            if (item.type === "bank") {
                const formattedNumber = item.accountNumber.replace(/(\d{4})/g, '$1 ').trim();
                
                container.innerHTML += `
                    <div class="atm-card reveal">
                        <div class="atm-card-header">
                            <span class="bank-name">${item.bankName}</span>
                            <div class="atm-chip"></div>
                        </div>
                        <div class="atm-card-number">${formattedNumber}</div>
                        <div class="atm-card-footer">
                            <div class="atm-card-holder">
                                <span>CARDHOLDER</span>
                                <strong>${item.accountName}</strong>
                            </div>
                            <button class="btn-copy-atm" onclick="navigator.clipboard.writeText('${item.accountNumber}').then(()=>alert('Nomor rekening berhasil disalin!'))">
                                <i class="fa-solid fa-copy"></i> Salin
                            </button>
                        </div>
                    </div>
                `;
            }
        });
    }

    /* =========================
       WISHES (LOCAL UPDATE & SUBMIT)
    ========================= */
    function setupWish() {
        const toggleBtn = document.getElementById("toggle-wishes");
        const wishesArea = document.getElementById("wishes-area");
        const form = document.getElementById("wish-form");
        const wishList = document.getElementById("wish-list");

        // Toggle buka/tutup form
        if(toggleBtn && wishesArea) {
            toggleBtn.addEventListener("click", () => {
                wishesArea.classList.toggle("hidden");
            });
        }

        // Handle Submit
        if(form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();

                // 1. Ambil nilai dari input
                const name = document.getElementById("wish-name").value;
                const message = document.getElementById("wish-message").value;

                // 2. Buat elemen HTML baru untuk ucapan
                const newWish = document.createElement("div");
                newWish.className = "wish-item reveal active";
                newWish.innerHTML = `
                    <strong style="display:block; color:var(--sage-dark);">${name}</strong>
                    <p style="font-size:14px; margin-top:5px;">${message}</p>
                `;

                // 3. Masukkan ke daftar (prepend agar muncul di paling atas)
                wishList.prepend(newWish);

                // 4. (Opsional) Kirim ke server jika Anda punya Google Script
                // const btn = document.getElementById("submit-wish");
                // btn.innerHTML = "Mengirim...";
                // fetch(weddingData.wishes.scriptURL, { method: "POST", body: new FormData(form) })
                // .then(() => btn.innerHTML = "Terkirim")
                // .catch(() => btn.innerHTML = "Gagal");

                // 5. Reset form
                form.reset();
                alert("Terima kasih atas ucapannya!");
            });
        }
    }

    /* =========================
       REVEAL ANIMATION (SCROLL FADE IN & FADE OUT)
    ========================= */
    function setupIntersectionObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Muncul (Fade In) saat elemen terlihat di layar
                    entry.target.classList.add("active");
                } else {
                    // Menghilang (Fade Out) saat elemen keluar dari layar
                    entry.target.classList.remove("active");
                }
            });
        }, { threshold: 0.15 }); // 0.15 artinya efek terpicu saat 15% bagian kartu masuk layar

        // Terapkan ke semua elemen yang memiliki class .reveal
        document.querySelectorAll(".reveal").forEach(el => {
            observer.observe(el);
        });
    }
});
