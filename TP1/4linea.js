class Casillero {
    constructor() {
        this.estado = null; // Puede ser 'planta', 'zombie' o null
    }

    isEmpty() {
        return this.estado === null;
    }

    colocarFicha(jugador) {
        if (this.isEmpty()) {
            this.estado = jugador;
            return true;
        }
        return false;
    }
}

class Tablero {
    constructor(columnas = 7, filas = 6, lineasSeleccionadas) {
        this.columnas = columnas;
        this.filas = filas;
        this.lineasParaGanar = lineasSeleccionadas;
        this.grilla = Array.from({ length: columnas }, () => Array.from({ length: filas }, () => new Casillero()));
    }

    getEmptyRowIndex(colIndex) {
        for (let filaIndex = this.filas - 1; filaIndex >= 0; filaIndex--) {
            if (this.grilla[colIndex][filaIndex].isEmpty()) {
                return filaIndex;
            }
        }
        return -1;
    }

    colocarFicha(colIndex, jugador) {
        const filaIndex = this.getEmptyRowIndex(colIndex);
        if (filaIndex !== -1) {
            this.grilla[colIndex][filaIndex].colocarFicha(jugador);
        }
        return filaIndex;
    }

    checkWinner(colIndex, filaIndex, jugador) {
        return (
            this.checkDirection(colIndex, filaIndex, 1, 0, jugador) || 
            this.checkDirection(colIndex, filaIndex, 0, 1, jugador) || 
            this.checkDirection(colIndex, filaIndex, 1, 1, jugador) || 
            this.checkDirection(colIndex, filaIndex, 1, -1, jugador)
        );
    }

    checkDirection(colIndex, filaIndex, deltaCol, deltaRow, jugador) {
        let count = 1;
        count += this.countInDirection(colIndex, filaIndex, deltaCol, deltaRow, jugador);
        count += this.countInDirection(colIndex, filaIndex, -deltaCol, -deltaRow, jugador);
        return count >= this.lineasParaGanar; // Usa el número de líneas necesario para ganar
    }

    countInDirection(colIndex, filaIndex, deltaCol, deltaRow, jugador) {
        let count = 0;
        let currentCol = colIndex + deltaCol;
        let currentRow = filaIndex + deltaRow;

        while (
            currentCol >= 0 && currentCol < this.columnas &&
            currentRow >= 0 && currentRow < this.filas &&
            !this.grilla[currentCol][currentRow].isEmpty() &&
            this.grilla[currentCol][currentRow].estado === jugador
        ) {
            count++;
            currentCol += deltaCol;
            currentRow += deltaRow;
        }
        return count;
    }
}

class Ficha {
    constructor(jugador) {
        this.jugador = jugador;
    }

    getColor() {
        return this.jugador === 'planta' ? 'green' : 'red';
    }
}

class Juego {
    constructor(columnas, filas, lineasParaGanar) {
        this.columnas = columnas;
        this.filas = filas;
        this.lineasParaGanar = lineasParaGanar;
        this.tablero = new Tablero(columnas, filas, lineasParaGanar);
        this.jugadorActual = 'planta';
        this.canvas = document.getElementById('tableroCanvas');
        this.context = this.canvas.getContext('2d');

        // Tamaño máximo para mantener el tablero visible
        const maxBoardSize = 500;
        this.cellSize = Math.floor(maxBoardSize / Math.max(this.columnas, this.filas));
        this.updateCanvasSize();

     // Precargar las imágenes de las fichas y el casillero
    this.imgPlanta = new Image();
    this.imgPlanta.src = this.getSelectedImage('planta'); // Obtenemos la imagen seleccionada
    this.imgZombie = new Image();
    this.imgZombie.src = this.getSelectedImage('zombie'); // Obtenemos la imagen seleccionada
     this.imgCasillero = new Image();
     this.imgCasillero.src = './img/casillero.png'; // Ruta de la imagen de casillero

        this.initFichas();
        this.initHints();  // Llama a la función para inicializar los hints
        this.imgCasillero.onload = () => this.drawBoard();

        // Configuración del temporizador (300 segundos)
        this.tiempoRestante = 300;
        this.iniciarTemporizador();

       
    }

    iniciarTemporizador() {
        const timerElement = document.getElementById('tiempo'); // Elemento en HTML para mostrar el tiempo
        timerElement.textContent = `Tiempo restante: ${this.tiempoRestante} segundos`;
    
        this.intervaloTemporizador = setInterval(() => {
            this.tiempoRestante--;
    
            if (this.tiempoRestante <= 0) {
                clearInterval(this.intervaloTemporizador);
                this.mostrarPopover("¡Empate! El tiempo ha terminado.", true);
            }
    
            timerElement.textContent = `Tiempo restante: ${this.tiempoRestante} segundos`;
        }, 1000);
    }

