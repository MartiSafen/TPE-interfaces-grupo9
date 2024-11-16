"use strict"

const munequitos = document.getElementById('munequitos');

document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;

    // Calcula la dirección opuesta al cursor
    const offsetX = (window.innerWidth / 2 - mouseX) / 10;

    // Aplica el desplazamiento a la imagen
    munequitos.style.transform = `translate(${offsetX}px)`;
})

function checkScrollForCardsAnimation(y) {
    let cards = document.querySelectorAll('.multimedia_container');

    if (y >= 1300 && y < 2300) {
        cards.forEach(card => {
            card.classList.add('float-animation');
            card.classList.remove('disappear-animation')
        })
    } else if (y >= 2300) {
        cards.forEach(card => {
            card.classList.remove('float-animation')
            card.classList.add('disappear-animation');
        })
    }
}

window.addEventListener("scroll", getScroll)

function getScroll() {
    const y = this.pageYOffset

    checkScrollForCardsAnimation(y)

    moveLogo(y)

    parallaxEffect(y)

    disappearShadows(y)
}

function disappearShadows(y) {
    const shadows = document.querySelectorAll(".shadow")
    const maxY = 600

    const shadowAlpha = Math.max(0, 0.4 - (Math.min(y, maxY) / maxY) * 0.4)

    shadows.forEach(shadow => {
        shadow.style.background = `rgba(68, 104, 63, ${shadowAlpha})`
        shadow.style.boxShadow = `0 0 10px 10px rgba(68, 104, 63, ${shadowAlpha})`
    })
}

function parallaxEffect(y) {
    const parallaxItem = document.querySelectorAll(".parallax")

    for (const item of parallaxItem) {
        let speed = item.getAttribute("data-speed")
        let initialTop = item.getAttribute("data-initial-top")
        item.style.top = initialTop - y * speed + "px"
    }
}

function moveLogo(y) {
    const logo = document.querySelector(".logo_img")
    const header = document.querySelector("#header")

    let newWidth = 550 - y * 0.5
    let newTransform = 110 - y * 0.2
    let newGradient = y * 0.1

    if (newWidth > 150) {
        logo.style.width = newWidth + "px"
    } else {
        logo.style.width = "150px"
    }

    if (newTransform > 0) {
        logo.style.transform = "translateY(" + newTransform + "px)"
    } else {
        logo.style.transform = "translateY(0px)"
    }

    if (newGradient < 100) {
        header.style.background = "linear-gradient(180deg, #00D1D5 " + newGradient + "%, rgba(0, 209, 213, 0.12) 87.91%, rgba(1, 208, 213, 0) 100%)"
    } else {
        header.style.background = "#00D1D5"
    }

}

let interval = setInterval(changeImage, 3000)
let repetition = 1

/*function changeImage() {
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
}*/