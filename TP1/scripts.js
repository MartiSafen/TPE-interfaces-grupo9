document.addEventListener('DOMContentLoaded', function() {
    // Capturar el formulario por su clase 'register'
    const form = document.querySelector('.register');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto para evitar que se recargue la página
        
        let button = document.getElementById('btnEnviar');
        
        // Simular que está cargando
        button.textContent = 'Registrando...';
        button.disabled = true; // Deshabilitar el botón mientras simula el registro
        
        // Simular el proceso de registro con un retraso de 3 segundos
        setTimeout(function() {
            // Cambiar el estilo y el texto cuando el registro sea exitoso
            button.textContent = 'Registrado con éxito';
            button.disabled = false; // Volver a habilitar el botón
            
            // Mostrar el mensaje de éxito con una transición más suave
            let successMessage = document.getElementById('successMessage');
            successMessage.classList.add('show'); // Aplicar la clase CSS que activa la animación

            // Después de 3 segundos, redirigir a otra página
            setTimeout(function() {
                window.location.href = "home.html"; // Cambia esto a la URL deseada
            }, 2500); // Redirigir después de 3 segundos de mostrar el mensaje de éxito
        }, 4000); // Simular el proceso de carga durante 4 segundos (ahora es más largo)
    });
})

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.login');
    const successMessage = document.getElementById('successMessage');
    const button = document.querySelector('.btnEnviar');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitar que se recargue la página

        // Simular un inicio de sesión exitoso
        successMessage.style.display = 'block';
        successMessage.style.opacity = '1';
        
        // Cambiar el texto del botón temporalmente
        button.textContent = 'Logeado';
        button.disabled = true;
        
        // Después de 3 segundos, redirigir al home
        setTimeout(function() {
            window.location.href = 'home.html'; // Redirigir al home
        }, 2500);
    });
});




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
    let loaderPercentage = document.getElementById('loader-percentage');
    let progress = 0;
    let duration = 5000; // Duración total de la carga (5 segundos)
    let increment = 100 / (duration / 50); // Incremento en base a la duración y el intervalo
    let elapsed = 0; // Tiempo transcurrido
    
    // Simular el progreso del loader
    let interval = setInterval(function() {
        elapsed += 50; // Aumenta el tiempo transcurrido
        progress = Math.min(100, (elapsed / duration) * 100); // Calcula el progreso como porcentaje
        loaderPercentage.textContent = Math.floor(progress) + '%'; // Mostrar solo valores enteros
        
        if (progress >= 100) {
            clearInterval(interval); // Detener el intervalo cuando llegue a 100%
            // Ocultar el loader y mostrar el contenido después de 5 segundos
            document.getElementById('loader').style.display = 'none';
            document.getElementById('content').style.display = 'block';
        }
    }, 50); // Incrementa cada 50 ms para un total de 100 incrementos en 5 segundos
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


