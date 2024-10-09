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
