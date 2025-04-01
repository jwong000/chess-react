import React, { useState, useEffect } from 'react';

const ChessGame = () => {
  // Game state
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [gameStatus, setGameStatus] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);

  // Initialize the board
  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    const newBoard = Array(8).fill().map(() => Array(8).fill(null));
    
    // Set up pawns
    for (let i = 0; i < 8; i++) {
      newBoard[1][i] = { type: 'pawn', color: 'black' };
      newBoard[6][i] = { type: 'pawn', color: 'white' };
    }
    
    // Set up back rows
    const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let i = 0; i < 8; i++) {
      newBoard[0][i] = { type: backRow[i], color: 'black' };
      newBoard[7][i] = { type: backRow[i], color: 'white' };
    }
    
    setBoard(newBoard);
    setGameStatus('White to move');
  };

  // Check if a move is valid
  const isValidMove = (from, to) => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const piece = board[fromRow][fromCol];
    
    // Cannot move to a square with a piece of the same color
    if (board[toRow][toCol] && board[toRow][toCol].color === piece.color) {
      return false;
    }
    
    // Different piece types have different movement rules
    switch (piece.type) {
      case 'pawn':
        return isValidPawnMove(from, to);
      case 'rook':
        return isValidRookMove(from, to);
      case 'knight':
        return isValidKnightMove(from, to);
      case 'bishop':
        return isValidBishopMove(from, to);
      case 'queen':
        return isValidQueenMove(from, to);
      case 'king':
        return isValidKingMove(from, to);
      default:
        return false;
    }
  };

  // Check if pawn move is valid
  const isValidPawnMove = (from, to) => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const piece = board[fromRow][fromCol];
    const direction = piece.color === 'white' ? -1 : 1;
    
    // Move forward one square
    if (fromCol === toCol && toRow === fromRow + direction && !board[toRow][toCol]) {
      return true;
    }
    
    // Move forward two squares from starting position
    if (fromCol === toCol && 
        ((piece.color === 'white' && fromRow === 6 && toRow === 4) || 
         (piece.color === 'black' && fromRow === 1 && toRow === 3)) && 
        !board[fromRow + direction][fromCol] && 
        !board[toRow][toCol]) {
      return true;
    }
    
    // Capture diagonally
    if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && 
        board[toRow][toCol] && board[toRow][toCol].color !== piece.color) {
      return true;
    }
    
    return false;
  };

  // Check if rook move is valid
  const isValidRookMove = (from, to) => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    
    // Rooks move in straight lines
    if (fromRow !== toRow && fromCol !== toCol) {
      return false;
    }
    
    // Check for pieces in the way
    if (fromRow === toRow) {
      const start = Math.min(fromCol, toCol);
      const end = Math.max(fromCol, toCol);
      for (let col = start + 1; col < end; col++) {
        if (board[fromRow][col]) {
          return false;
        }
      }
    } else {
      const start = Math.min(fromRow, toRow);
      const end = Math.max(fromRow, toRow);
      for (let row = start + 1; row < end; row++) {
        if (board[row][fromCol]) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Check if knight move is valid
  const isValidKnightMove = (from, to) => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    
    // Knights move in an L-shape: 2 squares in one direction and 1 square perpendicular
    return (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) ||
           (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2);
  };

  // Check if bishop move is valid
  const isValidBishopMove = (from, to) => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    
    // Bishops move diagonally
    if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) {
      return false;
    }
    
    // Check for pieces in the way
    const rowDirection = fromRow < toRow ? 1 : -1;
    const colDirection = fromCol < toCol ? 1 : -1;
    let row = fromRow + rowDirection;
    let col = fromCol + colDirection;
    
    while (row !== toRow && col !== toCol) {
      if (board[row][col]) {
        return false;
      }
      row += rowDirection;
      col += colDirection;
    }
    
    return true;
  };

  // Check if queen move is valid
  const isValidQueenMove = (from, to) => {
    // Queen can move like a rook or a bishop
    return isValidRookMove(from, to) || isValidBishopMove(from, to);
  };

  // Check if king move is valid
  const isValidKingMove = (from, to) => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    
    // Kings move one square in any direction
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
  };

  // Handle click on a square
  const handleSquareClick = (row, col) => {
    // If no piece is selected and the square contains a piece of the current player's color
    if (!selectedPiece && board[row][col] && board[row][col].color === currentPlayer) {
      setSelectedPiece([row, col]);
    } 
    // If a piece is already selected
    else if (selectedPiece) {
      // If clicking on the same piece, deselect it
      if (selectedPiece[0] === row && selectedPiece[1] === col) {
        setSelectedPiece(null);
      } 
      // Try to move the selected piece to the new square
      else if (isValidMove(selectedPiece, [row, col])) {
        const [fromRow, fromCol] = selectedPiece;
        const newBoard = board.map(row => [...row]);
        
        // Record the move
        const piece = board[fromRow][fromCol];
        const capturedPiece = board[row][col];
        const moveNotation = `${piece.type} ${String.fromCharCode(97 + fromCol)}${8 - fromRow} to ${String.fromCharCode(97 + col)}${8 - row}${capturedPiece ? ' captures ' + capturedPiece.type : ''}`;
        setMoveHistory([...moveHistory, moveNotation]);
        
        // Move the piece
        newBoard[row][col] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;
        
        setBoard(newBoard);
        setSelectedPiece(null);
        
        // Switch player
        const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
        setCurrentPlayer(nextPlayer);
        setGameStatus(`${nextPlayer.charAt(0).toUpperCase() + nextPlayer.slice(1)} to move`);
      } else {
        // Invalid move
        setSelectedPiece(null);
      }
    }
  };

  // Render the chess board
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-xl font-bold">{gameStatus}</div>
      
      <div className="mb-6 border-2 border-gray-800">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((piece, colIndex) => {
              const isSelected = selectedPiece && selectedPiece[0] === rowIndex && selectedPiece[1] === colIndex;
              const squareColor = (rowIndex + colIndex) % 2 === 0 ? 'bg-amber-200' : 'bg-amber-800';
              
              return (
                <div 
                  key={colIndex} 
                  className={`w-12 h-12 flex items-center justify-center ${squareColor} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece && (
                    <div className={`text-2xl ${piece.color === 'white' ? 'text-white' : 'text-black'}`}>
                      {getPieceSymbol(piece)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="w-full max-w-md mt-4">
        <div className="mb-2 font-bold">Move History:</div>
        <div className="max-h-40 overflow-y-auto border border-gray-300 p-2">
          {moveHistory.length === 0 ? (
            <div className="text-gray-500">No moves yet</div>
          ) : (
            moveHistory.map((move, index) => (
              <div key={index} className="text-sm">
                {index + 1}. {move}
              </div>
            ))
          )}
        </div>
      </div>
      
      <button 
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={initializeBoard}
      >
        Reset Game
      </button>
    </div>
  );
};

// Helper function to get the Unicode symbol for a chess piece
const getPieceSymbol = (piece) => {
  const symbols = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟︎'
    }
  };
  
  return symbols[piece.color][piece.type];
};

export default ChessGame;