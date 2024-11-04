

// El resto del código permanece igual

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

        const maxBoardSize = 500;
        this.cellSize = Math.floor(maxBoardSize / Math.max(this.columnas, this.filas));
        this.updateCanvasSize();

        this.imgPlanta = new Image();
        this.imgPlanta.src = this.getSelectedImage('planta'); // Cargar imagen seleccionada para planta
        this.imgZombie = new Image();
        this.imgZombie.src = this.getSelectedImage('zombie'); // Cargar imagen seleccionada para zombie
    
        // Asegúrate de que las imágenes se carguen antes de dibujar el tablero
        this.imgPlanta.onload = () => this.drawBoard();
        this.imgZombie.onload = () => this.drawBoard();

        this.imgCasillero = new Image();
        this.imgCasillero.src = '/TP1/img/casillero.png';  // Imagen de casillero

      
        this.initFichas();
        this.imgCasillero.onload = () => this.drawBoard();
        this.initHints();

        this.tiempoRestante = 300;
        this.iniciarTemporizador();

        // Escuchar cambios en la selección de imágenes
        this.initImageSelectionListeners();
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

                this.context.drawImage(this.imgCasillero, x, y, this.cellSize, this.cellSize);
                if (!casillero.isEmpty()) {
                    const img = casillero.estado === 'planta' ? this.imgPlanta : this.imgZombie;
                    this.context.drawImage(img, x, y, this.cellSize, this.cellSize);
                }
            }
        }
        this.drawDropZones();  // Dibuja las zonas de drop en la parte superior
    }

    drawDropZones() {
        this.context.fillStyle = 'rgba(255, 245, 11, 0.5)';  // Color semitransparente para la zona dropeable
        for (let col = 0; col < this.columnas; col++) {
            const x = col * this.cellSize;
            this.context.fillRect(x, 0, this.cellSize, this.cellSize * 0.5);  // Zona dropeable de media celda de altura
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
        
        for (let i = 0; i < this.columnas; i++) {
            const hint = document.createElement('div');
            hint.classList.add('hint');
            hint.style.position = 'absolute';
            hint.style.left = `${i * this.cellSize}px`; // Alinear con cada columna
            hint.style.width = `${this.cellSize}px`; // Tamaño acorde a la celda
            hintsContainer.appendChild(hint);
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    
        // Validar que la ficha se suelta dentro de la zona dropeable (media celda de altura)
        if (y > this.cellSize * 0.5) return;
    
        const colIndex = Math.floor(x / this.cellSize);
        const filaIndex = this.tablero.getEmptyRowIndex(colIndex);
    
        if (filaIndex !== -1) {
            this.animateDrop(colIndex, filaIndex, this.jugadorActual);
    
            // Eliminar la ficha soltada de la columna de fichas
            const fichaContainer = document.getElementById(`fichas${this.jugadorActual.charAt(0).toUpperCase() + this.jugadorActual.slice(1)}`);
            if (fichaContainer.children.length > 0) {
                fichaContainer.removeChild(fichaContainer.lastChild);  // Elimina la última ficha
            }
    
            setTimeout(() => {
                if (this.tablero.checkWinner(colIndex, filaIndex, this.jugadorActual)) {
                    clearInterval(this.intervaloTemporizador);
                    alert(`¡El jugador ${this.jugadorActual} gana!`);
                    setTimeout(() => location.reload(), 2000);
                }
    
                // Cambia el turno
                this.jugadorActual = this.jugadorActual === 'planta' ? 'zombie' : 'planta';
                
                // Actualiza los hints después de cambiar de jugador
                this.initHints(); // Llama a initHints para actualizar los hints
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
                this.tablero.colocarFicha(colIndex, jugador);
                this.drawBoard();
            }
        }, 100);
    }

    
    getSelectedImage(tipo) {
        const selected = document.querySelector(`input[name="${tipo}"]:checked`);
        // Ajusta el retorno para los nombres de archivo correctos
        return selected ? `/TP1/img/${selected.value}` : '';
    }

    initImageSelectionListeners() {
        const plantas = document.querySelectorAll('input[name="planta"]');
        const zombies = document.querySelectorAll('input[name="zombie"]');
    
        const updateFichaImages = () => {
            this.imgPlanta.src = this.getSelectedImage('planta'); // Cambiar 'tipo' a 'planta'
            this.imgZombie.src = this.getSelectedImage('zombie'); // Cambiar 'tipo' a 'zombie'
        };
    
        plantas.forEach(input => {
            input.addEventListener('change', updateFichaImages);
        });
    
        zombies.forEach(input => {
            input.addEventListener('change', updateFichaImages);
        });
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

        // Ocultar configuraciones y mostrar contenedores de juego
        document.getElementById('configuracion').style.display = 'none';
        document.getElementById('juegoContainer').style.display = 'flex';

        // Cargar fichas seleccionadas por el usuario
        cargarFichas('planta', columnas * filas); // Pasa el total de casilleros
        cargarFichas('zombie', columnas * filas); // Pasa el total de casilleros

        // Muestra el temporizador
        document.getElementById('temporizador').classList.remove('hidden');
    });
});

function cargarFichas(tipo, total) {
    const contenedorFichas = document.getElementById(`fichas${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    for (let i = 0; i < total; i++) {
        const ficha = document.createElement('div');
        ficha.classList.add('ficha');
        ficha.dataset.jugador = tipo;
        ficha.draggable = true;

        const img = document.createElement('img');
        img.src = `/TP1/img/${tipo}.png`;  // Ajusta la ruta según sea necesario
       

        ficha.appendChild(img);
        contenedorFichas.appendChild(ficha);
    }
}



