"use strict"
showLoader();


//Muestra el loader
function showLoader() {
    let loader_container = document.querySelector('.loader_container');
    loader_container.classList.remove('nav_display');
    loader_container.classList.add('showLoader');

    const loading = setInterval(() => { }, 50)

    setTimeout(() => {
        clearInterval(loading)
        loader_container.classList.add("nav_display")
        loader_container.classList.remove('showLoader')
    }, 5000)
}

window.addEventListener("scroll", getScroll)
window.addEventListener('mousemove', getMouseMove)

// Función que se llama al mover el mouse, se encarga de llamar a otras funciones
function getMouseMove(e) {
    const mouseX = e.clientX
    const mouseY = e.clientY

    charactersMove(mouseX, mouseY)
    move3dModel(mouseX)
}

// Mueve los personajes de la sección "Descubre el juego que convierte
// las Matemáticas en diversión" de acuerdo a la posición del mouse
function charactersMove(mouseX, mouseY) {
    const characters = document.getElementById('munequitos');

    // Calcula la dirección opuesta al cursor
    const offsetX = (window.innerWidth / 2 - mouseX) / 10;
    const offsetY = (window.innerWidth / 2 - mouseY) / 10;

    // Aplica el desplazamiento a la imagen
    characters.style.transform = `translate(${offsetX}px,${offsetY}px)`;
}

// Mueve el modelo 3d de acuerdo a la posición del mouse
function move3dModel(mouseX) {
    const maxY = window.innerWidth
    const angle = Math.max(0, 360 - (Math.min(mouseX, maxY) / maxY) * 360)
    const character3d = document.querySelector("#character1_3d")
    character3d.setAttribute("camera-orbit", angle + "deg 80deg")
}

// Activa la animación de las cards de la sección "La app más divertida y educativa
// y para niños de 3 años"
function checkScrollForCardsAnimation(y) {
    let cards = document.querySelectorAll('.multimedia_container');

    if (y >= 1300) {
        cards.forEach(card => {
            card.classList.add('float-animation');
        })
    } else {
        cards.forEach(card => {
            card.classList.remove('float-animation');
        })
    }
}

// Función que se llama al scrollear, se encarga de llamar a otras funciones
function getScroll() {
    const y = this.pageYOffset

    checkScrollForCardsAnimation(y)

    moveLogo(y)

    parallaxEffect(y)

    disappearShadows(y)

    moveImages(y)

    if (y >= 10800) {
        document.querySelector(".container_video").style.animation = "transformUnset 2s ease-in-out both"
        document.querySelector(".character_video").style.animation = "transformUnset 1s ease-in-out both"
    }
}

// Desaparece las sombras de los personajes de acuerdo al scroll
function disappearShadows(y) {
    const shadows = document.querySelectorAll(".shadow")
    const maxY = 600

    const shadowAlpha = Math.max(0, 0.4 - (Math.min(y, maxY) / maxY) * 0.4)

    shadows.forEach(shadow => {
        shadow.style.background = `rgba(68, 104, 63, ${shadowAlpha})`
        shadow.style.boxShadow = `0 0 10px 10px rgba(68, 104, 63, ${shadowAlpha})`
    })
}

// Hace el efecto parallax de la sección "La app más divertida y educativa
// y para niños de 3 años" de acuerdo al scroll
function parallaxEffect(y) {
    const parallaxItem = document.querySelectorAll(".parallax")

    for (const item of parallaxItem) {
        let speed = item.getAttribute("data-speed")
        let initialTop = item.getAttribute("data-initial-top")
        item.style.top = initialTop - y * speed + "px"
    }
}

function moveLogo(y) {
    const logo = document.querySelector(".logo");
    const header = document.querySelector("#header");

    // Reducir menos el ancho (factor ajustado a 0.3 en lugar de 0.5)
    let newWidth = 550 - y * 0.3;
    let newHeight = (newWidth / 550) * 320; // Mantener la proporción original

    // Aumentar los valores mínimos
    const minWidth = 200; // Nuevo mínimo más grande
    const minHeight = (minWidth / 550) * 320; // Altura proporcional al mínimo

    if (newWidth > minWidth) {
        logo.style.width = newWidth + "px";
        logo.style.height = newHeight + "px"; // Ajustar altura proporcionalmente
    } else {
        logo.style.width = minWidth + "px";
        logo.style.height = minHeight + "px"; // Proporción mínima
    }

    let newTransform = 110 - y * 0.2;
    if (newTransform > 0) {
        logo.style.transform = "translateY(" + newTransform + "px)";
    } else {
        logo.style.transform = "translateY(0px)";
    }

    let newGradient = y * 0.1;
    if (newGradient < 100) {
        header.style.background = `linear-gradient(180deg, #00D1D5 ${newGradient}%, rgba(0, 209, 213, 0.12) 87.91%, rgba(1, 208, 213, 0) 100%)`;
    } else {
        header.style.background = "#00D1D5";
    }
}


let interval = setInterval(changeImage, 3000)
let repetition = 1

// Cambia las imágenes de la sección "La app más divertida y educativa y para niños de 
// 3 años" cada 3 segundos
function changeImage() {
    let imgs = document.querySelectorAll(".app_example")

    for (let i = 0; i < imgs.length; i++) {
        let img = imgs[i]
        img.style.transform = "translateX(" + -548.38 * repetition + "px)"
    }

    if (repetition < imgs.length - 1) {
        repetition++
    } else {
        repetition = 0
    }
}

const btn_menu = document.getElementById('btn_menu');

// Se encarga de mostrar el menú al clickear el botón de menú hamburguesa
btn_menu.addEventListener('click', () => {
    let nav = document.getElementById('nav');
    if (nav.classList.contains('nav_display')) {
        nav.classList.remove('nav_display');
        nav.classList.add('visible');
        lin1.classList.add('active');
        lin2.classList.add('active');
        lin3.classList.add('active');
    } else {
        nav.classList.add('nav_display');
        lin1.classList.remove('active');
        lin2.classList.remove('active');
        lin3.classList.remove('active');
        nav.classList.remove('visible');
    }
})

// Evita que se recargue la página al clickear el botón del form
let btn_form = document.getElementById('btn_form');
btn_form.addEventListener('click', (e) => {
    e.preventDefault();
})

// Se encarga de mover las imágenes de la sección "Más amigos, más diversión!"
function moveImages(y) {
    if (y >= 4103 && y < 10144) {
        let n = Math.floor((y - 3783) / 600)

        let images = document.querySelectorAll('.images_character')

        for (let index = 0; index < images.length; index++) {
            if (index != n) {
                images[index].style.transform = "translateX(-200%)"
            } else {
                images[index].style.transform = "unset"
                images[index].style.top = y - 4150 + "px"
            }
        }
    }
}