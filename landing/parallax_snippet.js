
// ... (previous content)

// ===== Parallax Scroll =====
function initParallaxScroll() {
    const grid = document.querySelector('.character-cards-grid');
    if (!grid) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    const RATE = 0.5; // adjust speed here

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const delta = currentScrollY - lastScrollY;

                // Move sideways based on vertical scroll
                if (Math.abs(delta) > 0) {
                    grid.scrollLeft += delta * RATE;
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    });
}
