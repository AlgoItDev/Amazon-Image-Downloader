/**
 * Utility functions for handling Amazon image URLs.
 */

/**
 * Converts a thumbnail or resized Amazon image URL to its high-resolution version.
 * Removes the resolution/formatting flags (e.g., _AC_SY879_, _SL1500_) from the URL.
 * 
 * Example:
 * Input: https://m.media-amazon.com/images/I/71s7D+-sPBL._AC_SL1500_.jpg
 * Output: https://m.media-amazon.com/images/I/71s7D+-sPBL.jpg
 * 
 * @param {string} url - The original image URL.
 * @returns {string} - The high-resolution image URL.
 */
export function getHighResImageUrl(url) {
    if (!url) return null;

    // Regex to match the typical Amazon image modifier pattern before the extension
    // Matches patterns starting with ._ and ending with _ right before the file extension
    // e.g., ._AC_SL1500_ in filename._AC_SL1500_.jpg
    // Also handles simpler codes like ._SY88

    // Strategy: Look for the last dot that introduces the extension, 
    // and check if there is a modification pattern before it.

    // Common patterns:
    // ._AC_SL1500_
    // ._SX679_
    // ._SY450_
    // ._CR0,0,1200,628_SX920_GW_

    // We want to remove everything from the dot starting the pattern up to the dot of the extension.

    return url.replace(/\._[A-Z]{2,}.*?(\.[a-zA-Z]{3,4})$/, '$1');
}

/**
 * Validates if the given string is a valid URL.
 * @param {string} string - The URL string to test.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

export {
    getHighResImageUrl,
    isValidUrl
};

