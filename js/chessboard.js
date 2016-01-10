var BLACK = 0;
var WHITE = 1;

var Piece = {
  Pawn: 1,
  Knight: 3,
  Bishop: 4,
  Rook: 5,
  Queen: 8,
  King: 1000000,
  Empty: 0
}

var GameState = {
  HumanWin: 1,
  PCWin: -1,
  Normal: 0
}

var HUMAN_COLOR = WHITE;
var PC_COLOR = BLACK;
var MAX_INT = 1000000000;

var Board = function(initState) {
  var MAX_DEPTH = 3;

  var firstColor = BLACK;
  var secondColor = WHITE;
  var state = {};

  var Move = function(from, to) {
    this.from = from;
    this.to = to;
  };

  var makePieceContainer = function(type, color) {
    return {
      type: type,
      color: color
    };
  }

  var abs = function(a) { return a>0? a : -a; }
  var isValid = function(move) {
    var x = move.to.x, y = move.to.y;
    var destination = move.to.container;
    var source = move.from.container;
    return x>-1 && y >-1 && x<8 && y < 8 && ((destination.type == Piece.Empty) || (destination.color != source.color));
  }

  var hash = function(x,y) {
    return x*8 + y;
  }

  var decode = function(h) {
    return [Math.floor(h/8), h%8];
  }

  var get = function(x,y) {
    var h = hash(x,y);
    if (state[h] == undefined) {
      return {
        type: Piece.Empty,
        color: 0
      };
    } else return state[h];
  }

  var set = function(x,y,pieceContainer) {
    if (pieceContainer.type == Piece.Empty) {
      del(x,y);
    } else state[hash(x,y)] = pieceContainer;
  }

  var del = function(x,y) {
    delete state[hash(x,y)];
  }

  var makeMoveObject = function(fromx, fromy, tox, toy) {
    var from = {
      x: fromx,
      y: fromy,
      container: get(fromx,fromy)
    };
    var to = {
      x: tox,
      y: toy,
      container: get(tox,toy)
    }
    return new Move(from, to);
  }

  var pieceMoves = {};
  pieceMoves[Piece.King] = function(x,y) {
    var moves = [
      [-1, 0], [0, -1], [1, 0], [0, 1], [-1,-1], [1,1], [-1,1], [1,-1]
    ];

    var result = [];

    moves.forEach(function(move) {
      var i = x + move[0];
      var j = y + move[1];
      var m = makeMoveObject(x,y,i,j);
      if (isValid(m)) {
        result.push(m);
      }
    })

    return result;
  }

  pieceMoves[Piece.Queen] = function(x,y) {
    var moves = [
      [-1, 0], [0, -1], [1, 0], [0, 1], 
      [-1, -1], [1, 1], [-1,1], [1,-1]
    ];

    var result = [];

    moves.forEach(function(move) {
      var i = x;
      var j = y;
      for (var multiplier = 1; multiplier < 8; multiplier++) {
        i += move[0];
        j+= move[1];
        var m = makeMoveObject(x,y,i,j);
        if (isValid(m)) {
          result.push(m);
          if (m.to.container.type != Piece.Empty) break;
        } else break;
      }
    })
    return result;
  }

  pieceMoves[Piece.Rook] = function(x,y) {
    var moves = [
      [-1, 0], [0, -1], [1, 0], [0, 1], 
    ];

    var result = [];

    moves.forEach(function(move) {
      var i = x;
      var j = y;
      for (var multiplier = 1; multiplier < 8; multiplier++) {
        i += move[0];
        j+= move[1];
        var m = makeMoveObject(x,y,i,j);
        if (isValid(m)) {
          result.push(m);
          if (m.to.container.type != Piece.Empty) break;
        } else break;
      }
    })
    return result;
  }

  pieceMoves[Piece.Bishop] =function(x,y) {
    var moves = [
      [-1, -1], [1, 1], [-1,1], [1,-1]
    ];

    var result = [];

    moves.forEach(function(move) {
      var i = x;
      var j = y;
      for (var multiplier = 1; multiplier < 8; multiplier++) {
        i += move[0];
        j += move[1];
        var m = makeMoveObject(x,y,i,j);
        if (isValid(m)) {
          result.push(m);
          if (m.to.container.type != Piece.Empty) break;
        } else break;
      }
    })
    return result;
  }

  pieceMoves[Piece.Pawn] = function(x,y) {
    var moves = [
      [1, 1], [1, -1]
    ];

    var result = [];
    var direction = (get(x,y).color == secondColor) ? -1 : 1;

    var m = makeMoveObject(x,y,x+direction,y);
    if (m.to.container.type == Piece.Empty) result.push(m);
    if ((direction == 1 && x == 1) || (direction == -1 && x == 6)) {
      m = makeMoveObject(x,y,x+2*direction,y);
      if (m.to.container.type == Piece.Empty) result.push(m);
    }

    moves.forEach(function(move) {
      var i = x + move[0] * direction;
      var j = y + move[1];
      var m = makeMoveObject(x,y,i,j);
      if (isValid(m) && m.to.container.type != Piece.Empty) {
        result.push(m);
      }
    });
    return result;
  }

  pieceMoves[Piece.Knight] = function(x,y) {
    var moves = [
      [1, 2], [2, 1], [-1, 2], [2, -1], [1, -2], [-2, 1], [-1, -2], [-2, -1]
    ];

    var result = [];

    moves.forEach(function(move) {
      var i = x + move[0];
      var j = y + move[1];
      var m = makeMoveObject(x,y,i,j);
      if (isValid(m)) {
        result.push(m);
      }
    })

    return result;
  }

  if (initState === undefined) {
    set(0,0, makePieceContainer(Piece.Rook, firstColor));
    set(0,1, makePieceContainer(Piece.Knight, firstColor));
    set(0,2, makePieceContainer(Piece.Bishop, firstColor));
    set(0,3, makePieceContainer(Piece.King, firstColor));
    set(0,4, makePieceContainer(Piece.Queen, firstColor));
    set(0,5, makePieceContainer(Piece.Bishop, firstColor));
    set(0,6, makePieceContainer(Piece.Knight, firstColor));
    set(0,7, makePieceContainer(Piece.Rook, firstColor));
    for (var i = 0; i<8; i++) {
      set(1,i, makePieceContainer(Piece.Pawn, firstColor));
      set(6,i, makePieceContainer(Piece.Pawn, secondColor));
    }

    set(7,0, makePieceContainer(Piece.Rook, secondColor));
    set(7,1, makePieceContainer(Piece.Knight, secondColor));
    set(7,2, makePieceContainer(Piece.Bishop, secondColor));
    set(7,3, makePieceContainer(Piece.King, secondColor));
    set(7,4, makePieceContainer(Piece.Queen, secondColor));
    set(7,5, makePieceContainer(Piece.Bishop, secondColor));
    set(7,6, makePieceContainer(Piece.Knight, secondColor));
    set(7,7, makePieceContainer(Piece.Rook, secondColor));
  } else {
    state = initState;
  }

  
  
  var makeMove = function(move) {
    set(move.to.x, move.to.y, move.from.container);
    del(move.from.x, move.from.y);
  }

  var undoMove = function(move) {
    set(move.from.x, move.from.y, move.from.container);
    set(move.to.x, move.to.y, move.to.container);
  }

  var getHumanOrPCPositions = function(humanOrPC) {
    var checkColor = PC_COLOR;
    if (humanOrPC) checkColor = HUMAN_COLOR;

    var result = [];
    for (var key in state) {
      if (state.hasOwnProperty(key)) {
        if (state[key].color == checkColor) result.push(decode(key));
      }
    }
    result.sort(function(a,b) {
      return get(a[0], a[1]).type - get(b[0], b[1]).type;
    })
    return result;
  }

  var getAllPossibleMoves = function(humanOrPC) {
    var positions = getHumanOrPCPositions(humanOrPC);
    var result = [];
    for (var i=0; i<positions.length; i++) {
      var x = positions[i][0], y = positions[i][1];
      var pieceType = get(x,y).type;
      if (pieceType != Piece.Empty) {
        var possibleMoves = pieceMoves[pieceType](x,y);
        result = result.concat(possibleMoves);
      };
    }
    return result;
  }

  var getHumanPositions = function() {
    return getHumanOrPCPositions(true);
  }
  var getPCPositions = function() {
    return getHumanOrPCPositions(false);
  }

  var calculateScore = function() {
    var result = 0;
    for (var key in state) {
      if (state.hasOwnProperty(key)) {
        if (state[key].color == HUMAN_COLOR) result -= state[key].type;
        else result += state[key].type;
      }
    }
    return result;
  }
  var calcCount = 0;

  var tryMove = function(humanOrPC, depth) {
    if (depth >= MAX_DEPTH) return { move: null, bestScore: calculateScore(state) };
    var MINVALUE = humanOrPC ? MAX_INT : -MAX_INT;
    var maxScoreCanHave = MINVALUE;
    var rightMove = null;
    var allPossibleMoves = getAllPossibleMoves(humanOrPC);
    var iiMove = 0;
    calcCount++;
    for (var ii = 0; ii<allPossibleMoves.length; ii++) {
      var move = allPossibleMoves[ii];
      makeMove(move);
      if (move.to.container.type == Piece.King) {
        undoMove(move);
        return { move: move, bestScore: -MINVALUE };
      }
      var bestOfTheOther= tryMove(humanOrPC ^ 1, depth+1).bestScore;
      if ( (bestOfTheOther < maxScoreCanHave && humanOrPC)
        ||  (bestOfTheOther > maxScoreCanHave && (!humanOrPC)) ) {
        maxScoreCanHave = bestOfTheOther;
        rightMove = move;
        iiMove = ii;
      }
      undoMove(move);
    }
    if (depth == 0) {
      console.log('Chosen Move is ' + iiMove);
    } 
    return {move: rightMove, bestScore: maxScoreCanHave }; 
  }

  this.get = get;
  this.getHumanPositions = getHumanPositions;
  this.getPCPositions = getPCPositions;
  this.setMaxDepth = function(depth) {
    MAX_DEPTH = depth;
  }

  // allow player to make a move from (i,j) to (x,y)
  this.makeMove = function(i,j,x,y) {
    makeMove(makeMoveObject(i,j,x,y,this));
  };

  this.checkWin = function() {
    var isHumanKingAlive = false;
    var isPCKingAlive = false;
    for (var key in state) {
      if (state.hasOwnProperty(key)) {
        var container = state[key];
        if (container.type == Piece.King) {
          if (container.color == HUMAN_COLOR) {
            isHumanKingAlive = true;
          } else {
            isPCKingAlive = true;
          }
        }
      }
    }

    if (!isHumanKingAlive) {
      return GameState.PCWin;
    } else if (!isPCKingAlive) {
      return GameState.HumanWin;
    } else return GameState.Normal;
  }

  this.getPCResponse = function() {
    calcCount = 0;
    var res = tryMove(false, 0).move;
    console.log('Calculation steps: ' + calcCount);
    return res;
  }

  this.getPossibleMovesFrom = function(x,y) {
    var container = get(x,y);
    if (container.type == Piece.Empty) return [];
    return pieceMoves[container.type](x,y);
  }

  this.isHumanPiece = function(x,y) {
    return get(x,y).type != Piece.Empty && get(x,y).color == HUMAN_COLOR;
  }
};
