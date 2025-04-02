const repoOwner = "4peir0n";
const repoName = "wallpapers";
const branch = "main";
const imageDirectory = "images/";
const imagesPerRow = 4; // 4 imágenes por fila
const rowsPerPage = 7; // 7 filas por página (28 imágenes totales, cubriendo las 25 requeridas)
const imagesPerPage = 25; // Exactamente 25 imágenes por página

async function fetchImages() {
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imageDirectory}?ref=${branch}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Error: No se pudo obtener la lista de imágenes.");
            return [];
        }

        // Ordenar las imágenes por nombre
        return data
            .filter(file => file.type === "file")
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(file => file.download_url);
    } catch (error) {
        console.error("Error al obtener imágenes:", error);
        return [];
    }
}

function createPagination(totalImages, currentPage) {
    const totalPages = Math.ceil(totalImages / imagesPerPage);
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    // Botón anterior
    if (currentPage > 1) {
        const prevButton = document.createElement('a');
        prevButton.href = '#';
        prevButton.textContent = 'Anterior';
        prevButton.onclick = (e) => {
            e.preventDefault();
            loadGalleryPage(currentPage - 1);
        };
        pagination.appendChild(prevButton);
    }

    // Páginas
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            if (i === currentPage) {
                pageLink.classList.add('active');
            }
            pageLink.onclick = (e) => {
                e.preventDefault();
                loadGalleryPage(i);
            };
            pagination.appendChild(pageLink);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
    }

    // Botón siguiente
    if (currentPage < totalPages) {
        const nextButton = document.createElement('a');
        nextButton.href = '#';
        nextButton.textContent = 'Siguiente';
        nextButton.onclick = (e) => {
            e.preventDefault();
            loadGalleryPage(currentPage + 1);
        };
        pagination.appendChild(nextButton);
    }
}

async function loadGalleryPage(page = 1) {
    const gallery = document.querySelector('.gallery');
    const images = await fetchImages();

    if (images.length === 0) {
        gallery.innerHTML = "<p style='text-align:center;'>No se encontraron imágenes.</p>";
        return;
    }

    // Calcular el rango de imágenes para la página actual
    const startIndex = (page - 1) * imagesPerPage;
    const endIndex = Math.min(startIndex + imagesPerPage, images.length);
    const pageImages = images.slice(startIndex, endIndex);

    // Limpiar la galería
    gallery.innerHTML = '';

    // Agregar las imágenes de la página actual
    pageImages.forEach((imageUrl, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `
            <a href="${imageUrl}" target="_blank">
                <img src="${imageUrl}" alt="Wallpaper ${startIndex + index + 1}" loading="lazy">
                <div class="gallery-item-info">
                    <span class="gallery-item-title">Wallpaper ${startIndex + index + 1}</span>
                    <i class="fas fa-download download-icon"></i>
                </div>
            </a>
        `;
        gallery.appendChild(div);
    });

    // Actualizar la paginación
    createPagination(images.length, page);
}

document.addEventListener('DOMContentLoaded', () => loadGalleryPage(1));
