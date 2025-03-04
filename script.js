/**
 * Color Theme Manager
 * Handles the dynamic color theme changes for the website
 */

// Constants
const DEFAULT_HUE = 90;
const MAX_SATURATION = 1.0;
const MAX_VALUE = 0.9;
const DARKEN_FACTOR = 0.7;

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

/**
 * Updates the theme colors based on the selected hue
 * @param {number} hue - Color hue value (0-360)
 */
function updateThemeColors(hue) {
    const rgb = HSVToRGB(hue, MAX_SATURATION, MAX_VALUE);
    const mainColor = RGBToHex(...rgb);
    const borderColor = darkenColor(mainColor);
    
    document.documentElement.style.setProperty('--theme-color', mainColor);
    document.documentElement.style.setProperty('--theme-border-color', borderColor);
}

/**
 * Initializes the color theme functionality
 */
function initializeColorTheme() {
    const hueSlider = document.getElementById('hueSlider');
    if (!hueSlider) {
        console.error('Hue slider element not found');
        return;
    }

    // Set initial color
    updateThemeColors(DEFAULT_HUE);

    // Add event listener for color changes
    hueSlider.addEventListener('input', (e) => {
        const hue = parseInt(e.target.value);
        updateThemeColors(hue);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeColorTheme);