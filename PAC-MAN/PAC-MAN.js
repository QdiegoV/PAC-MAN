document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const cells = Array.from(grid.querySelectorAll('div'));
    const width = 15;
    let pacmanIndex = 202;
    let score = 0;
    let lives = 3;

    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const restartButton = document.getElementById('restart');

    cells.forEach(cell => {
        cell.style.position = 'relative';
    });

    function createSprite(className) {
        const sprite = document.createElement('span');
        sprite.classList.add(className);
        sprite.style.position = 'absolute';
        sprite.style.top = '0';
        sprite.style.left = '0';
        sprite.style.width = '100%';
        sprite.style.height = '100%';
        sprite.style.zIndex = '2';
        return sprite;
    }

    let pacmanSprite = createSprite('pacman');
    cells[pacmanIndex].appendChild(pacmanSprite);

    const initialDots = [];
    const initialpastilla = [];

    cells.forEach((cell, index) => {
        if (cell.classList.contains('dot')) initialDots.push(index);
        if (cell.classList.contains('pastilla')) initialpastilla.push(index);
    });

    function endGame(message) {
        document.removeEventListener('keydown', movePacman);
        ghosts.forEach(ghost => clearInterval(ghost.timerId));
        setTimeout(() => alert(message), 100);
    }

    function resetPacmanPosition() {
        if (cells[pacmanIndex].contains(pacmanSprite)) {
            cells[pacmanIndex].removeChild(pacmanSprite);
        }
        pacmanIndex = 202;
        cells[pacmanIndex].appendChild(pacmanSprite);
    }

    function movePacman(e) {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

        let nextIndex = pacmanIndex;

        switch (e.key) {
            case 'ArrowUp':
                if (pacmanIndex - width >= 0) {
                    nextIndex -= width;
                }
                break;
            case 'ArrowDown':
                if (pacmanIndex + width < cells.length) {
                    nextIndex += width;
                }
                break;
            case 'ArrowLeft':
                if (pacmanIndex % width !== 0) {
                    nextIndex -= 1;
                }
                break;
            case 'ArrowRight':
                if (pacmanIndex % width !== width - 1) {
                    nextIndex += 1;
                }
                break;
        }

        if (!cells[nextIndex].classList.contains('wall')) {
            cells[pacmanIndex].removeChild(pacmanSprite);
            pacmanIndex = nextIndex;
            cells[pacmanIndex].appendChild(pacmanSprite);

            if (cells[pacmanIndex].classList.contains('dot')) {
                cells[pacmanIndex].classList.remove('dot');
                score += 5;
                if (scoreDisplay) scoreDisplay.textContent = score;
            }

            if (cells[pacmanIndex].classList.contains('pastilla')) {
                cells[pacmanIndex].classList.remove('pastilla');
                score += 10;
                if (scoreDisplay) scoreDisplay.textContent = score;
                ghosts.forEach(ghost => ghost.becomeScared());
            }

            ghosts.forEach(ghost => {
                if (ghost.currentIndex === pacmanIndex && ghost.isScared) {
                    ghost.erase();
                    ghost.currentIndex = ghost.startIndex;
                    ghost.draw();
                    score += 50;
                    if (scoreDisplay) scoreDisplay.textContent = score;
                }
            });

            if (ghosts.some(ghost => ghost.currentIndex === pacmanIndex && !ghost.isScared)) {
                lives--;
                if (livesDisplay) livesDisplay.textContent = lives;

                if (lives > 0) {
                    resetPacmanPosition();
                } else {
                    endGame('Perdiste todas tus vidas. ¡Juego terminado!');
                }
            }

            const remainingDots = cells.some(cell => cell.classList.contains('dot') || cell.classList.contains('pastilla'));
            if (!remainingDots) {
                endGame('¡Felicidades! Has ganado el juego 🎉');
            }
        }
    }

    document.addEventListener('keydown', movePacman);

    class Ghost {
        constructor(name, startIndex, className, speed = 500) {
            this.name = name;
            this.startIndex = startIndex;
            this.currentIndex = startIndex;
            this.className = className;
            this.speed = speed;
            this.timerId = null;
            this.directions = [-1, 1, -width, width];
            this.sprite = createSprite(className);
            this.isScared = false;
        }

        draw() {
            this.sprite.classList.toggle('scared', this.isScared);
            cells[this.currentIndex].appendChild(this.sprite);
        }

        erase() {
            if (cells[this.currentIndex].contains(this.sprite)) {
                cells[this.currentIndex].removeChild(this.sprite);
            }
        }

        move() {
            const moveGhost = () => {
                const direction = this.directions[Math.floor(Math.random() * this.directions.length)];
                const nextIndex = this.currentIndex + direction;
                if (
                    !cells[nextIndex].classList.contains('wall') &&
                    !cells[nextIndex].classList.contains('ghost')
                ) {
                    this.erase();
                    this.currentIndex = nextIndex;
                    this.draw();

                    if (this.currentIndex === pacmanIndex) {
                        if (this.isScared) {
                            this.erase();
                            this.currentIndex = this.startIndex;
                            this.draw();
                            score += 50;
                            if (scoreDisplay) scoreDisplay.textContent = score;
                        } else {
                            lives--;
                            if (livesDisplay) livesDisplay.textContent = lives;

                            if (lives > 0) {
                                resetPacmanPosition();
                            } else {
                                endGame('Perdiste todas tus vidas. ¡Juego terminado!');
                            }
                        }
                    }
                }
            };
            this.timerId = setInterval(moveGhost, this.speed);
        }

        becomeScared() {
            this.isScared = true;
            this.sprite.classList.add('scared');
            setTimeout(() => {
                this.isScared = false;
                this.sprite.classList.remove('scared');
            }, 7000);
        }
    }

    const blinky = new Ghost('blinky', 67, 'naranja', 500);
    const pinky = new Ghost('pinky', 77, 'rosa', 500);
    const ghosts = [blinky, pinky];

    ghosts.forEach(ghost => {
        ghost.draw();
        ghost.move();
    });

    restartButton.addEventListener('click', () => {
        score = 0;
        lives = 3;

        if (scoreDisplay) scoreDisplay.textContent = score;
        if (livesDisplay) livesDisplay.textContent = lives;

        cells.forEach(cell => {
            cell.classList.remove('dot', 'pastilla');
        });
        initialDots.forEach(i => cells[i].classList.add('dot'));
        initialpastilla.forEach(i => cells[i].classList.add('pastilla'));

        if (cells[pacmanIndex].contains(pacmanSprite)) {
            cells[pacmanIndex].removeChild(pacmanSprite);
        }
        pacmanIndex = 202;
        cells[pacmanIndex].appendChild(pacmanSprite);

        ghosts.forEach(ghost => {
            clearInterval(ghost.timerId);
            ghost.erase();
            ghost.currentIndex = ghost.startIndex;
            ghost.isScared = false;
            ghost.draw();
            ghost.move();
        });

        document.addEventListener('keydown', movePacman);
    });

    if (livesDisplay) livesDisplay.textContent = lives;
});