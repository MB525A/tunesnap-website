(() => {
    const root = document.documentElement;
    const themeToggle = document.getElementById("themeToggle");

    function isLightTheme() {
        return root.getAttribute("data-theme") === "light";
    }

    function syncThemeImages() {
        const light = isLightTheme();
        document.querySelectorAll("img[data-dark-src][data-light-src]").forEach((img) => {
            const target = light ? img.dataset.lightSrc : img.dataset.darkSrc;
            if (target && img.getAttribute("src") !== target) {
                img.setAttribute("src", target);
            }
        });
    }

    function updateThemeButtonLabel() {
        if (!themeToggle) return;
        const light = isLightTheme();
        themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
        themeToggle.setAttribute("title", light ? "Switch to dark theme" : "Switch to light theme");
    }

    syncThemeImages();
    updateThemeButtonLabel();

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = isLightTheme() ? "dark" : "light";
            root.setAttribute("data-theme", nextTheme);
            try {
                localStorage.setItem("tunesnap_theme", nextTheme);
            } catch {
                // Ignore storage restrictions
            }
            syncThemeImages();
            updateThemeButtonLabel();
            refreshOpenLightbox();
        });
    }

    // Mobile navigation drawer
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.toggle("open");
            menuBtn.setAttribute("aria-expanded", String(isOpen));
        });
        mobileMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("open");
                menuBtn.setAttribute("aria-expanded", "false");
            });
        });
    }

    // Gallery horizontal scroll arrows
    const track = document.getElementById("galleryTrack");
    const prevBtn = document.getElementById("galleryPrev");
    const nextBtn = document.getElementById("galleryNext");
    if (track && prevBtn && nextBtn) {
        const scrollStep = () => Math.max(260, Math.round(track.clientWidth * 0.72));
        prevBtn.addEventListener("click", () => track.scrollBy({ left: -scrollStep(), behavior: "smooth" }));
        nextBtn.addEventListener("click", () => track.scrollBy({ left: scrollStep(), behavior: "smooth" }));
    }

    // Theme-aware Lightbox overlay
    const lightbox = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightboxImg");
    const lbCaption = document.getElementById("lightboxCaption");
    const lbClose = document.getElementById("lightboxClose");
    const lbPrev = document.getElementById("lightboxPrev");
    const lbNext = document.getElementById("lightboxNext");

    const galleryItems = [
        {
            id: "live-us",
            darkSrc: "./assets/dark/live-us.webp",
            lightSrc: "./assets/light/live-us.webp",
            caption: "Live Now Playing — Real-time track titles across your stations."
        },
        {
            id: "roulette",
            darkSrc: "./assets/dark/roulette.webp",
            lightSrc: "./assets/light/roulette.webp",
            caption: "Global Radio Roulette — Spin for a live station anywhere."
        },
        {
            id: "explore-country",
            darkSrc: "./assets/dark/explore-country.webp",
            lightSrc: "./assets/light/explore-country.webp",
            caption: "Worldwide Radio — Browse stations by country."
        },
        {
            id: "explore-genre",
            darkSrc: "./assets/dark/explore-genre.webp",
            lightSrc: "./assets/light/explore-genre.webp",
            caption: "Explore by Genre — 27+ styles from Lo-Fi to Trance & Jazz."
        },
        {
            id: "songs-history",
            darkSrc: "./assets/dark/songs-history.webp",
            lightSrc: "./assets/light/songs-history.webp",
            caption: "Loved Songs & 30-Day History — Never lose a track."
        },
        {
            id: "live-uk",
            darkSrc: "./assets/dark/live-uk.webp",
            lightSrc: "./assets/light/live-uk.webp",
            caption: "Country Lists — Filter stations, songs, or tags instantly."
        },
        {
            id: "settings",
            darkSrc: "./assets/dark/settings.webp",
            lightSrc: "./assets/light/settings.webp",
            caption: "Track Links & Settings — Pick your music app & theme."
        },
        {
            id: "android-auto",
            darkSrc: "./assets/android-auto.webp",
            lightSrc: "./assets/android-auto.webp",
            caption: "In-Car Display — Live song titles, Roulette & one-tap saves."
        }
    ];
    let currentIndex = 0;

    function renderLightbox(index) {
        if (!lbImg || !lbCaption) return;
        currentIndex = (index + galleryItems.length) % galleryItems.length;
        const item = galleryItems[currentIndex];
        lbImg.src = isLightTheme() ? item.lightSrc : item.darkSrc;
        lbImg.alt = item.caption;
        lbCaption.textContent = item.caption;
    }

    function openLightbox(index) {
        if (!lightbox) return;
        renderLightbox(index);
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
    }

    function refreshOpenLightbox() {
        if (lightbox && lightbox.classList.contains("open")) {
            renderLightbox(currentIndex);
        }
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
    }

    document.querySelectorAll("[data-lightbox]").forEach((el) => {
        el.addEventListener("click", () => {
            const img = el.tagName === "IMG" ? el : el.querySelector("img");
            const screenId = img ? img.dataset.screenId : "";
            const idx = galleryItems.findIndex((g) => g.id === screenId);
            openLightbox(idx >= 0 ? idx : 0);
        });
    });

    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lbImg) lbImg.addEventListener("click", closeLightbox);
    if (lbPrev) lbPrev.addEventListener("click", () => renderLightbox(currentIndex - 1));
    if (lbNext) lbNext.addEventListener("click", () => renderLightbox(currentIndex + 1));
    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener("keydown", (e) => {
        if (!lightbox || !lightbox.classList.contains("open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") renderLightbox(currentIndex - 1);
        if (e.key === "ArrowRight") renderLightbox(currentIndex + 1);
    });

    // Contact form submission (AJAX via Formspree)
    const contactForm = document.getElementById("contactForm");
    const contactStatus = document.getElementById("contactStatus");
    if (contactForm && contactStatus) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector("button[type='submit']");
            const originalText = submitBtn ? submitBtn.textContent : "Send Message";
            contactStatus.className = "contact-status";
            contactStatus.textContent = "Sending your message...";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending...";
            }

            try {
                const res = await fetch(contactForm.action, {
                    method: "POST",
                    body: new FormData(contactForm),
                    headers: { Accept: "application/json" }
                });
                if (res.ok) {
                    contactForm.reset();
                    contactStatus.classList.add("success");
                    contactStatus.textContent = "Message sent! We'll reply soon.";
                } else {
                    contactStatus.classList.add("error");
                    contactStatus.textContent = "Couldn't send right now. Please try again.";
                }
            } catch {
                contactStatus.classList.add("error");
                contactStatus.textContent = "Network error. Please try again in a moment.";
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }

    // Floating Scroll-to-Top button
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    if (scrollTopBtn) {
        const onScroll = () => {
            scrollTopBtn.classList.toggle("visible", window.scrollY > 380);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Scroll reveal animations
    const reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        reveals.forEach((el) => observer.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add("visible"));
    }
})();
