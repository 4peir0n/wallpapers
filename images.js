const repoOwner = "4peir0n"; // Reemplaza con tu usuario de GitHub
const repoName = "wallpapers"; // Reemplaza con el nombre de tu repositorio
const branch = "main"; // Cambia si usas otra rama
const imageDirectory = "images/";

async function fetchImages() {
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imageDirectory}?ref=${branch}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Error: No se pudo obtener la lista de imágenes.");
            return [];
        }

        return data
            .filter(file => file.type === "file")
            .map(file => file.download_url); // Extrae las URLs de las imágenes
    } catch (error) {
        console.error("Error al obtener imágenes:", error);
        return [];
    }
}

async function loadGallery() {
    const gallery = document.querySelector('.gallery');
    const images = await fetchImages();

    if (images.length === 0) {
        gallery.innerHTML = "<p style='text-align:center;'>No se encontraron imágenes.</p>";
        return;
    }

    images.forEach((imageUrl, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `
            <a href="${imageUrl}" target="_blank">
                <img src="${imageUrl}" alt="Wallpaper ${index + 1}" loading="lazy">
                <div class="gallery-item-info">
                    <span class="gallery-item-title">Wallpaper ${index + 1}</span>
                    <i class="fas fa-download download-icon"></i>
                </div>
            </a>
        `;
        gallery.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', loadGallery);
