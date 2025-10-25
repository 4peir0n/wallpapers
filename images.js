// ========================================
// CONFIGURACIÓN
// ========================================

const repoOwner = "4peir0n";          // Usuario de GitHub
const repoName = "wallpapers";         // Nombre del repositorio
const branch = "main";                 // Rama del repositorio
const imageDirectory = "images/";      // Directorio de imágenes
const imagesPerPage = 25;              // Imágenes por página

// Caché de imágenes para evitar múltiples llamadas al API
let cachedImages = null;

// ========================================
// FUNCIONES PRINCIPALES
// ========================================

/**
 * Obtiene la lista de imágenes desde el repositorio de GitHub
 * @returns {Promise<Array<string>>} Array de URLs de imágenes
 */
async function fetchImages() {
    // Si ya tenemos las imágenes en caché, retornarlas directamente
    if (cachedImages !== null) {
        console.log(`📦 Loaded ${cachedImages.length} images from cache`);
        return cachedImages;
    }

    let allFiles = [];
    let page = 1;
    const perPage = 100; // Máximo permitido por GitHub API

    try {
        // Obtener todas las páginas de resultados
        while (true) {
            const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imageDirectory}?ref=${branch}&per_page=${perPage}&page=${page}`;
            
            console.log(`🔍 Fetching page ${page}...`);
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                break; // No hay más resultados
            }

            allFiles = allFiles.concat(data);
            
            // Si obtuvimos menos archivos que el máximo, no hay más páginas
            if (data.length < perPage) {
                break;
            }
            
            page++;
        }

        console.log(`✅ Total files found: ${allFiles.length}`);

        // Filtrar archivos, ordenar por nombre y obtener URLs de descarga
        cachedImages = allFiles
            .filter(file => file.type === "file")
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(file => file.download_url);
        
        console.log(`🖼️ Total images to display: ${cachedImages.length}`);
        return cachedImages;
    } catch (error) {
        console.error("❌ Error fetching images:", error);
        return [];
    }
}

/**
 * Refresca el caché de imágenes y recarga la galería
 */
async function refreshGallery() {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '<p style="text-align:center; color: var(--accent1); font-size: 1.2rem;"><i class="fas fa-spinner fa-spin"></i> Refreshing images...</p>';
    
    cachedImages = null; // Limpiar caché
    console.log("🔄 Refreshing gallery...");
    await loadGalleryPage(1); // Recargar primera página
}

/**
 * Crea los controles de paginación
 * @param {number} totalImages - Total de imágenes disponibles
 * @param {number} currentPage - Página actual
 */
function createPagination(totalImages, currentPage) {
    const totalPages = Math.ceil(totalImages / imagesPerPage);
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    // Botón "Anterior" (solo si no estamos en la primera página)
    if (currentPage > 1) {
        const prevButton = document.createElement('a');
        prevButton.href = '#';
        prevButton.textContent = '← Prev';
        prevButton.onclick = (e) => {
            e.preventDefault();
            loadGalleryPage(currentPage - 1);
        };
        pagination.appendChild(prevButton);
    }

    // Números de página (muestra primera, última y páginas cercanas)
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            if (i === currentPage) pageLink.classList.add('active');
            pageLink.onclick = (e) => {
                e.preventDefault();
                loadGalleryPage(i);
            };
            pagination.appendChild(pageLink);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            // Puntos suspensivos para páginas ocultas
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
    }

    // Botón "Siguiente" (solo si no estamos en la última página)
    if (currentPage < totalPages) {
        const nextButton = document.createElement('a');
        nextButton.href = '#';
        nextButton.textContent = 'Next →';
        nextButton.onclick = (e) => {
            e.preventDefault();
            loadGalleryPage(currentPage + 1);
        };
        pagination.appendChild(nextButton);
    }
}

/**
 * Carga y muestra las imágenes de una página específica
 * @param {number} page - Número de página a cargar (por defecto 1)
 */
async function loadGalleryPage(page = 1) {
    const gallery = document.querySelector('.gallery');
    const images = await fetchImages();

    // Mostrar mensaje si no hay imágenes
    if (images.length === 0) {
        gallery.innerHTML = "<p style='text-align:center;'>No images found.</p>";
        return;
    }

    // Calcular índices para la paginación
    const startIndex = (page - 1) * imagesPerPage;
    const endIndex = Math.min(startIndex + imagesPerPage, images.length);
    const pageImages = images.slice(startIndex, endIndex);

    // Limpiar galería antes de cargar nuevas imágenes
    gallery.innerHTML = '';

    // Crear tarjetas para cada imagen
    pageImages.forEach((imageUrl, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `
            <a href="${imageUrl}" target="_blank">
                <img src="${imageUrl}" alt="Wallpaper ${startIndex + index + 1}" loading="eager">
                <div class="gallery-item-info">
                    <span class="gallery-item-title">#${startIndex + index + 1}</span>
                    <i class="fas fa-download download-icon"></i>
                </div>
            </a>
        `;
        gallery.appendChild(div);
    });

    // Actualizar controles de paginación
    createPagination(images.length, page);
}

// ========================================
// INICIALIZACIÓN
// ========================================

// Cargar la primera página cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    loadGalleryPage(1);
    
    // Agregar botón de refresh si existe en el HTML
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshGallery);
    }
});
