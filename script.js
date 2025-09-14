// Variables globales
let uploadedPhotos = [];
let currentAlbum = null;

// Éléments DOM
const elements = {
    // Pages
    pageUpload: document.getElementById('page-upload'),
    pageOrganize: document.getElementById('page-organize'),
    pageAlbum: document.getElementById('page-album'),
    
    // Upload
    uploadArea: document.getElementById('upload-area'),
    photoInput: document.getElementById('photo-input'),
    photoPreview: document.getElementById('photo-preview'),
    clearPhotos: document.getElementById('clear-photos'),
    nextToOrganize: document.getElementById('next-to-organize'),
    
    // Organize
    albumTitle: document.getElementById('album-title'),
    albumDescription: document.getElementById('album-description'),
    photoGrid: document.getElementById('photo-grid'),
    backToUpload: document.getElementById('back-to-upload'),
    createAlbum: document.getElementById('create-album'),
    
    // Album
    finalAlbumTitle: document.getElementById('final-album-title'),
    finalAlbumDescription: document.getElementById('final-album-description'),
    photoCount: document.getElementById('photo-count'),
    creationDate: document.getElementById('creation-date'),
    albumGrid: document.getElementById('album-grid'),
    downloadPdf: document.getElementById('download-pdf'),
    shareAlbum: document.getElementById('share-album'),
    newAlbum: document.getElementById('new-album'),
    
    // Modal
    shareModal: document.getElementById('share-modal'),
    closeShareModal: document.getElementById('close-share-modal'),
    shareLink: document.getElementById('share-link'),
    copyLink: document.getElementById('copy-link'),
    
    // Loading
    loadingOverlay: document.getElementById('loading-overlay')
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    console.log('SamTheHermit Photo Album initialized');
});

// Event Listeners
function initializeEventListeners() {
    // Upload events
    elements.uploadArea.addEventListener('click', () => elements.photoInput.click());
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    elements.photoInput.addEventListener('change', handleFileSelect);
    elements.clearPhotos.addEventListener('click', clearAllPhotos);
    elements.nextToOrganize.addEventListener('click', goToOrganizePage);
    
    // Organize events
    elements.backToUpload.addEventListener('click', goToUploadPage);
    elements.createAlbum.addEventListener('click', createAlbum);
    
    // Album events
    elements.downloadPdf.addEventListener('click', downloadPDF);
    elements.shareAlbum.addEventListener('click', shareAlbum);
    elements.newAlbum.addEventListener('click', startNewAlbum);
    
    // Modal events
    elements.closeShareModal.addEventListener('click', closeShareModal);
    elements.copyLink.addEventListener('click', copyShareLink);
    elements.shareModal.addEventListener('click', (e) => {
        if (e.target === elements.shareModal) closeShareModal();
    });
    
    console.log('Event listeners initialized');
}

// Upload Functions
function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function processFiles(files) {
    console.log(`Processing ${files.length} files`);
    showLoading();
    
    const validFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
        
        if (!isImage) {
            console.warn(`File ${file.name} is not an image`);
            return false;
        }
        if (!isValidSize) {
            console.warn(`File ${file.name} is too large`);
            return false;
        }
        return true;
    });
    
    if (validFiles.length === 0) {
        hideLoading();
        alert('Aucun fichier image valide sélectionné. Veuillez choisir des images (JPG, PNG, GIF) de moins de 10MB.');
        return;
    }
    
    let processedCount = 0;
    
    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photo = {
                id: Date.now() + Math.random(),
                name: file.name,
                data: e.target.result,
                file: file
            };
            
            uploadedPhotos.push(photo);
            processedCount++;
            
            if (processedCount === validFiles.length) {
                updatePhotoPreview();
                updateUploadButtons();
                hideLoading();
                console.log(`Successfully processed ${processedCount} photos`);
            }
        };
        reader.readAsDataURL(file);
    });
}

function updatePhotoPreview() {
    elements.photoPreview.innerHTML = '';
    
    uploadedPhotos.forEach(photo => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="${photo.data}" alt="${photo.name}">
            <button class="photo-remove" onclick="removePhoto('${photo.id}')">×</button>
        `;
        elements.photoPreview.appendChild(photoItem);
    });
}

function removePhoto(photoId) {
    uploadedPhotos = uploadedPhotos.filter(photo => photo.id != photoId);
    updatePhotoPreview();
    updateUploadButtons();
    console.log(`Removed photo ${photoId}`);
}

function clearAllPhotos() {
    uploadedPhotos = [];
    updatePhotoPreview();
    updateUploadButtons();
    elements.photoInput.value = '';
    console.log('Cleared all photos');
}

function updateUploadButtons() {
    const hasPhotos = uploadedPhotos.length > 0;
    elements.clearPhotos.style.display = hasPhotos ? 'inline-block' : 'none';
    elements.nextToOrganize.style.display = hasPhotos ? 'inline-block' : 'none';
    elements.nextToOrganize.textContent = `Organiser l'album (${uploadedPhotos.length} photo${uploadedPhotos.length > 1 ? 's' : ''})`;
}

// Navigation Functions
function showPage(pageToShow) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    pageToShow.classList.add('active');
    console.log(`Switched to page: ${pageToShow.id}`);
}

function goToUploadPage() {
    showPage(elements.pageUpload);
}

function goToOrganizePage() {
    if (uploadedPhotos.length === 0) {
        alert('Veuillez d\'abord ajouter des photos.');
        return;
    }
    
    updatePhotoGrid();
    showPage(elements.pageOrganize);
}

