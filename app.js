// ===================================================
// CONFIGURAÇÃO DA API E VARIÁVEIS GLOBAIS
// ===================================================
const API_BASE_URL = "https://gotham-archives-api.onrender.com";
const rarityOrder = ["COMUM", "RARO", "ÉPICO", "LENDÁRIO"];
 
let isMuted = false;
let audioContext = null;
 
// ===================================================
// DETECÇÃO DE DISPOSITIVO (mouse real vs. touch)
// ===================================================
const hasFinePointer = () => window.matchMedia("(pointer: fine)").matches && window.matchMedia("(hover: hover)").matches;
 
// ===================================================
// FEEDBACK TÁTIL (haptics) — degrada silenciosamente
// em navegadores/dispositivos sem suporte (ex.: iOS)
// ===================================================
function triggerHaptic(durationMs = 12) {
    try {
        if (navigator.vibrate) navigator.vibrate(durationMs);
    } catch (e) { /* silencioso: haptics é um extra, nunca deve quebrar a UI */ }
}
 
// ===================================================
// DESTRAVAR O ÁUDIO NO PRIMEIRO GESTO (iOS/Safari criam
// o AudioContext em estado "suspended" até haver uma
// interação explícita do usuário — inclusive um swipe)
// ===================================================
function unlockAudioOnFirstGesture() {
    const unlock = () => {
        const ctx = getAudioContext();
        if (ctx && ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }
        document.removeEventListener("touchstart", unlock);
        document.removeEventListener("click", unlock);
    };
    document.addEventListener("touchstart", unlock, { passive: true, once: true });
    document.addEventListener("click", unlock, { once: true });
}
 
// ===================================================
// GERENCIAMENTO DE ÁUDIO (Web Audio API)
// ===================================================
function getAudioContext() {
    const AudioContextApi = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextApi) return null;
    if (!audioContext) audioContext = new AudioContextApi();
    return audioContext;
}
 
function playHoverSound() {
    if (isMuted) return;
    try {
        const audioCtx = getAudioContext();
        if (!audioCtx) return;
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.03);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.015, audioCtx.currentTime + 0.005);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.03);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) { console.warn(e); }
}
 
function playTechClickSound() {
    if (isMuted) return;
    try {
        const audioCtx = getAudioContext();
        if (!audioCtx) return;
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.01);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) { console.warn(e); }
}
 
function playPaperTurnSound() {
    if (isMuted) return;
    try {
        const audioCtx = getAudioContext();
        if (!audioCtx) return;
 
        const duration = 0.45;
        const sampleRate = audioCtx.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
 
        for (let i = 0; i < bufferSize; i += 1) {
            const progress = i / bufferSize;
            const noise = Math.random() * 2 - 1;
            let envelope = 0;
 
            if (progress < 0.3) {
                envelope = progress / 0.3;
            } else {
                envelope = (1 - progress) / 0.7;
            }
 
            const paperCrackle = Math.random() > 0.985 ? (Math.random() * 2 - 1) * 0.35 : 0;
            data[i] = (noise * 0.65 + paperCrackle) * envelope * 0.12;
        }
 
        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
 
        const bandpassFilter = audioCtx.createBiquadFilter();
        bandpassFilter.type = "bandpass";
        bandpassFilter.Q.value = 2.0;
        bandpassFilter.frequency.setValueAtTime(1500, audioCtx.currentTime);
        bandpassFilter.frequency.exponentialRampToValueAtTime(350, audioCtx.currentTime + duration);
 
        const lowpassFilter = audioCtx.createBiquadFilter();
        lowpassFilter.type = "lowpass";
        lowpassFilter.frequency.setValueAtTime(3800, audioCtx.currentTime);
 
        noiseNode.connect(bandpassFilter);
        bandpassFilter.connect(lowpassFilter);
        lowpassFilter.connect(audioCtx.destination);
        noiseNode.start();
    } catch (error) {
        console.warn("Falha ao tocar som de virada de página:", error);
    }
}
 
