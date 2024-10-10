document.addEventListener("DOMContentLoaded", function() {
    const carouselContainers = document.querySelectorAll('.carousel-wrapper');

    carouselContainers.forEach(function(container, index) {
        const carousel = container.querySelector('.carousel');
        const rightArrow = container.querySelector('.right-arrow');
        const leftArrow = container.querySelector('.left-arrow');

        let scrollAmount = 0;
        const scrollStep = carousel.offsetWidth / 4.5; // Ajusta el desplazamiento por paso

        // Ocultamos la flecha izquierda al principio
        leftArrow.style.display = 'none';

        // Evento para mover el carrusel hacia la derecha
        rightArrow.addEventListener('click', function() {
            scrollAmount += scrollStep;
            carousel.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });

            // Mostrar la flecha izquierda
            leftArrow.style.display = 'block';

            // Si llega al final, ocultar la flecha derecha
            if (scrollAmount + carousel.offsetWidth >= carousel.scrollWidth) {
                rightArrow.style.display = 'none';
            }
        });

        // Evento para mover el carrusel hacia la izquierda
        leftArrow.addEventListener('click', function() {
            scrollAmount -= scrollStep;
            carousel.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });

            // Si volvemos al principio, ocultar la flecha izquierda
            if (scrollAmount <= 0) {
                leftArrow.style.display = 'none';
            }

            // Mostrar la flecha derecha cuando nos movemos hacia la izquierda
            rightArrow.style.display = 'block';
        });
    });
});

window.onload = function() {
    // Ocultar el loader
    document.getElementById('loader').style.display = 'none';
    // Mostrar el contenido de la página
    document.getElementById('content').style.display = 'block';
};

// Seleccionamos el botón y el menú
const menuBtn = document.querySelector('.menu-btn');
const submenu = document.getElementById('submenu');

// Evento para mostrar/ocultar el menú al hacer clic
menuBtn.addEventListener('click', () => {
    submenu.classList.toggle('active');
});

// Opcional: Si quieres que al hacer clic fuera del menú se cierre
document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !submenu.contains(e.target)) {
        submenu.classList.remove('active');
    }
});
