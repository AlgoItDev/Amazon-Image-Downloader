/**
 * Background Service Worker
 * Handles file downloads and extension events.
 */

chrome.runtime.onInstalled.addListener(() => {
    console.log('Amazon Image Downloader installed.');
});

// Handle messages if needed (e.g., download requests from content script directly, though popup usually handles this)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadImages") {
        downloadImages(request.images);
    }
});

/**
 * Downloads a list of images.
 * @param {Array} images - Array of { url, filename } objects.
 */
function downloadImages(images) {
    images.forEach((img, index) => {
        // Sanitize product title for use as folder name
        const cleanTitle = (img.title || 'Amazon_Product').replace(/[<>:"/\\|?*]+/g, '_').trim();
        const filename = img.url.split('/').pop().split('?')[0] || `image_${index}.jpg`;

        chrome.downloads.download({
            url: img.url,
            // Create a subfolder with the product name
            filename: `AmazonDownloads/${cleanTitle}/${filename}`,
            conflictAction: 'uniquify',
            saveAs: false
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error(`Download failed for ${img.url}:`, chrome.runtime.lastError);
            }
        });
    });
}