// ===================================================
// LÓGICA DE DADOS E INTERFACE (FIGURINHAS)
// ===================================================
function getRarityById(id) {
    const index = (id - 1) % rarityOrder.length;
    return rarityOrder[index];
}
 
function normalizeFigurinha(figurinha) {
    const id = Number(figurinha.id || 0);
    const categoryMap = {
        "THE BAT-FAMILY": "A FAMÍLIA BAT",
        "ROGUES GALLERY": "GALERIA DOS ROGUES",
        "ARKHAM FILES": "ARQUIVOS ARKHAM",
        "GOTHAM LOCATIONS": "LOCAIS DE GOTHAM",
        "BAT-GEAR": "BAT-GEAR"
    };
 
    const rarityMap = {
        "COMMON": "COMUM",
        "RARE": "RARO",
        "EPIC": "ÉPICO",
        "LEGENDARY": "LENDÁRIO"
    };
 
    const statusMap = {
        "ARCHIVE VERIFIED": "ARQUIVO VERIFICADO"
    };
 
    return {
        id,
        nome: figurinha.nome || "ARQUIVO DESCONHECIDO",
        categoria: categoryMap[figurinha.categoria] || figurinha.categoria || "A FAMÍLIA BAT",
        raridade: rarityMap[figurinha.raridade] || figurinha.raridade || getRarityById(id),
        descricao: figurinha.descricao || "Dossiê classificado disponível para verificação.",
        imagem_url: figurinha.imagem_url || `/figurinhas/${id}/imagem`,
        status: statusMap[figurinha.status] || figurinha.status || "ARQUIVO VERIFICADO"
    };
}
 
function updateCollectionDashboard(totalCount, recoveredCount) {
    const progressStats = document.getElementById("progress-stats");
    const progressPercentage = document.getElementById("progress-percentage");
    const progressBar = document.getElementById("db-progress-bar");
 
    const safeRecovered = Math.max(0, Math.min(recoveredCount, totalCount));
    const percent = Math.round((safeRecovered / totalCount) * 100);
 
    if (progressStats) progressStats.textContent = `${safeRecovered} / ${totalCount} ARQUIVOS RECUPERADOS`;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercentage) progressPercentage.textContent = `${percent}%`;
}
 
function updateLocalTimeDisplay() {
    const timeElement = document.getElementById("local-time-text");
    if (!timeElement) return;
 
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
 
    timeElement.textContent = `CIDADE GOTHAM // HORÁRIO LOCAL ${hours}:${minutes}`;
}
 
