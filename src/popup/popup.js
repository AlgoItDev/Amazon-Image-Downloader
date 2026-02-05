
document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');
    const gallery = document.getElementById('gallery');
    const imageCount = document.getElementById('imageCount');
    const selectedCountSpan = document.getElementById('selectedCount');
    const selectionControls = document.getElementById('selectionControls');
    const statusMessage = document.getElementById('statusMessage');

    let currentImages = [];
    let selectedImages = new Set();

    // Helper Function Inlined
    function getHighResImageUrl(url) {
        if (!url) return null;
        // Removes patterns like ._AC_SY400_, ._SL1500_, ._SS500_, etc.
        // Replaces ._MODIFIER_.jpg with .jpg
        return url.replace(/\._[a-zA-Z0-9_,]+(_\.|\.)([a-zA-Z]{3,4})$/, '.$2');
    }

    const downloadZipBtn = document.getElementById('downloadZipBtn');

    // ... (existing code) ...

    downloadZipBtn.addEventListener('click', () => {
        // If selections exist, only zip selected. Else zip all.
        const targetImages = selectedImages.size > 0
            ? currentImages.filter(img => selectedImages.has(img.url))
            : currentImages;

        downloadImagesAsZip(targetImages);
    });

    // ... (existing scanForImages) ...

    async function downloadImagesAsZip(images) {
        if (!images || images.length === 0) return;

        showStatus('ZIP dosyası hazırlanıyor... Lütfen bekleyin.');
        downloadZipBtn.disabled = true;

        try {
            const zip = new JSZip();
            const productTitle = (images[0].title || 'Amazon_Images').replace(/[<>:"/\\|?*]+/g, '_').trim();
            const folder = zip.folder(productTitle);

            let processed = 0;
            const promises = images.map(async (img, index) => {
                try {
                    const response = await fetch(img.url);
                    const blob = await response.blob();
                    const filename = img.url.split('/').pop().split('?')[0] || `image_${index}.jpg`;
                    folder.file(filename, blob);
                } catch (err) {
                    console.error('Failed to fetch image for zip:', img.url, err);
                } finally {
                    processed++;
                    showStatus(`Hazırlanıyor... ${processed}/${images.length}`);
                }
            });

            await Promise.all(promises);

            showStatus('ZIP sıkıştırılıyor...');
            const zipBlob = await zip.generateAsync({ type: 'blob' });

            // Trigger download
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${productTitle}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showStatus('ZIP indirildi!');
        } catch (e) {
            showStatus('ZIP hatası: ' + e.message, true);
        } finally {
            downloadZipBtn.disabled = false;
        }
    }

    scanBtn.addEventListener('click', scanForImages);

    downloadAllBtn.addEventListener('click', () => {
        downloadImages(currentImages);
    });

    downloadSelectedBtn.addEventListener('click', () => {
        const imagesToDownload = currentImages.filter(img => selectedImages.has(img.url));
        downloadImages(imagesToDownload);
    });

    async function scanForImages() {
        showStatus('Sayfa taranıyor...');

        gallery.innerHTML = '';
        currentImages = [];
        selectedImages.clear();
        updateUI();

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                showStatus('Aktif sekme bulunamadı.', true);
                return;
            }

            chrome.tabs.sendMessage(tab.id, { action: "getImages" }, (response) => {
                const lastError = chrome.runtime.lastError;
                if (lastError) {
                    console.warn(`Message failed: ${lastError.message}, attempting injection.`);

                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['src/content.js']
                    }, () => {
                        const injectError = chrome.runtime.lastError;
                        if (injectError) {
                            showStatus('Sayfaya bağlanılamadı.', true);
                        } else {
                            setTimeout(() => {
                                chrome.tabs.sendMessage(tab.id, { action: "getImages" }, (resp) => {
                                    if (chrome.runtime.lastError) {
                                        showStatus('Hata: Script yanıt vermiyor.', true);
                                    } else {
                                        handleResponse(resp);
                                    }
                                });
                            }, 500);
                        }
                    });
                    return;
                }

                handleResponse(response);
            });
        } catch (e) {
            showStatus('Hata: ' + e.message, true);
        }
    }

    function handleResponse(response) {
        if (response && response.images && response.images.length > 0) {
            processImages(response.images);
        } else {
            showStatus('Resim bulunamadı.', true);
        }
    }

    function processImages(rawImages) {
        const processed = new Map();

        rawImages.forEach(img => {
            const highResUrl = getHighResImageUrl(img.url) || img.url;
            if (!processed.has(highResUrl)) {
                processed.set(highResUrl, {
                    url: highResUrl,
                    original: img.url,
                    title: img.title
                });
            }
        });

        currentImages = Array.from(processed.values());
        renderGallery();
        showStatus(`Toplam ${currentImages.length} resim bulundu.`);
    }

    function renderGallery() {
        gallery.innerHTML = '';
        if (currentImages.length === 0) {
            gallery.innerHTML = '<div class="empty-state">Resim bulunamadı.</div>';
            return;
        }

        currentImages.forEach(img => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.dataset.url = img.url;

            card.innerHTML = `
                <img src="${img.url}" loading="lazy" alt="${img.title}">
                <div class="image-overlay">
                    <div class="checkbox"></div>
                </div>
            `;

            card.addEventListener('click', () => toggleSelection(img.url, card));
            gallery.appendChild(card);
        });

        updateUI();
    }

    function toggleSelection(url, cardElement) {
        if (selectedImages.has(url)) {
            selectedImages.delete(url);
            cardElement.classList.remove('selected');
        } else {
            selectedImages.add(url);
            cardElement.classList.add('selected');
        }
        updateUI();
    }

    function updateUI() {
        imageCount.textContent = currentImages.length;
        selectedCountSpan.textContent = selectedImages.size;

        downloadAllBtn.disabled = currentImages.length === 0;
        downloadZipBtn.disabled = currentImages.length === 0;

        if (selectedImages.size > 0) {
            selectionControls.classList.remove('hidden');
        } else {
            selectionControls.classList.add('hidden');
        }
    }

    function showStatus(msg, isError = false) {
        statusMessage.textContent = msg;
        statusMessage.className = 'status-message' + (isError ? ' error' : '');
        statusMessage.classList.remove('hidden');
    }

    function downloadImages(images) {
        if (!images || images.length === 0) return;

        showStatus(`${images.length} resim indiriliyor...`);

        chrome.runtime.sendMessage({
            action: "downloadImages",
            images: images
        });
    }
});
