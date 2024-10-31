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
        
        // Definir el tamaño máximo del tablero en píxeles
        const maxBoardSize = 500; // Tamaño máximo del tablero en píxeles
        this.cellSize = Math.floor(maxBoardSize / Math.max(this.columnas, this.filas));
        this.updateCanvasSize();

        // Precargar las imágenes de las fichas
        this.imgPlanta = new Image();
        this.imgPlanta.src = '/TP1/img/plantaa.png';
        this.imgZombie = new Image();
        this.imgZombie.src = '/TP1/img/zombiee.png';

        this.initFichas();
        this.drawBoard();
    }

    updateCanvasSize() {
        // Ajustar tamaño del canvas basado en el tamaño de celda calculado
        this.canvas.width = this.columnas * this.cellSize;
        this.canvas.height = this.filas * this.cellSize;

        // Espacio desde el encabezado
        this.canvas.style.marginTop = "20px";
    }




    drawBoard() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let col = 0; col < this.columnas; col++) {
            for (let row = 0; row < this.filas; row++) {
                this.context.beginPath();
                
                const x = col * this.cellSize + this.cellSize / 2;
                const y = row * this.cellSize + this.cellSize / 2;
                const casillero = this.tablero.grilla[col][row];
                
                // Si el casillero está vacío, usa un color de fondo (blanco)
                if (casillero.isEmpty()) {
                    this.context.fillStyle = 'white';
                    this.context.arc(x, y, this.cellSize / 2 - 5, 0, 2 * Math.PI);
                    this.context.fill();
                } else {
                    // Dibujar la imagen correspondiente a cada jugador
                    const img = casillero.estado === 'planta' ? this.imgPlanta : this.imgZombie;
                    this.context.drawImage(
                        img,
                        col * this.cellSize,
                        row * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
                this.context.stroke();
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

            if (currentRow === filaIndex) {
                clearInterval(interval);
                this.tablero.grilla[colIndex][filaIndex].colocarFicha(jugador);
                this.drawBoard();
            } else {
                currentRow++;
            }
        }, 100);
    }
}


// Manejar el evento de iniciar el juego
document.getElementById('iniciarJuego').addEventListener('click', () => {
    const lineasSeleccionadas = parseInt(document.getElementById('lineas').value);
    let columnas, filas;

    // Asignar columnas y filas basados en la selección de líneas para ganar
    switch (lineasSeleccionadas) {
        case 4:
            columnas = 7;
            filas = 6;
            break;
        case 5:
            columnas = 8;
            filas = 7;
            break;
        case 6:
            columnas = 9;
            filas = 8;
            break;
        case 7:
            columnas = 10;
            filas = 9;
            break;
        default:
            columnas = 7;
            filas = 6;
            break;
    }

    // Inicializar el juego con el tamaño dinámico del tablero
    new Juego(columnas, filas, lineasSeleccionadas);
});



