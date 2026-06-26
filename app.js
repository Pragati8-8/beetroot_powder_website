// Configuration
const totalFrames = 210;
const images = [];
let loadedCount = 0;

// Elements
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const loadingText = document.getElementById('loading-text');
const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');

// Image dimensions (1280x720 resolution)
const imgWidth = 1280;
const imgHeight = 720;

// State
let targetFrame = 1;
let currentFrame = 1;
let lastDrawnFrame = 0;

// 1. Preload all frame images into memory
function preloadImages() {
    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(3, '0');
        img.src = `assets/frames/ezgif-frame-${frameNum}.jpg`;
        img.onload = () => {
            loadedCount++;
            updateLoaderProgress();
        };
        img.onerror = () => {
            console.error(`Failed to load frame ${frameNum}`);
            loadedCount++; // Count to avoid blocking initialization
            updateLoaderProgress();
        };
        images.push(img);
    }
}

function updateLoaderProgress() {
    const percentage = Math.round((loadedCount / totalFrames) * 100);
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (loadingText) loadingText.textContent = `${percentage}%`;

    if (loadedCount === totalFrames) {
        setTimeout(() => {
            if (loader) loader.classList.add('fade-out');
            document.body.style.overflow = 'auto'; // Enable scrolling
            initAnimation();
        }, 500);
    }
}

// 2. Initialize Canvas & Start Loop
function initAnimation() {
    resizeCanvas();
    const progress = updateTargetFrame();
    currentFrame = targetFrame; // Snap immediately on first render
    drawFrame(Math.round(currentFrame));
    updateTextSlides(progress);
    updateNavbar();
    initScrollNavigation();
    
    // Start continuous rendering loop
    requestAnimationFrame(renderLoop);
}

// Draw frame to match the viewport using a crisp "cover" scaling factor
function drawFrame(index) {
    if (index < 1 || index > totalFrames || !images[index - 1]) return;
    
    const img = images[index - 1];
    
    // Calculate aspect ratio scale factors to cover the screen
    const scale = Math.max(canvas.width / imgWidth, canvas.height / imgHeight);
    const w = imgWidth * scale;
    const h = imgHeight * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, w, h);
    
    lastDrawnFrame = index;
}

// Calculate the frame sequence index matching the exact scroll depth of the scroll track
function updateTargetFrame() {
    const scrollTrack = document.querySelector('.scroll-track');
    if (!scrollTrack) return 0;
    
    const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    
    let progress = window.scrollY / maxScroll;
    progress = Math.max(0, Math.min(1, progress)); // Clamp progress 0 to 1
    
    // Map linear scroll progress to frame sequence range [1, 210]
    targetFrame = 1 + progress * (totalFrames - 1);
    
    return progress;
}

// Resize canvas to match the physical backing store resolution
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    drawFrame(Math.round(currentFrame));
}

// Helper to calculate opacity and translateY for scroll slides
function getSlideState(progress, startIn, endIn, startOut, endOut) {
    let opacity = 0;
    let translateY = 20; // Starts 20px down
    
    if (progress >= startIn && progress <= endOut) {
        if (progress < endIn) {
            // Fade in
            const factor = (progress - startIn) / (endIn - startIn);
            opacity = factor;
            translateY = 20 * (1 - factor);
        } else if (progress > startOut) {
            // Fade out
            const factor = (progress - startOut) / (endOut - startOut);
            opacity = 1 - factor;
            translateY = -20 * factor;
        } else {
            // Active / Fully Visible
            opacity = 1;
            translateY = 0;
        }
    } else if (progress > endOut) {
        opacity = 0;
        translateY = -20;
    }
    
    return { opacity, translateY };
}

function applySlideStyle(element, state) {
    element.style.opacity = state.opacity;
    element.style.transform = `translateY(${state.translateY}px)`;
    element.style.pointerEvents = state.opacity > 0.1 ? 'auto' : 'none';
}

// Update the visibility of scroll slides
function updateTextSlides(progress) {
    const slide1 = document.getElementById('slide-1');
    const slide2 = document.getElementById('slide-2');
    const slide3 = document.getElementById('slide-3');
    
    if (!slide1 || !slide2 || !slide3) return;
    
    // Slide 1 configuration: active from start, fades out 0.20 to 0.30
    const s1 = getSlideState(progress, -0.1, 0.0, 0.20, 0.30);
    applySlideStyle(slide1, s1);
    
    // Slide 2 configuration: fades in 0.30 to 0.40, fades out 0.55 to 0.65
    const s2 = getSlideState(progress, 0.30, 0.40, 0.55, 0.65);
    applySlideStyle(slide2, s2);
    
    // Slide 3 configuration: fades in 0.65 to 0.75, fades out 0.85 to 0.95
    const s3 = getSlideState(progress, 0.65, 0.75, 0.85, 0.95);
    applySlideStyle(slide3, s3);
}

// Handle the navbar styling class on scroll
function updateNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Initialize smooth scroll mappings for menu items
function initScrollNavigation() {
    const scrollLinks = document.querySelectorAll('[data-scroll-to]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-scroll-to');
            let scrollY = 0;
            
            const scrollTrack = document.querySelector('.scroll-track');
            const maxScroll = scrollTrack ? (scrollTrack.offsetHeight - window.innerHeight) : 0;
            
            if (target === 'shop') {
                scrollY = 0;
            } else if (target === 'recipes') {
                const el = document.getElementById('recipes');
                scrollY = el ? (el.getBoundingClientRect().top + window.scrollY) : maxScroll;
            } else if (target === 'benefits') {
                const el = document.getElementById('benefits');
                scrollY = el ? (el.getBoundingClientRect().top + window.scrollY) : maxScroll;
            } else if (target === 'reviews') {
                const el = document.getElementById('reviews');
                scrollY = el ? (el.getBoundingClientRect().top + window.scrollY) : maxScroll;
            }
            
            window.scrollTo({
                top: scrollY,
                behavior: 'smooth'
            });
        });
    });

    // Wire up Shop Now button toast action
    const shopBtn = document.getElementById('shop-now-btn');
    if (shopBtn) {
        shopBtn.addEventListener('click', () => {
            showToast('Vital Beet online store is opening soon!');
        });
    }
}

// Custom interactive toast feedback
function showToast(message) {
    const existing = document.querySelector('.beetroot-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'beetroot-toast fixed bottom-6 right-6 bg-primary text-white py-md px-lg rounded-xl shadow-2xl z-[9999] font-label-md transition-all duration-300 transform translate-y-10 opacity-0 border border-primary-light';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Smooth transition in
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 50);
    
    // Smooth transition out
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2800);
}

// Smooth frame scrubbing using linear interpolation (lerp)
function renderLoop() {
    const progress = updateTargetFrame();
    
    // Lerp factor controls smoothing weight (0.15 = 15% distance closing per frame)
    const lerpFactor = 0.15;
    currentFrame += (targetFrame - currentFrame) * lerpFactor;
    
    const frameToDraw = Math.round(currentFrame);
    
    // Draw the frame only if the computed frame index updates
    if (frameToDraw !== lastDrawnFrame) {
        drawFrame(frameToDraw);
    }
    
    // Update active slide states and navbar styling
    updateTextSlides(progress);
    updateNavbar();
    
    requestAnimationFrame(renderLoop);
}

// Event Listeners
window.addEventListener('resize', resizeCanvas);

// Prevent scrolling until frames are buffered
document.body.style.overflow = 'hidden';

// Begin loading frame buffers
preloadImages();
