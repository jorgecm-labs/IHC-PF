const boardSize = 10;
let playerPositions = [0, 0]; // Posición inicial de los jugadores (jugador 1 y jugador 2)
let currentPlayer = 0; // Jugador que tiene el turno (0 para jugador 1, 1 para jugador 2)
let currentQuestion = null;
let correctAnswer = null;

// Función para generar el tablero
function updateBoard() {
  const board = document.getElementById('board');
  board.innerHTML = ''; // Limpiar el tablero

  let number = 1;
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // Crear una celda del tablero
      const cell = document.createElement('div');

      // Asignar color en base a la posición (patrón tipo mosaico)
      if ((row + col) % 2 === 0) {
        cell.classList.add('yellow'); // Color para las celdas de índice par
      } else {
        cell.classList.add('black'); // Color para las celdas de índice impar
      }

      // Asignar el número a la celda
      const cellNumber = document.createElement('span');
      cellNumber.textContent = number;
      cell.appendChild(cellNumber);

      // Añadir la celda al tablero
      board.appendChild(cell);
      number++;
    }
  }

  // Eliminar las fichas anteriores antes de agregar las nuevas
  const previousPlayers = document.querySelectorAll('.player');
  previousPlayers.forEach(player => player.remove());

  const cells = document.querySelectorAll('#board div');
  playerPositions.forEach((pos, index) => {
    const playerElement = document.createElement('img');
    playerElement.classList.add('player');
    playerElement.classList.add(index === 0 ? 'player-red' : 'player-blue');
    playerElement.src = index === 0 ? 'buap.png' : 'fcc.png'; // Usamos imágenes para las fichas de los jugadores

    const cell = cells[pos];
    const rect = cell.getBoundingClientRect();
    playerElement.style.position = 'absolute';
    playerElement.style.top = `${rect.top + window.scrollY + 10}px`;
    playerElement.style.left = `${rect.left + window.scrollX + 10}px`;

    document.body.appendChild(playerElement);
  });

  // Mostrar el turno del jugador
  document.getElementById('player-turn').textContent = `Turno del Jugador ${currentPlayer + 1}`;
}

// Función para generar la pregunta matemática
function generateMathQuestion(diceRoll) {
  const num1 = diceRoll;
  // La dificultad aumenta dependiendo de la posición en el tablero
  const playerPosition = playerPositions[currentPlayer];
  let num2 = Math.floor(Math.random() * 10) + 1;

  // Ajuste de dificultad según la posición en el tablero
  if (playerPosition >= 20) {
    num2 = Math.floor(Math.random() * 50) + 1;
  } else if (playerPosition >= 10) {
    num2 = Math.floor(Math.random() * 20) + 1;
  }

  // Generar una pregunta matemática aleatoria
  const operation = Math.floor(Math.random() * 4);

  if (operation === 0) {
    correctAnswer = num1 + num2;
    currentQuestion = `¿Cuánto es ${num1} + ${num2}?`;
  } else if (operation === 1) {
    correctAnswer = num1 - num2;
    currentQuestion = `¿Cuánto es ${num1} - ${num2}?`;
  } else if (operation === 2) {
    correctAnswer = num1 * num2;
    currentQuestion = `¿Cuánto es ${num1} * ${num2}?`;
  } else {
    let divisor = Math.floor(Math.random() * 10) + 1;

    // Asegurarse de que la división sea exacta
    while (num1 % divisor !== 0) {
      divisor = Math.floor(Math.random() * 10) + 1;
    }

    correctAnswer = num1 / divisor;
    currentQuestion = `¿Cuánto es ${num1} / ${divisor}?`;
  }

  // Mostrar la pregunta
  document.getElementById('question-box').textContent = currentQuestion;

  // Mover el foco al campo de respuesta solo después de que se actualicen las posiciones de las fichas
  setTimeout(() => {
    document.getElementById('answer').focus();  // Focalizar el campo de respuesta después del movimiento
  }, 500); // Espera el tiempo de la animación de las fichas
}


// Función para verificar la respuesta
function checkAnswer() {
  const userAnswer = parseInt(document.getElementById('answer').value);
  const resultBox = document.getElementById('result');

  if (userAnswer === correctAnswer) {
    resultBox.textContent = '¡Correcto!';
    movePlayer(currentPlayer, parseInt(document.getElementById('dice').textContent));
  } else {
    resultBox.textContent = '¡Incorrecto! Pasando turno...';
    nextTurn();
  }
}

