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
     this.imgCasillero.src = '/TP1/img/casillero.png'; // Ruta de la imagen de casillero

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
                alert("¡Empate! El tiempo ha terminado.");
                setTimeout(() => location.reload(), 2000);
            }

            timerElement.textContent = `Tiempo restante: ${this.tiempoRestante} segundos`;
        }, 1000);
    }

    initHints() {
        const hintsContainer = document.getElementById('hintsContainer');
        hintsContainer.innerHTML = '';  // Limpia hints anteriores
        
        // Ajuste para posicionar hints en columnas del tablero
        for (let i = 0; i < this.columnas; i++) {
            const hint = document.createElement('div');
            hint.classList.add('hint');
    
            // Ajusta la posición de cada hint
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

                // Dibujar la imagen de casillero
                this.context.drawImage(this.imgCasillero, x, y, this.cellSize, this.cellSize);

                // Dibujar la ficha si el casillero no está vacío
                if (!casillero.isEmpty()) {
                    const img = casillero.estado === 'planta' ? this.imgPlanta : this.imgZombie;
                    this.context.drawImage(img, x, y, this.cellSize, this.cellSize);
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
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const colIndex = Math.floor(x / this.cellSize);

        const filaIndex = this.tablero.getEmptyRowIndex(colIndex);
        
        if (filaIndex !== -1) {
            this.animateDrop(colIndex, filaIndex, this.jugadorActual);

            setTimeout(() => {
                if (this.tablero.checkWinner(colIndex, filaIndex, this.jugadorActual)) {
                    clearInterval(this.intervaloTemporizador); // Detener el temporizador en caso de victoria
                    alert(`¡El jugador ${this.jugadorActual} gana!`);
                    setTimeout(() => location.reload(), 2000);
                }
                
                this.jugadorActual = this.jugadorActual === 'planta' ? 'zombie' : 'planta';
            }, (filaIndex + 1) * 100);
        }
    }

    animateDrop(colIndex, filaIndex, jugador) {
        let currentRow = 0;
        const img = jugador === 'planta' ? this.imgPlanta : this.imgZombie;

        const interval = setInterval(() => {
            this.drawBoard();
            
            this.context.drawImage(
                img,
                colIndex * this.cellSize,
                currentRow * this.cellSize,
                this.cellSize,
                this.cellSize
            );

            currentRow++;
            if (currentRow > filaIndex) {
                clearInterval(interval);
                this.tablero.colocarFicha(colIndex, jugador); // Coloca la ficha en el tablero después de la animación
                this.drawBoard(); // Redibuja el tablero
            }
        }, 100);
    }

    getSelectedImage(tipo) {
        // Usar querySelector para encontrar la imagen seleccionada por tipo (planta o zombie)
        const selected = document.querySelector(`input[name="${tipo}"]:checked`);
        return selected ? `/TP1/img/${selected.value}.png` : ''; // Retorna la ruta de la imagen seleccionada
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('iniciarJuego').addEventListener('click', () => {
        const lineasSeleccionadas = parseInt(document.getElementById('lineas').value);
        const [columnas, filas] = {
            4: [7, 6],
            5: [8, 7],
            6: [9, 8],
            7: [10, 9]
        }[lineasSeleccionadas];

        // Crear una nueva instancia del juego
        const juego = new Juego(columnas, filas, lineasSeleccionadas);

        // Oculta toda la configuración
         document.getElementById('configuracion').style.display = 'none'

        // Muestra el temporizador
        const temporizador = document.getElementById('temporizador');
        temporizador.classList.remove('hidden'); // Muestra el temporizador

        // Oculta el selector de líneas para ganar
        document.getElementById('lineas').style.display = 'none'; // Oculta el selector de líneas

        // También oculta el botón para iniciar el juego
        document.getElementById('iniciarJuego').style.display = 'none';
    });
});







