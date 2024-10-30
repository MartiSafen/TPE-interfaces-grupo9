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
    constructor(columnas = 7, filas = 6) {
        this.columnas = columnas;
        this.filas = filas;
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
        return count >= 4;
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
        return this.jugador === 'planta' ? 'green' : 'darkmagenta';
    }

    getImage() {
        return this.jugador === 'planta' ? '/TP1/img/plantaa.png' : '/TP1/img/zombiee.png';
    }
}

class Juego {
    constructor() {
        this.tablero = new Tablero();
        this.jugadorActual = 'planta';
        this.canvas = document.getElementById('tableroCanvas');
        this.context = this.canvas.getContext('2d');
        this.initFichas();
        this.drawBoard();
    }

    drawBoard() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let col = 0; col < this.tablero.columnas; col++) {
            for (let row = 0; row < this.tablero.filas; row++) {
                this.context.beginPath();
                this.context.arc(col * 50 + 25, row * 50 + 25, 20, 0, 2 * Math.PI);
                
                const casillero = this.tablero.grilla[col][row];
                
                // Dibuja el color de fondo del casillero
                this.context.fillStyle = casillero.isEmpty() ? 'white' : casillero.estado === 'planta' ? 'green' : 'darkmagenta';
                this.context.fill();
                this.context.stroke();
                
                // Dibuja la imagen de la ficha si no está vacía
                if (!casillero.isEmpty()) {
                    const img = new Image();
                    img.src = casillero.estado === 'planta' ? '/TP1/img/plantaa.png' : '/TP1/img/zombiee.png';
                    this.context.drawImage(img, col * 50 + 5, row * 50 + 5, 40, 40);
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
        const colIndex = Math.floor(x / 50);

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
        
        const img = new Image();
        img.src = this.fichaActual.getImage();

        const interval = setInterval(() => {
            this.drawBoard();

            // Dibuja el color de fondo de la ficha que cae
            this.context.fillStyle = this.fichaActual.getColor(); // Mantiene el color de fondo
            this.context.beginPath();
            this.context.arc(colIndex * 50 + 25, currentRow * 50 + 25, 20, 0, 2 * Math.PI);
            this.context.fill();
            this.context.stroke();

            // Dibuja la imagen de la ficha que cae
            this.context.drawImage(img, colIndex * 50 + 5, currentRow * 50 + 5, 40, 40);

            if (currentRow === filaIndex) {
                clearInterval(interval);
                this.tablero.grilla[colIndex][filaIndex].colocarFicha(jugador);
                this.drawBoard(); // Redibuja el tablero para reflejar el cambio
            } else {
                currentRow++;
            }
        }, 100);
    }
}

const juego = new Juego();



