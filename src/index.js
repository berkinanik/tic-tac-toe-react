import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={`square ${props.winner ? 'winner-square' : ''}`} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Board(props) {
  function renderSquare(i) {
    return <Square value={props.squares[i]} onClick={() => props.onClick(i)} winner={props.winners.includes(i)} />;
  }

  function renderCols(i) {
    let cols = [];
    for (let j = 0; j < 3; j++) {
      cols.push(renderSquare(i * 3 + j));
    }
    return cols;
  }

  function renderRows() {
    let rows = [];
    for (let j = 0; j < 3; j++) {
      rows.push(<div className='board-row'>{renderCols(j)}</div>);
    }
    return rows;
  }

  return <div>{renderRows()}</div>;
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          lastMove: null,
          end: {
            winner: null,
            winners: [],
          },
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      ascending: true,
    };
  }

  getLastMoveText(i) {
    const history = this.state.history.slice();
    const current = history[i];
    const lastMove = current.lastMove;
    if (lastMove) {
      return `: ${lastMove.player} (${lastMove.col}, ${lastMove.row})`;
    }
    return '';
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    const winners = calculateWinner(squares);
    this.setState({
      history: history.concat([
        {
          squares: squares,
          lastMove: {
            player: squares[i],
            row: Math.floor(i / 3),
            col: i % 3,
          },
          end: winners,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      ...this.state,
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares).winner;
    const moves = history.map((step, move) => {
      const currentMove = this.state.stepNumber === move;
      const moveText = move ? (currentMove ? 'Move' : 'Go to move') + ` #${move}` : null;
      const startText = currentMove ? 'Game start' : 'Go to game start';
      const desc = move ? moveText + this.getLastMoveText(move) : startText;
      return (
        <li key={move}>
          <button className={currentMove ? 'current-move' : ''} onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      );
    });
    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else if (this.state.stepNumber === 9) {
      status = 'Draw!';
    } else {
      status = `Next Player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }
    return (
      <div className='game'>
        <div className='game-board'>
          <Board onClick={(i) => this.handleClick(i)} squares={current.squares} winners={current.end.winners} />
        </div>
        <div className='game-info'>
          <div className='row'>
            <h3 className={winner ? 'winner' : this.state.stepNumber === 9 ? 'draw' : null}>{status}</h3>
            <button
              className='sort-button'
              onClick={() => {
                this.setState({
                  ...this.state,
                  ascending: !this.state.ascending,
                });
              }}
            >
              {this.state.ascending ? 'Ascending ↓' : 'Descending ↑'}
            </button>
          </div>
          <ol>{this.state.ascending ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winners: [a, b, c],
      };
    }
  }
  return {
    winner: null,
    winners: [],
  };
}

// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));
