document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. MENGUNCI TINGGI LAYAR HP (FIX BACKGROUND LOMPAT) ---
    function pasangTinggiMobile() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    pasangTinggiMobile();
    window.addEventListener('orientationchange', pasangTinggiMobile);
    // -----------------------------------------------------------

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
                    }, 100);
                }
            }, 0);

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

                loadWishes();

                if (music) {
                    music.play()
                        .then(() => {
                            isPlaying = true;
                        })
                        .catch(err => {
                            console.log("Autoplay prevented:", err);
                        });
                }

            }, 100);

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
        container.innerHTML = "";
        
        weddingData.ourStory.forEach(item => {
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
       WISHES (Hanya Untuk Buka Tutup Form)
    ========================= */
    function setupWish() {
        const toggleBtn = document.getElementById("toggle-wishes");
        const wishesArea = document.getElementById("wishes-container");

        if(toggleBtn && wishesArea) {
            toggleBtn.addEventListener("click", () => {
                wishesArea.classList.toggle("hidden");
            });
        }
    }

    /* =========================
       REVEAL ANIMATION (SCROLL FADE IN)
    ========================= */
    function setupIntersectionObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: "0px 0px -20px 0px"
        }); 

        document.querySelectorAll(".reveal").forEach(el => {
            observer.observe(el);
        });
    }

    /* =========================
       RSVP Form to Google Sheets
    ========================= */
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxVmci1q0Jvqo3euxRq2rvuLQrf3jXgiBqI42mhISzcTw50DAhlIFOc2KhZWAhXJ0Ck/exec'; 
    
    const rsvpForm = document.forms['submit-to-google-sheet'];
    const btnSubmit = document.getElementById('btn-submit');
    const wishesList = document.getElementById('wishes-list');
    const countWishes = document.getElementById('count-wishes'); 
    
    const attendanceSelect = document.getElementById('attendance');
    const jumlahSelect = document.getElementById('jumlah');

    if (attendanceSelect && jumlahSelect) {
        attendanceSelect.addEventListener('change', () => {
            if (attendanceSelect.value === 'Tidak Hadir') {
                jumlahSelect.style.display = 'none';
                jumlahSelect.removeAttribute('required');
                jumlahSelect.innerHTML = `<option value="0" selected>0</option>`; 
            } else {
                jumlahSelect.style.display = 'block';
                jumlahSelect.setAttribute('required', 'true');
                jumlahSelect.innerHTML = `
                    <option value="" disabled selected>Jumlah Kehadiran</option>
                    <option value="1">1 Orang</option>
                    <option value="2">2 Orang</option>
                    <option value="3">3 Orang</option>
                    <option value="4">4 Orang</option>
                `;
            }
        });
    }

    let totalUcapan = 0;

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', e => {
            e.preventDefault(); 
            
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';
            btnSubmit.disabled = true;

            fetch(scriptURL, { method: 'POST', body: new FormData(rsvpForm)})
                .then(response => {
                    btnSubmit.innerHTML = 'Kirim Ucapan';
                    btnSubmit.disabled = false;

                    const name = document.getElementById('name').value;
                    const attendance = document.getElementById('attendance').value;
                    const message = document.getElementById('message').value;

                    let iconHTML = '';
                    if (attendance === 'Hadir') {
                        iconHTML = `<svg aria-label="Hadir" fill="#019b41" height="16" role="img" viewBox="0 0 40 40" width="16" style="vertical-align: middle;"><path d="M19.998 3.094 14.638 0l-2.972 3.775-.63 10.25-8.017 4.368 10.52 4.86 2.06 8.883 4.501-7.752 11.55-2.75-9.916-5.062.058-11.572zM27.02 25.27L18.41 27.85l-1.47-6.35-1.02-8.77 8.59.028 1.52 12.52z"/></svg>`;
                    } else {
                        iconHTML = `<svg aria-label="Tidak Hadir" fill="#e74c3c" height="16" role="img" viewBox="0 0 40 40" width="16" style="vertical-align: middle;"><path d="M19.998 3.094 14.638 0l-2.972 3.775-.63 10.25-8.017 4.368 10.52 4.86 2.06 8.883 4.501-7.752 11.55-2.75-9.916-5.062.058-11.572zM27.02 25.27L18.41 27.85l-1.47-6.35-1.02-8.77 8.59.028 1.52 12.52z"/></svg>`;
                    }

                    const wishItem = document.createElement('div');
                    wishItem.classList.add('wish-item');
                    wishItem.innerHTML = `<h4>${name} <span style="margin-left: 5px;">${iconHTML}</span></h4><p>${message}</p>`;

                    if(wishesList) wishesList.insertBefore(wishItem, wishesList.firstChild);
                    
                    totalUcapan++;
                    if(countWishes) countWishes.innerText = totalUcapan;
                    
                    rsvpForm.reset();
                    
                    if(jumlahSelect) {
                        jumlahSelect.style.display = 'block';
                        jumlahSelect.setAttribute('required', 'true');
                    }

                    alert('Terima kasih! Konfirmasi kehadiran dan ucapan Anda telah terkirim.');
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    alert('Gagal mengirim ucapan. Pastikan koneksi internet stabil.');
                    btnSubmit.innerHTML = 'Kirim Ucapan';
                    btnSubmit.disabled = false;
                });
        });
    }

    /* =========================
       LOAD WISHES (doGet)
    ========================= */
    function loadWishes() {
        if(!wishesList) return;
        
        wishesList.innerHTML = '<p style="text-align:center; font-size:12px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat ucapan...</p>';
        
        fetch(scriptURL) 
            .then(response => response.json())
            .then(data => {
                wishesList.innerHTML = ''; 
                totalUcapan = data.length;
                if(countWishes) countWishes.innerText = totalUcapan;

                data.forEach(item => {
                    let iconHTML = '';
                    if (item.kehadiran === 'Hadir') {
                        iconHTML = `<svg aria-label="Hadir" fill="#019b41" height="16" role="img" viewBox="0 0 40 40" width="16" style="vertical-align: middle;"><path d="M19.998 3.094 14.638 0l-2.972 3.775-.63 10.25-8.017 4.368 10.52 4.86 2.06 8.883 4.501-7.752 11.55-2.75-9.916-5.062.058-11.572zM27.02 25.27L18.41 27.85l-1.47-6.35-1.02-8.77 8.59.028 1.52 12.52z"/></svg>`;
                    } else {
                        iconHTML = `<svg aria-label="Tidak Hadir" fill="#e74c3c" height="16" role="img" viewBox="0 0 40 40" width="16" style="vertical-align: middle;"><path d="M19.998 3.094 14.638 0l-2.972 3.775-.63 10.25-8.017 4.368 10.52 4.86 2.06 8.883 4.501-7.752 11.55-2.75-9.916-5.062.058-11.572zM27.02 25.27L18.41 27.85l-1.47-6.35-1.02-8.77 8.59.028 1.52 12.52z"/></svg>`;
                    }

                    const wishItem = document.createElement('div');
                    wishItem.classList.add('wish-item');
                    wishItem.innerHTML = `<h4>${item.nama} <span style="margin-left: 5px;">${iconHTML}</span></h4><p>${item.pesan}</p>`;
                    
                    wishesList.appendChild(wishItem);
                });
            })
            .catch(error => {
                console.error('Error memuat ucapan:', error);
                wishesList.innerHTML = '<p style="text-align:center; font-size:12px; color:red;">Gagal memuat daftar ucapan dari server.</p>';
            });
    }

    loadWishes();

});
