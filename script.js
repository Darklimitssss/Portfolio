/***********************
 * Color Theme Manager
 * Handles dynamic color theme changes for the website
 ***********************/

// Theme Constants
const DEFAULT_HUE = 90;
const MAX_SATURATION = 1.0;
const MAX_VALUE = 0.9;
const DARKEN_FACTOR = 0.7;

/***********************
 * Color Conversion Utilities
 ***********************/

/**
 * Converts HSV color values to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-1)
 * @param {number} v - Value (0-1)
 * @returns {number[]} Array of [r, g, b] values (0-255)
 */
function HSVToRGB(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;

    let r, g, b;
    
    switch (true) {
        case h >= 0 && h < 60:
            [r, g, b] = [c, x, 0];
            break;
        case h >= 60 && h < 120:
            [r, g, b] = [x, c, 0];
            break;
        case h >= 120 && h < 180:
            [r, g, b] = [0, c, x];
            break;
        case h >= 180 && h < 240:
            [r, g, b] = [0, x, c];
            break;
        case h >= 240 && h < 300:
            [r, g, b] = [x, 0, c];
            break;
        default:
            [r, g, b] = [c, 0, x];
    }

    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];
}

/**
 * Converts RGB values to hexadecimal color string
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color code (e.g., '#ff0000')
 */
function RGBToHex(r, g, b) {
    const toHex = (n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return '#' + [r, g, b].map(toHex).join('');
}

/***********************
 * Color Manipulation
 ***********************/

/**
 * Creates a darker version of the provided color
 * @param {string} color - Hex color code
 * @returns {string} Darker hex color code
 */
function darkenColor(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const darkerRGB = [r, g, b].map(component => 
        Math.max(0, Math.floor(component * DARKEN_FACTOR))
    );
    
    return RGBToHex(...darkerRGB);
}

/***********************
 * Theme Management
 ***********************/

/**
 * Updates the theme colors based on the selected hue
 * @param {number} hue - Color hue value (0-360)
 */
function updateThemeColors(hue) {
    // Check if slider is in the white area (first 5% of the range)
    const isWhite = hue <= 18; // 5% of 360 is 18
    
    const rgb = HSVToRGB(hue, isWhite ? 0 : MAX_SATURATION, MAX_VALUE);
    const mainColor = RGBToHex(...rgb);
    const borderColor = darkenColor(mainColor);
    
    document.documentElement.style.setProperty('--theme-color', mainColor);
    document.documentElement.style.setProperty('--theme-border-color', borderColor);
}

/**
 * Initializes the color theme functionality
 */
function initializeColorTheme() {
    const hueSliders = document.querySelectorAll('.hue-slider');
    if (!hueSliders.length) {
        console.error('Hue slider elements not found');
        return;
    }

    // Set initial color
    updateThemeColors(DEFAULT_HUE);

    // Add event listener for color changes to all sliders
    hueSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const hue = parseInt(e.target.value);
            updateThemeColors(hue);
            // Keep all sliders in sync
            hueSliders.forEach(s => {
                if (s !== e.target) {
                    s.value = hue;
                }
            });
        });
    });
}

/***********************
 * Section Navigation
 ***********************/

/**
 * Handles section transitions with glitch effect
 * @param {string} sectionId - ID of the section to show
 */
function handleSectionTransition(sectionId) {
    const sections = ['home', 'who', 'what', 'portfolio'];
    const targetSection = document.getElementById(sectionId);
    
    // Hide all sections first
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section && section !== targetSection) {
            section.classList.remove('active');
            const box = section.querySelector('.content-box');
            if (box) {
                box.classList.remove('active', 'glitch');
            }
        }
    });

    // Show target section with glitch effect
    if (targetSection) {
        targetSection.classList.add('active');
        const box = targetSection.querySelector('.content-box');
        if (box) {
            box.classList.add('active', 'glitch');
            
            // Apply glitch effect to all text elements
            const textElements = box.querySelectorAll('.body-title, .body-text, .thus, strong, span, .tableProjects');
            textElements.forEach((el, index) => {
                // Add glitch class with staggered delay
                setTimeout(() => {
                    el.classList.add('text-glitch');
                    // Remove glitch class after animation
                    setTimeout(() => {
                        el.classList.remove('text-glitch');
                    }, 300);
                }, index * 50);
            });

            // Remove box glitch after animation
            setTimeout(() => {
                box.classList.remove('glitch');
            }, 300);
        }
    }
}

/**
 * Initializes section navigation
 */
function initializeSectionNavigation() {
    // Add click event listeners to navigation links
    document.querySelectorAll('a.menu').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            handleSectionTransition(sectionId);
            // Update URL without page reload
            history.pushState(null, '', `#${sectionId}`);
        });
    });

    // Handle initial section based on URL hash
    window.addEventListener('load', () => {
        const hash = window.location.hash.substring(1) || 'home';
        handleSectionTransition(hash);
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1) || 'home';
        handleSectionTransition(hash);
    });
}

/***********************
 * Mobile Menu
 ***********************/

/**
 * Handles mobile menu functionality
 * Controls the hamburger menu button and mobile navigation
 */
function initializeMobileMenu() {
    const menuButton = document.querySelector('.nav-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    let isMenuOpen = false;

    if (!menuButton || !mobileMenu) {
        console.error('Mobile menu elements not found');
        return;
    }

    // Toggle menu on button click
    menuButton.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        mobileMenu.classList.toggle('active');
        
        // Update button icon for menu state
        const paths = menuButton.querySelectorAll('path');
        if (isMenuOpen) {
            // Change to X icon
            paths[1].setAttribute('d', 'M6 6l12 12');
            paths[2].setAttribute('d', 'M6 18l12 -12');
            paths[3].setAttribute('d', '');
        } else {
            // Change back to hamburger icon
            paths[1].setAttribute('d', 'M4 6l16 0');
            paths[2].setAttribute('d', 'M4 12l16 0');
            paths[3].setAttribute('d', 'M4 18l16 0');
        }
    });

    // Close menu when a link is clicked
    mobileMenu.querySelectorAll('a.menu').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            isMenuOpen = false;
            // Reset hamburger icon
            const paths = menuButton.querySelectorAll('path');
            paths[1].setAttribute('d', 'M4 6l16 0');
            paths[2].setAttribute('d', 'M4 12l16 0');
            paths[3].setAttribute('d', 'M4 18l16 0');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && 
            !mobileMenu.contains(e.target) && 
            !menuButton.contains(e.target)) {
            mobileMenu.classList.remove('active');
            isMenuOpen = false;
            // Reset hamburger icon
            const paths = menuButton.querySelectorAll('path');
            paths[1].setAttribute('d', 'M4 6l16 0');
            paths[2].setAttribute('d', 'M4 12l16 0');
            paths[3].setAttribute('d', 'M4 18l16 0');
        }
    });
}

/***********************
 * Initialization
 ***********************/

// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeColorTheme();
    initializeSectionNavigation();
    initializeMobileMenu();
});