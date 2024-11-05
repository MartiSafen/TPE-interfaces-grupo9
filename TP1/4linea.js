

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

        // Cargar imágenes de fichas y casilleros
        this.imgPlanta = new Image();
        this.imgPlanta.src = this.getSelectedImage('planta');
        this.imgZombie = new Image();
        this.imgZombie.src = this.getSelectedImage('zombie');
        this.imgCasillero = new Image();
        this.imgCasillero.src = '/TP1/img/casillero.png';

        this.initFichas();
        this.imgCasillero.onload = () => this.drawBoard();
        this.initHints();

        // Calcular la cantidad total de casilleros
        const totalCasilleros = this.columnas * this.filas;

        // Cargar fichas para ambos jugadores
        this.cargarFichas('planta', totalCasilleros);
        this.cargarFichas('zombie', totalCasilleros);

        this.tiempoRestante = 300;
        this.iniciarTemporizador();
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
    
            // No eliminar la última ficha de la columna del otro jugador
            const fichaContainer = document.getElementById(`fichas${this.jugadorActual.charAt(0).toUpperCase() + this.jugadorActual.slice(1)}`);
            
            // Solo eliminar ficha si hay una disponible
            if (fichaContainer.children.length > 0) {
                fichaContainer.removeChild(fichaContainer.lastChild); // Elimina la última ficha del jugador actual
            }
    
            setTimeout(() => {
                if (this.tablero.checkWinner(colIndex, filaIndex, this.jugadorActual)) {
                    clearInterval(this.intervaloTemporizador);
                    alert(`¡El jugador ${this.jugadorActual} gana!`);
                    setTimeout(() => location.reload(), 2000);
                }
    
                // Cambia el turno
                this.jugadorActual = this.jugadorActual === 'planta' ? 'zombie' : 'planta';
    
                // Cargar otra ficha para el jugador actual
                this.cargarFichas(this.jugadorActual, this.columnas * this.filas); // Cargar nueva ficha para el jugador que acaba de jugar
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
        return selected ? `/TP1/img/${selected.value}.png` : '';
    }

    cargarFichas(jugador, cantidadCasilleros) {
        const contenedorFichas = document.getElementById(`fichas${jugador.charAt(0).toUpperCase() + jugador.slice(1)}`);
        contenedorFichas.innerHTML = `<h3>Fichas ${jugador.charAt(0).toUpperCase() + jugador.slice(1)}</h3>`;
        
        const fichasParaCargar = Math.floor(1); // La mitad de los casilleros
        
        for (let i = 0; i < fichasParaCargar; i++) {
            const ficha = document.createElement('div');
            ficha.classList.add('ficha', jugador);
            ficha.dataset.jugador = jugador;
            ficha.draggable = true;
            ficha.style.backgroundImage = this.getSelectedImage(jugador); // Asegúrate de usar 'this'
            ficha.style.backgroundSize = 'contain'; // Ajustar tamaño de la imagen
            ficha.style.backgroundRepeat = 'no-repeat'; // Evitar que la imagen se repita
            ficha.style.backgroundPosition = 'center'; // Centrar la imagen en la ficha
    
            // Añadir eventos de arrastrar
            ficha.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', jugador); // Enviar el tipo de jugador
                e.dataTransfer.setData('fichaId', ficha.id); // Enviar el ID de la ficha
            });
    
            contenedorFichas.appendChild(ficha);
        }
    }
    
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('iniciarJuego').addEventListener('click', () => {
        const lineasSeleccionadas = parseInt(document.getElementById('lineas').value);
        
        // Define las columnas y filas basadas en las líneas seleccionadas
        const [columnas, filas] = {
            4: [7, 6],
            5: [8, 7],
            6: [9, 8],
            7: [10, 9]
        }[lineasSeleccionadas];

        const totalCasilleros = columnas * filas; // Total de casilleros del tablero

        // Crear una nueva instancia del juego
        const juego = new Juego(columnas, filas, lineasSeleccionadas);

        // Ocultar configuraciones y mostrar contenedores de juego
        document.getElementById('configuracion').style.display = 'none';
        document.getElementById('juegoContainer').style.display = 'flex';

        // Cargar fichas seleccionadas por el usuario
        juego.cargarFichas('planta', totalCasilleros); // Pasa el total de casilleros
        juego.cargarFichas('zombie', totalCasilleros); // Pasa el total de casilleros

        // Muestra el temporizador
        document.getElementById('temporizador').classList.remove('hidden');
    });
});