    initHints() {
        const hintsContainer = document.getElementById('hintsContainer');
        hintsContainer.innerHTML = '';  // Limpia hints anteriores
        
        for (let i = 0; i < this.columnas; i++) {
            const hint = document.createElement('div');
            hint.classList.add('hint');
            hint.style.position = 'absolute';
            hint.style.left = `${i * this.cellSize}px`; // Alinear con cada columna
            hint.style.width = `${this.cellSize}px`; // Tamaño acorde a la celda
            hintsContainer.appendChild(hint);
        }
    }
    
    updateCanvasSize() {
        this.canvas.width = this.columnas * this.cellSize;
        this.canvas.height = this.filas * this.cellSize;
    }

    drawBoard() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        for (let col = 0; col < this.columnas; col++) {
            for (let row = 0; row < this.filas; row++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                const casillero = this.tablero.grilla[col][row];
    
                // Dibujar la imagen de casillero (fondo)
                this.context.drawImage(this.imgCasillero, x, y, this.cellSize, this.cellSize);
    
                // Dibujar la ficha si el casillero no está vacío
                if (!casillero.isEmpty()) {
                    const img = casillero.estado === 'planta' ? this.imgPlanta : this.imgZombie;
                    const fichaColor = casillero.estado === 'planta' ? 'green' : 'darkmagenta';
    
                    // Tamaño reducido de la ficha (80% del tamaño del casillero)
                    const fichaSize = this.cellSize * 0.8;
                    const offset = (this.cellSize - fichaSize) / 2; // Centrar la ficha en el casillero
    
                    // Dibujar el círculo de la ficha con borde blanco
                    this.context.beginPath();
                    this.context.arc(
                        x + this.cellSize / 2, // Centro X del círculo
                        y + this.cellSize / 2, // Centro Y del círculo
                        fichaSize / 2,         // Radio del círculo
                        0,
                        Math.PI * 2
                    );
                    this.context.fillStyle = fichaColor;
                    this.context.fill();
                    this.context.lineWidth = 3; // Grosor del borde
                    this.context.strokeStyle = '#FFFFFF'; // Color del borde
                    this.context.stroke();
                    this.context.closePath();
    
                    // Dibujar la imagen dentro del círculo (ajustada al nuevo tamaño)
                    this.context.drawImage(
                        img,
                        x + offset + 5,  // Ajuste para centrar dentro del círculo
                        y + offset + 5,  // Ajuste para centrar dentro del círculo
                        fichaSize - 10,  // Tamaño ajustado para imagen
                        fichaSize - 10   // Tamaño ajustado para imagen
                    );
                }
            }
        }
    }
    

    initFichas() {
        const fichas = document.querySelectorAll('.ficha');
        fichas.forEach(ficha => {
            ficha.addEventListener('dragstart', (event) => {
                if (ficha.dataset.jugador !== this.jugadorActual) {
                    event.preventDefault();
                    return;
                }
                this.fichaActual = new Ficha(ficha.dataset.jugador);
                event.dataTransfer.setData('text/plain', ficha.dataset.jugador);
            });
        });

        this.canvas.addEventListener('drop', (event) => this.handleDrop(event));
        this.canvas.addEventListener('dragover', (event) => event.preventDefault());
    }

    handleDrop(event) {
        event.preventDefault();
    
        const hintsContainer = document.getElementById('hintsContainer');
        const hints = hintsContainer.getElementsByClassName('hint');
    
        let colIndex = -1;
    
        // Verifica si el drop ocurre sobre algún hint
        for (let i = 0; i < hints.length; i++) {
            const hint = hints[i];
            const rect = hint.getBoundingClientRect();
    
            if (event.clientX >= rect.left && event.clientX <= rect.right) {
                colIndex = i;
                break;
            }
        }
    
        // Si la columna es válida, continúa con la animación y la lógica
        if (colIndex !== -1) {
            const filaIndex = this.tablero.getEmptyRowIndex(colIndex);
    
            if (filaIndex !== -1) {
                this.animateDrop(colIndex, filaIndex, this.jugadorActual);
    
                setTimeout(() => {
                    if (this.tablero.checkWinner(colIndex, filaIndex, this.jugadorActual)) {
                        clearInterval(this.intervaloTemporizador); // Detener el temporizador en caso de victoria
                        this.mostrarPopover(`¡El jugador ${this.jugadorActual} gana!`, true);
                    }
    
                    this.jugadorActual = this.jugadorActual === 'planta' ? 'zombie' : 'planta';
                }, (filaIndex + 1) * 100);
            }
        }
    }
    

    animateDrop(colIndex, filaIndex, jugador) {
        let currentRow = 0;
        const img = jugador === 'planta' ? this.imgPlanta : this.imgZombie;
        const fichaColor = jugador === 'planta' ? 'green' : 'darkmagenta';
    
        const interval = setInterval(() => {
            this.drawBoard(); // Redibujar el tablero para limpiar el canvas antes de cada cuadro
    
            // Coordenadas de la ficha
            const x = colIndex * this.cellSize;
            const y = currentRow * this.cellSize;
    
            // Tamaño reducido de la ficha (80% del tamaño del casillero)
            const fichaSize = this.cellSize * 0.8;
            const offset = (this.cellSize - fichaSize) / 2; // Centrar la ficha en el casillero
    
            // Dibujar el círculo con borde blanco
            this.context.beginPath();
            this.context.arc(
                x + this.cellSize / 2, // Centro X del círculo
                y + this.cellSize / 2, // Centro Y del círculo
                fichaSize / 2,         // Radio del círculo
                0,
                Math.PI * 2
            );
            this.context.fillStyle = fichaColor;
            this.context.fill();
            this.context.lineWidth = 3; // Grosor del borde
            this.context.strokeStyle = '#FFFFFF'; // Color del borde
            this.context.stroke();
            this.context.closePath();
    
            // Dibujar la imagen dentro del círculo
            this.context.drawImage(
                img,
                x + offset + 5,  // Ajuste para centrar dentro del círculo
                y + offset + 5,  // Ajuste para centrar dentro del círculo
                fichaSize - 10,  // Tamaño ajustado para imagen
                fichaSize - 10   // Tamaño ajustado para imagen
            );
    
            // Mover la ficha una fila más abajo en la próxima iteración
            currentRow++;
    
            // Detener la animación cuando alcanza la posición final
            if (currentRow > filaIndex) {
                clearInterval(interval);
                this.tablero.colocarFicha(colIndex, jugador); // Colocar la ficha en el tablero
                this.drawBoard(); // Redibujar el tablero con la ficha colocada
            }
        }, 100);
    }
    
    

    mostrarPopover(mensaje, recargar = false) {
        const popover = document.createElement('div');
        popover.classList.add('popover');
        popover.innerHTML = `
            <p>${mensaje}</p>
        `;
        document.body.appendChild(popover);
    
        // Ocultar automáticamente después de 2 segundos
        setTimeout(() => {
            popover.remove();
            if (recargar) location.reload(); // Recargar si es necesario
        }, 3000);
    }
    
    getSelectedImage(tipo) {
        // Usar querySelector para encontrar la imagen seleccionada por tipo (planta o zombie)
        const selected = document.querySelector(`input[name="${tipo}"]:checked`);
        return selected ? `./img/${selected.value}.png` : ''; // Retorna la ruta de la imagen seleccionada
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let juego;

    document.getElementById('iniciarJuego').addEventListener('click', () => {
        const lineasSeleccionadas = parseInt(document.getElementById('lineas').value);
        const [columnas, filas] = {
            4: [7, 6],
            5: [8, 7],
            6: [9, 8],
            7: [10, 9]
        }[lineasSeleccionadas];

        // Crear una nueva instancia del juego
        juego = new Juego(columnas, filas, lineasSeleccionadas);

        // Oculta toda la configuración
        document.getElementById('configuracion').style.display = 'none';

        // Muestra los elementos del juego quitando la clase hidden
        document.getElementById('temporizador').classList.remove('hidden'); // Muestra el temporizador
        document.getElementById('reiniciarJuego').classList.remove('hidden'); // Muestra el botón de reinicio
        document.getElementById('fichasPlanta').classList.remove('hidden'); // Muestra las fichas de planta
        document.getElementById('fichasZombie').classList.remove('hidden'); // Muestra las fichas de zombie
        document.getElementById('hintsContainer').classList.remove('hidden'); // Muestra el contenedor de hints
        document.getElementById('tableroCanvas').classList.remove('hidden'); // Muestra el tablero

        // Oculta el selector de líneas para ganar y el botón para iniciar el juego
        document.getElementById('lineas').style.display = 'none';
        document.getElementById('iniciarJuego').style.display = 'none';

        // Función para cambiar la imagen de fondo de las fichas planta
        function cambiarFondoPlanta() {
            const plantaSeleccionada = document.querySelector('input[name="planta"]:checked');
            const imagenPlanta = plantaSeleccionada ? plantaSeleccionada.nextElementSibling.querySelector('img').src : '/TP1/img/plantaa.png';

            // Cambiar la imagen de fondo de las fichas Planta
            document.querySelectorAll('.ficha.planta').forEach(ficha => {
                ficha.style.backgroundImage = `url('${imagenPlanta}')`;
            });
        }

        // Función para cambiar la imagen de fondo de las fichas zombie
        function cambiarFondoZombie() {
            const zombieSeleccionado = document.querySelector('input[name="zombie"]:checked');
            const imagenZombie = zombieSeleccionado ? zombieSeleccionado.nextElementSibling.querySelector('img').src : '/TP1/img/zombiee.png';

            // Cambiar la imagen de fondo de las fichas Zombie
            document.querySelectorAll('.ficha.zombie').forEach(ficha => {
                ficha.style.backgroundImage = `url('${imagenZombie}')`;
            });
        }

        // Luego aplicamos las nuevas imágenes seleccionadas
        cambiarFondoPlanta();
        cambiarFondoZombie();
    });

    // Agregar funcionalidad al botón de reinicio
    document.getElementById('reiniciarJuego').addEventListener('click', () => {
        // Reinicia la página para restablecer todo el estado
        location.reload();
    });
});