function openArchiveModal(figurinha) {
    const modal = document.getElementById("archive-modal");
    const modalImage = document.getElementById("modal-image");
    const modalRarity = document.getElementById("modal-rarity");
    const modalTitle = document.getElementById("modal-title");
    const modalCategory = document.getElementById("modal-category");
    const modalId = document.getElementById("modal-id");
    const modalDesc = document.getElementById("modal-desc");
    const modalStatus = document.getElementById("modal-status");
 
    if (!modal || !modalImage || !modalRarity || !modalTitle || !modalCategory || !modalId || !modalDesc || !modalStatus) {
        return;
    }
 
    const source = normalizeFigurinha(figurinha);
    modalImage.src = `${API_BASE_URL}${source.imagem_url}`;
    modalImage.alt = source.nome;
    modalRarity.textContent = source.raridade;
    modalTitle.textContent = source.nome.toUpperCase();
    modalCategory.textContent = source.categoria;
    modalId.textContent = `#${String(source.id).padStart(2, "0")}`;
    modalDesc.textContent = source.descricao;
    modalStatus.textContent = source.status;
 
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    
    playTechClickSound();
    triggerHaptic(14);
 
    gsap.fromTo(".modal-backdrop", { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(".modal-wrapper", 
        { scale: 0.8, opacity: 0, rotationX: 10 }, 
        { scale: 1, opacity: 1, rotationX: 0, duration: 0.6, ease: "back.out(1.5)" }
    );
    gsap.fromTo(".modal-image",
        { clipPath: "inset(0 100% 0 0)" }, 
        { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power3.inOut", delay: 0.2 }
    );
    gsap.fromTo(".info-group",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, delay: 0.4 }
    );
}
 
function closeArchiveModal() {
    const modal = document.getElementById("archive-modal");
    if (!modal) return;
    
    gsap.to(".modal-wrapper", { scale: 0.9, opacity: 0, duration: 0.3, ease: "power2.in" });
    gsap.to(".modal-backdrop", {
        opacity: 0, duration: 0.3, onComplete: () => {
            modal.classList.add("hidden");
            modal.setAttribute("aria-hidden", "true");
            gsap.set([".modal-wrapper", ".modal-backdrop", ".modal-image", ".info-group"], {clearProps: "all"});
        }
    });
}
 
const applyTiltEffect = () => {
    if (!hasFinePointer()) return;
 
    document.querySelectorAll(".sticker-slot").forEach(slot => {
        slot.addEventListener("mousemove", (e) => {
            const rect = slot.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -12; 
            const rotateY = ((x - centerX) / centerX) * 12;
            
            slot.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
 
        slot.addEventListener("mouseleave", () => {
            slot.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            document.body.classList.remove("hover-slot");
        });
 
        slot.addEventListener("mouseenter", () => {
            document.body.classList.add("hover-slot");
            playHoverSound();
        });
    });
};
 
async function preencherFigurinhas() {
    const totalSlots = document.querySelectorAll(".sticker-slot").length;
 
    try {
        const response = await fetch(`${API_BASE_URL}/figurinhas`);
        if (!response.ok) throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
 
        const figurinhas = await response.json();
        const normalizedFigurinhas = figurinhas.map(normalizeFigurinha);
        const porId = new Map(normalizedFigurinhas.map((item) => [item.id, item]));
        const slots = document.querySelectorAll(".sticker-slot");
 
        slots.forEach((slot) => {
            const slotNumberEl = slot.querySelector(".slot-number");
            if (!slotNumberEl) return;
 
            const id = Number.parseInt(slotNumberEl.textContent.replace("#", ""), 10);
            const figurinha = porId.get(id);
            if (!figurinha) return;
 
            const slotName = slot.querySelector(".slot-name");
            const slotRole = slot.querySelector(".slot-role");
 
            if (slotName) slotName.textContent = figurinha.nome;
            if (slotRole) slotRole.textContent = figurinha.categoria;
 
            slot.setAttribute("role", "button");
            slot.setAttribute("tabindex", "0");
            slot.setAttribute("aria-label", `Abrir arquivo de ${figurinha.nome}`);
            slot.dataset.figurinha = JSON.stringify(figurinha);
 
            // Skeleton de carregamento: fica visível (com shimmer, via CSS)
            // até a imagem terminar de carregar, em vez de deixar o slot
            // vazio/piscando enquanto a rede mobile busca os dados.
            const ghost = document.createElement("div");
            ghost.className = "slot-ghost";
            slot.insertBefore(ghost, slot.firstChild);
 
            const img = document.createElement("img");
            img.src = `${API_BASE_URL}${figurinha.imagem_url}`;
            img.alt = figurinha.nome;
            img.className = "sticker-img";
            // Os primeiros slots (prováveis de aparecer imediatamente na
            // primeira página) carregam eager; o resto usa lazy loading
            // para não competir por banda em conexões móveis lentas.
            img.loading = id <= 5 ? "eager" : "lazy";
            img.decoding = "async";
 
            img.onload = () => { slot.classList.add("slot-filled"); triggerHaptic(6); };
            img.onerror = () => { console.warn(`Imagem não encontrada para: ${figurinha.nome}`); };
 
            slot.insertBefore(img, slot.firstChild);
 
            slot.addEventListener("click", () => openArchiveModal(figurinha));
            slot.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openArchiveModal(figurinha);
                }
            });
        });
 
        updateCollectionDashboard(totalSlots, normalizedFigurinhas.length);
        applyTiltEffect();
    } catch (erro) {
        console.warn("⚠️  Não foi possível conectar à API do backend:", erro.message);
        updateCollectionDashboard(totalSlots, 0);
    }
}
 
// ===================================================
// INICIALIZAÇÃO DA PÁGINA E EVENTOS DOM
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
    const bookElement = document.getElementById("book");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const soundToggle = document.getElementById("sound-toggle");
    const iconOn = soundToggle.querySelector(".sound-icon-on");
    const iconOff = soundToggle.querySelector(".sound-icon-off");
    const introScreen = document.getElementById("intro-screen");
    const modal = document.getElementById("archive-modal");
    const modalClose = document.getElementById("modal-close");
 
    updateLocalTimeDisplay();
    window.setInterval(updateLocalTimeDisplay, 1000);
    unlockAudioOnFirstGesture();
 
    if (typeof gsap !== "undefined" && typeof TextPlugin !== "undefined") {
        gsap.registerPlugin(TextPlugin);
    }
 
    const introWillAnimateBook = Boolean(bookElement && introScreen && typeof gsap !== "undefined");
    if (introWillAnimateBook) {
        gsap.set(bookElement, { opacity: 0, scale: 0.93, rotationX: 7, transformOrigin: "50% 100%" });
    }
 
    // ==========================================
    // DICA DE SWIPE (só mobile, só na primeira visita)
    // ==========================================
    const showSwipeHintIfNeeded = () => {
        try {
            if (window.innerWidth > 767) return;
            if (localStorage.getItem("gothamSwipeHintShown")) return;
            if (!bookElement || typeof gsap === "undefined") return;
 
            localStorage.setItem("gothamSwipeHintShown", "1");
 
            gsap.timeline({ delay: 0.4 })
                .to(bookElement, { x: -18, rotation: -1.2, duration: 0.45, ease: "power2.out" })
                .to(bookElement, { x: 6, rotation: 0.4, duration: 0.35, ease: "power2.inOut" })
                .to(bookElement, { x: 0, rotation: 0, duration: 0.4, ease: "power2.out" });
        } catch (e) { /* localStorage pode falhar em modo privado — a dica é só um extra */ }
    };
 
    let tlIntro = null;
    if (introScreen && typeof gsap !== "undefined") {
        tlIntro = gsap.timeline({
            onComplete: () => {
                introScreen.classList.add("hidden");
                introScreen.setAttribute("aria-hidden", "true");
                showSwipeHintIfNeeded();
            }
        });
 
        tlIntro.to(".intro-line", { opacity: 1, duration: 0.1, stagger: 0.3 })
        .to(".intro-progress-bar", { width: "100%", duration: 0.8, ease: "power2.inOut" }, "-=0.2")
        .to(".intro-terminal", { scale: 1.05, opacity: 0, duration: 0.4, ease: "power2.in" }, "+=0.3")
        .to(introScreen, { opacity: 0, backdropFilter: "blur(0px)", duration: 0.6 }, "<")
        .to(bookElement, { opacity: 1, scale: 1, rotationX: 0, duration: 1, ease: "power3.out" }, "<0.1")
        .fromTo(".bat-signal-glow", { opacity: 1, scale: 1 }, { opacity: 1.8, scale: 1.5, duration: 0.35, ease: "power2.out", yoyo: true, repeat: 1 }, "<");
    } else if (introScreen) {
        window.setTimeout(() => {
            introScreen.classList.add("hidden");
            introScreen.setAttribute("aria-hidden", "true");
            showSwipeHintIfNeeded();
        }, 1700);
    }
 
    // ==========================================
    // FÍSICA AWWWARDS: Cursor e Botões Magnéticos
    // ==========================================
    const cursorBatman = document.getElementById("cursor-batman");
 
    if (hasFinePointer() && cursorBatman) {
        let mouseX = 0, mouseY = 0;
        let smoothedX = 0, smoothedY = 0;
        let cursorRotation = 0;
        let isCursorPressed = false;
 
        const cursorWidth = 50;
        const cursorHeight = 25;
        const centerXOffset = cursorWidth / 2;
        const centerYOffset = cursorHeight / 2;
 
        window.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });
        window.addEventListener("mousedown", () => { isCursorPressed = true; });
        window.addEventListener("mouseup", () => { isCursorPressed = false; });
        window.addEventListener("blur", () => { isCursorPressed = false; });
 
        function renderCursor() {
            const followSpeed = 0.18;
            const prevX = smoothedX;
            const prevY = smoothedY;
 
            smoothedX += (mouseX - smoothedX) * followSpeed;
            smoothedY += (mouseY - smoothedY) * followSpeed;
 
            const velX = smoothedX - prevX;
            const velY = smoothedY - prevY;
            const speed = Math.hypot(velX, velY);
            if (speed > 0.35) {
                const angle = Math.atan2(velY, velX) * (180 / Math.PI);
                const targetRotation = Math.max(-30, Math.min(30, angle * 0.4));
                cursorRotation += (targetRotation - cursorRotation) * 0.15;
            } else {
                cursorRotation += (0 - cursorRotation) * 0.1;
            }
 
            const hoverScale = document.body.classList.contains("hover-btn") || document.body.classList.contains("hover-slot") ? 1.4 : 1;
            const squashY = isCursorPressed ? 0.72 : 1;
 
            cursorBatman.style.transform = `translate(${smoothedX - centerXOffset}px, ${smoothedY - centerYOffset}px) rotate(${cursorRotation.toFixed(2)}deg) scale(${hoverScale}, ${(hoverScale * squashY).toFixed(2)})`;
            requestAnimationFrame(renderCursor);
        }
        renderCursor(); 
    }
 
    const magneticBtns = document.querySelectorAll(".nav-btn, .sound-btn");
    
    if (hasFinePointer()) {
        magneticBtns.forEach(btn => {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.4, ease: "power2.out" });
                document.body.classList.add("hover-btn");
            });
 
            btn.addEventListener("mouseleave", () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
                document.body.classList.remove("hover-btn");
            });
            
            btn.addEventListener("mouseenter", playHoverSound);
        });
    }
 
    // ==========================================
    // EVENTOS DO MODAL E INTERFACE
    // ==========================================
    if (modalClose) {
        modalClose.addEventListener("click", () => { playTechClickSound(); closeArchiveModal(); });
    }
 
    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target.classList.contains("modal-backdrop")) {
                playTechClickSound();
                closeArchiveModal();
            }
        });
    }
 
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal && !modal.classList.contains("hidden")) closeArchiveModal();
    });
 
    soundToggle.addEventListener("click", () => {
        isMuted = !isMuted;
        iconOn.classList.toggle("hidden", isMuted);
        iconOff.classList.toggle("hidden", !isMuted);
    });
 
    // ==========================================
    // INICIALIZAÇÃO DO PAGEFLIP
    // ==========================================
    let pageFlip = null;
 
    try {
        pageFlip = new St.PageFlip(bookElement, {
            width: 550,
            height: 800,
            size: "stretch",
            minWidth: 260,
            maxWidth: 1000,
            minHeight: 380,
            maxHeight: 1350,
            drawShadow: true,
            maxShadowOpacity: 0.4,
            showCover: true,
            usePortrait: true,
            mobileScrollSupport: false, // Desligado para evitar conflito
            useMouseEvents: false,
            showPageCorners: false,
            disableFlipByClick: true,
            flippingTime: 800
        });
 
        pageFlip.loadFromHTML(document.querySelectorAll(".page"));
 
        let activeDragPage = null;
        let isClicking = false;
        let startX = 0;
        let startY = 0;
        let dragStarted = false;
 
        document.querySelectorAll(".page").forEach((page, index) => {
            page.addEventListener("mousedown", (event) => {
                if (event.target.closest("button") || event.target.closest("a") || event.target.closest(".sticker-slot")) return;
                isClicking = true;
                startX = event.clientX;
                startY = event.clientY;
                dragStarted = false;
                activeDragPage = { page, index };
            });
 
            page.addEventListener("touchstart", (event) => {
                if (event.target.closest("button") || event.target.closest("a") || event.target.closest(".sticker-slot")) return;
                const touch = event.touches[0];
                isClicking = true;
                startX = touch.clientX;
                startY = touch.clientY;
                dragStarted = false;
                activeDragPage = { page, index };
            });
        });
 
        const handleMove = (clientX, clientY, isTouch = false) => {
            if (!isClicking || !activeDragPage) return;
 
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const bookRect = bookElement.getBoundingClientRect();
 
            if (distance > 10 && !dragStarted) {
                dragStarted = true;
                
                const centerY = bookRect.top + bookRect.height / 2;
                const cornerY = startY < centerY ? 0 : bookRect.height;
                
                // Baseado na direção do dedo para puxar o canto correto (swipe fixado para frente e trás)
                const cornerX = deltaX > 0 ? 0 : bookRect.width; 
 
                document.body.classList.add("dragging");
                pageFlip.startUserTouch({ x: cornerX, y: cornerY });
            }
 
            if (dragStarted) {
                const relX = clientX - bookRect.left;
                const relY = clientY - bookRect.top;
                pageFlip.userMove({ x: relX, y: relY }, isTouch);
            }
        };
 
        const handleRelease = (clientX, clientY, isTouch = false) => {
            if (dragStarted) {
                const bookRect = bookElement.getBoundingClientRect();
                const relX = clientX - bookRect.left;
                const relY = clientY - bookRect.top;
                pageFlip.userStop({ x: relX, y: relY }, isTouch);
            }
            isClicking = false;
            dragStarted = false;
            activeDragPage = null;
            document.body.classList.remove("dragging");
        };
 
        window.addEventListener("mousemove", (event) => handleMove(event.clientX, event.clientY, false));
        window.addEventListener("touchmove", (event) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                if (dragStarted) event.preventDefault();
                handleMove(touch.clientX, touch.clientY, true);
            }
        }, { passive: false });
        window.addEventListener("mouseup", (event) => handleRelease(event.clientX, event.clientY, false));
        window.addEventListener("touchend", (event) => {
            const touch = event.changedTouches[0] || event.touches[0];
            if (touch) {
                handleRelease(touch.clientX, touch.clientY, true);
            } else {
                handleRelease(startX, startY, true);
            }
        });
 
        bookElement.style.display = "block";
        preencherFigurinhas();
 
        pageFlip.on("changeState", (event) => {
            if (event.data === "flipping") playPaperTurnSound();
        });
 
        const updateNavButtons = (currentPageIndex) => {
            const totalPages = pageFlip.getPageCount();
            btnPrev.classList.toggle("hidden", currentPageIndex === 0);
            btnNext.classList.toggle("hidden", currentPageIndex === totalPages - 1);
        };
 
        // Indicador "X / Y", visível só no mobile (o CSS cuida do display).
        // Existe porque, sem a visão de duas páginas do desktop, o usuário
        // perde a noção de quantas páginas faltam no álbum.
        const pageIndicatorText = document.getElementById("page-indicator-text");
        const updatePageIndicator = (currentPageIndex) => {
            if (!pageIndicatorText) return;
            const totalPages = pageFlip.getPageCount();
            pageIndicatorText.textContent = `${currentPageIndex + 1} / ${totalPages}`;
        };
 
        pageFlip.on("flip", (event) => {
            updateNavButtons(event.data);
            updatePageIndicator(event.data);
            triggerHaptic(8);
        });
 
        updatePageIndicator(0);
 
        // Vínculo dos botões com stopPropagation para previnir conflitos
        const bindNavButton = (button, action) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation(); // Impede que o clique vaze pro livro
                action();
                playTechClickSound();
            });
        };
 
        bindNavButton(btnPrev, () => pageFlip.flipPrev());
        bindNavButton(btnNext, () => pageFlip.flipNext());
 
        document.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") pageFlip.flipPrev();
            if (event.key === "ArrowRight") pageFlip.flipNext();
        });
 
        btnPrev.classList.add("hidden");
 
    } catch (error) {
        console.error("Erro ao inicializar a biblioteca PageFlip:", error);
    }
});