function goToAlbumPage() {
    showPage(elements.pageAlbum);
}

// Organize Functions
function updatePhotoGrid() {
    elements.photoGrid.innerHTML = '';
    
    uploadedPhotos.forEach(photo => {
        const gridPhoto = document.createElement('div');
        gridPhoto.className = 'grid-photo';
        gridPhoto.innerHTML = `
            <img src="${photo.data}" alt="${photo.name}">
        `;
        elements.photoGrid.appendChild(gridPhoto);
    });
}

function createAlbum() {
    if (uploadedPhotos.length === 0) {
        alert('Aucune photo à inclure dans l\'album.');
        return;
    }
    
    showLoading();
    
    // Simulation d'un délai de traitement
    setTimeout(() => {
        const title = elements.albumTitle.value.trim() || 'Mon album photo';
        const description = elements.albumDescription.value.trim();
        
        currentAlbum = {
            id: Date.now(),
            title: title,
            description: description,
            photos: [...uploadedPhotos],
            createdAt: new Date()
        };
        
        displayFinalAlbum();
        goToAlbumPage();
        hideLoading();
        
        console.log('Album created successfully:', currentAlbum);
    }, 1500);
}

function displayFinalAlbum() {
    if (!currentAlbum) return;
    
    elements.finalAlbumTitle.textContent = currentAlbum.title;
    elements.finalAlbumDescription.textContent = currentAlbum.description;
    elements.photoCount.textContent = `${currentAlbum.photos.length} photo${currentAlbum.photos.length > 1 ? 's' : ''}`;
    elements.creationDate.textContent = `Créé le ${currentAlbum.createdAt.toLocaleDateString('fr-FR')}`;
    
    elements.albumGrid.innerHTML = '';
    currentAlbum.photos.forEach(photo => {
        const gridPhoto = document.createElement('div');
        gridPhoto.className = 'grid-photo';
        gridPhoto.innerHTML = `
            <img src="${photo.data}" alt="${photo.name}">
        `;
        elements.albumGrid.appendChild(gridPhoto);
    });
}

// PDF Generation
function downloadPDF() {
    if (!currentAlbum || currentAlbum.photos.length === 0) {
        alert('Aucun album à télécharger.');
        return;
    }
    
    showLoading();
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Page de titre
        pdf.setFontSize(24);
        pdf.text(currentAlbum.title, 20, 30);
        
        if (currentAlbum.description) {
            pdf.setFontSize(12);
            pdf.text(currentAlbum.description, 20, 45);
        }
        
        pdf.setFontSize(10);
        pdf.text(`${currentAlbum.photos.length} photos - Créé le ${currentAlbum.createdAt.toLocaleDateString('fr-FR')}`, 20, 60);
        
        let yPosition = 80;
        let photosPerPage = 0;
        const maxPhotosPerPage = 4;
        
        currentAlbum.photos.forEach((photo, index) => {
            if (photosPerPage >= maxPhotosPerPage) {
                pdf.addPage();
                yPosition = 20;
                photosPerPage = 0;
            }
            
            try {
                // Ajouter l'image au PDF
                pdf.addImage(photo.data, 'JPEG', 20, yPosition, 80, 60);
                pdf.setFontSize(8);
                pdf.text(photo.name, 20, yPosition + 65);
                
                yPosition += 75;
                photosPerPage++;
            } catch (error) {
                console.warn(`Erreur lors de l'ajout de la photo ${photo.name}:`, error);
            }
        });
        
        // Télécharger le PDF
        pdf.save(`${currentAlbum.title}.pdf`);
        
        hideLoading();
        console.log('PDF generated successfully');
        
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
        hideLoading();
    }
}

// Share Functions
function shareAlbum() {
    if (!currentAlbum) {
        alert('Aucun album à partager.');
        return;
    }
    
    // Générer un lien de partage simulé
    const shareUrl = `${window.location.origin}${window.location.pathname}?album=${currentAlbum.id}&share=true`;
    elements.shareLink.value = shareUrl;
    
    elements.shareModal.classList.add('active');
    console.log('Share modal opened');
}

function closeShareModal() {
    elements.shareModal.classList.remove('active');
}

function copyShareLink() {
    elements.shareLink.select();
    elements.shareLink.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        elements.copyLink.textContent = 'Copié !';
        setTimeout(() => {
            elements.copyLink.textContent = 'Copier';
        }, 2000);
        console.log('Share link copied');
    } catch (error) {
        console.error('Erreur lors de la copie:', error);
        alert('Impossible de copier le lien. Veuillez le sélectionner manuellement.');
    }
}

// Utility Functions
function startNewAlbum() {
    if (confirm('Êtes-vous sûr de vouloir créer un nouvel album ? L\'album actuel sera perdu.')) {
        uploadedPhotos = [];
        currentAlbum = null;
        elements.photoInput.value = '';
        elements.albumTitle.value = 'Mon album photo';
        elements.albumDescription.value = '';
        updatePhotoPreview();
        updateUploadButtons();
        goToUploadPage();
        console.log('Started new album');
    }
}

function showLoading() {
    elements.loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    elements.loadingOverlay.style.display = 'none';
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
    hideLoading();
});

// Gestion des URLs de partage
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('share') === 'true') {
        // Ici vous pourriez charger un album partagé depuis une base de données
        console.log('Album partagé détecté:', urlParams.get('album'));
    }
});

console.log('SamTheHermit Photo Album script loaded successfully');