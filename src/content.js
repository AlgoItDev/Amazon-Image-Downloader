/**
 * Amazon Image Downloader - Content Script
 * Scrapes product images from the current page.
 */

// Avoid re-injection issues or running in iframes if not desired
if (window === window.top) {
    // We cannot easily remove authorized anonymous listeners, so we might stack them if injected multiple times.
    // For now, this is acceptable to ensure at least one works.
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "getImages") {
            try {
                const images = scrapeImages();
                sendResponse({ images: images });
            } catch (e) {
                console.error('[Amazon Image Downloader] Scrape failed:', e);
                sendResponse({ images: [] });
            }
        }
        return true;
    });
}

/**
 * Scrapes images from known Amazon product page elements.
 * @returns {Array} List of image objects { url, title, type }
 */
function scrapeImages() {
    const images = new Set();
    const result = [];
    const productTitle = document.getElementById('productTitle')?.innerText.trim() || 'Amazon Product';

    // Helper to add unique images
    const addImage = (url, type) => {
        if (url && !images.has(url)) {
            images.add(url);
            result.push({
                url: url,
                title: productTitle,
                type: type
            });
        }
    };

    // 1. Main Landing Image
    const landingImage = document.getElementById('landingImage');
    if (landingImage) {
        addImage(landingImage.getAttribute('src'), 'Main Image');
        // Check for data-a-dynamic-image for high res candidates
        try {
            const dynamic = landingImage.getAttribute('data-a-dynamic-image');
            if (dynamic) {
                const data = JSON.parse(dynamic);
                Object.keys(data).forEach(k => addImage(k, 'Main Image HighRes'));
            }
        } catch (e) {
            // silent fail
        }
    }

    // 2. Alt Images Block
    const altImages = document.querySelectorAll('#altImages img');
    altImages.forEach(img => {
        addImage(img.getAttribute('src'), 'Gallery Image');
    });

    // 3. Generic Fallback: Scan all images on the page
    // We filter small icons and UI elements
    document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        const width = img.naturalWidth || img.width || 0;
        const height = img.naturalHeight || img.height || 0;

        // Filter out small images (likely icons or UI elements)
        // Keep if at least one dimension is decent size
        if (src && (width > 200 || height > 200)) {
            // Avoid duplicates already added
            if (!images.has(src)) {
                addImage(src, 'Page Image');
            }
        }
    });

    return result;
}