// Función para mover al jugador de izquierda a derecha
function movePlayer(player, diceRoll) {
  let newPosition = playerPositions[player] + diceRoll;

  // Si el jugador pasa de la última casilla, se coloca en la última casilla
  if (newPosition >= boardSize * boardSize) {
    newPosition = boardSize * boardSize - 1;
    showWinnerMessage(player); // Mostrar mensaje de ganador
    return; // Detenemos la ejecución para no continuar el juego después de ganar
  }

  playerPositions[player] = newPosition;

  // Encontramos la celda correspondiente en el tablero
  const cells = document.querySelectorAll('#board div');
  const targetCell = cells[newPosition];

  // Obtenemos las coordenadas de la celda destino
  const rect = targetCell.getBoundingClientRect();
  const targetTop = rect.top + window.scrollY;
  const targetLeft = rect.left + window.scrollX;

  // Encontramos la ficha del jugador
  const playerElement = document.querySelectorAll('.player')[player];

  // Primero, restablecemos la posición de la ficha en la celda actual
  playerElement.style.transition = "none"; // Desactivamos la transición temporalmente para evitar "salto"
  const currentRect = playerElement.getBoundingClientRect();
  playerElement.style.top = `${currentRect.top}px`;  // Ficha comienza desde su posición actual
  playerElement.style.left = `${currentRect.left}px`;

  // Ahora activamos la transición para mover la ficha a la nueva celda
  setTimeout(() => {
    playerElement.style.transition = "top 0.5s ease, left 0.5s ease"; // Activamos la transición para movimiento
    playerElement.style.top = `${targetTop}px`; // Movemos la ficha a la nueva posición vertical
    playerElement.style.left = `${targetLeft}px`; // Movemos la ficha a la nueva posición horizontal
  }, 10); // Lo hacemos en el siguiente ciclo de eventos para aplicar la transición correctamente

  // Actualizamos el tablero después de que el movimiento termine
  setTimeout(() => {
    updateBoard();
    nextTurn();
  }, 500); // Este tiempo debe coincidir con la duración de la animación
}

// Función para cambiar el turno
function nextTurn() {
  currentPlayer = (currentPlayer + 1) % 2;
  updateBoard();
  document.getElementById('answer').value = '';
  document.getElementById('question-box').textContent = '';
}

// Función para tirar el dado
function rollDice() {
  const diceElement = document.getElementById('dice');

  // Primero quitamos la clase dice-rolling si ya está aplicada
  diceElement.classList.remove('dice-rolling');

  // Necesitamos forzar el navegador a volver a aplicar la animación
  void diceElement.offsetWidth; // Este truco fuerza la re-evaluación del estilo

  // Ahora aplicamos la clase dice-rolling para iniciar la animación
  diceElement.classList.add('dice-rolling');

  setTimeout(() => {
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    diceElement.textContent = diceRoll;
    generateMathQuestion(diceRoll);
  }, 1000); // Duración de la animación, debe coincidir con la duración de la animación CSS
}

// Función para mostrar el mensaje de felicitación al ganador
function showWinnerMessage(player) {
  const winnerMessage = document.createElement('div');
  winnerMessage.id = 'winner-message';
  winnerMessage.style.position = 'fixed';
  winnerMessage.style.top = '50%';
  winnerMessage.style.left = '50%';
  winnerMessage.style.transform = 'translate(-50%, -50%)';
  winnerMessage.style.padding = '20px';
  winnerMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  winnerMessage.style.color = 'white';
  winnerMessage.style.fontSize = '24px';
  winnerMessage.style.borderRadius = '10px';
  winnerMessage.style.textAlign = 'center';
  winnerMessage.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  winnerMessage.innerHTML = `¡Felicidades Jugador ${player + 1}! Has ganado el juego.<br><br><button id="reload-button" style="padding: 10px 20px; font-size: 16px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>`;

  document.body.appendChild(winnerMessage);

  // Al hacer clic en el botón de cierre, recargamos la página
  document.getElementById('reload-button').onclick = () => {
    location.reload(); // Recarga la página
  };
}

// Al presionar Enter, enviar la respuesta automáticamente
document.getElementById('answer').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    checkAnswer();
  }
});

// Manejar el lanzamiento del dado
document.getElementById('roll-dice').onclick = rollDice;
document.getElementById('submit-answer').onclick = checkAnswer;

// Inicializar el juego al cargar la página
window.onload = () => {
  updateBoard();
};
