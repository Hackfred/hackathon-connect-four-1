import { EMPTY } from "../shared/constants.js";
import { min, max, key } from "../shared/functions.js";

export class VirtualBoard {
  constructor(rowCount, colCount) {
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.checkers = {};
    console.log(this.rowCount);
  }

  getNewRow = (checkers, col) => {
    const a = Object.keys(checkers)
      .map(k => parseInt(k, 10))
      .filter(i => {
        const ccol = i % 10;
        return ccol === col;
      });

    const max = Math.max(...a);

    if (max > -1) {
      return Math.floor(max / 10) + 1;
    } else {
      return 0;
    }
  };

  //
  canPlay(col) {
    return this.getNewRow(this.checkers, col) < this.rowCount;
  }

  play(col, playerColor) {
    const row = this.getNewRow(col);
    this.checkers[key(row, col)] = {
      row,
      col,
      color: JSON.parse(JSON.stringify(playerColor))
    };
  }

  undo(col) {}

  isWinningMove(col) {
    const row = this.getNewRow(col);
    return this.checkForWinFrom({ row, col });
  }

  nbMoves() {}

  /* Prüft, ob einer der Spieler auf einem Teil des Spielfeldes gewonnen hat.
       Diese Methode wird immer mit einem Array von 4 Spielfeldpositionen aufgerufen.
       Wenn auf diesen 4 Positionen 4 gleichfarbige Steine liegen, gibt diese Methode true zurück, weil dieser Spieler dann gewonnen hat.
    */
  getWinner(...segment) {
    if (segment.length !== 3) return false;
    const segment_checkers = segment.map(([row, col]) =>
      this.getChecker(this.checkers, { row, col })
    );
    const color = segment_checkers[0].color;
    if (color === EMPTY) return false;
    if (segment_checkers.every(c => c.color.value === color.value))
      return { color: color, checkers: segment_checkers };
    return false;
  }

  /* Hier werden alle möglichen horizontalen Spielfeldsegmente geprüft, die zu einem Gewinn führen könnten.
  Beispiel für so eine Situation: 
    o o o o o o o o
    o o o o o o o o
    o o o o o o o o
    o o o o o o o o 
    o o o o o o o o 
    o x x x x o o o
    Wenn 4 Steine in einer solchen Reihe liegen, gibt diese Funktion true zurück.
  */
  checkHorizontalSegments({ focalRow, minCol, maxCol }) {
    for (let row = focalRow, col = minCol; col <= maxCol; col++) {
      const winner = this.getWinner(
        this.checkers,
        [row, col + 1],
        [row, col + 2],
        [row, col + 3]
      );
      if (winner) return winner;
    }
  }

  /* Hier werden alle möglichen vertikalen Spielfeldsegmente geprüft, die zu einem Gewinn führen könnten 
  Beispiel für so eine Situation: 
    o o o o o o o o
    o o o o o o o o
    o o o o x o o o
    o o o o x o o o 
    o o o o x o o o 
    o o o o x o o o
    Wenn 4 Steine in einer solchen Reihe liegen, gibt diese Funktion true zurück.
  */
  checkVerticalSegments({ focalRow, focalCol, minRow, maxRow }) {
    for (let col = focalCol, row = minRow; row <= focalRow; row++) {
      const winner = this.getWinner(
        this.checkers,
        [row + 1, col],
        [row + 2, col],
        [row + 3, col]
      );
      if (winner) return winner;
    }
  }

  /* Hier werden alle möglichen diagonalen, noch rechts-oben gerichteten Spielfeldsegmente geprüft, die zu einem Gewinn führen könnten 
    Beispiel für so eine Situation: 
    o o o o o o o o
    o o o o o o o o
    o o o o o o x o
    o o o o o x o o 
    o o o o x o o o 
    o o o x o o o o
    Wenn 4 Steine in einer solchen Diagonalen liegen, gibt diese Funktion true zurück.
  */
  checkForwardSlashSegments({
    focalRow,
    focalCol,
    minRow,
    minCol,
    maxRow,
    maxCol
  }) {
    const startForwardSlash = (row, col) => {
      while (row > minRow && col > minCol) {
        row--;
        col--;
      }
      return [row, col];
    };

    let row, col;
    for (
      [row, col] = startForwardSlash(focalRow, focalCol);
      row <= maxRow && col <= maxCol;
      row++, col++
    ) {
      const winner = this.getWinner(
        this.checkers,
        [row + 1, col + 1],
        [row + 2, col + 2],
        [row + 3, col + 3]
      );
      if (winner) return winner;
    }
  }

  /* Hier werden alle möglichen diagonalen, noch rechts-unten gerichteten Spielfeldsegmente geprüft, die zu einem Gewinn führen könnten 
    Beispiel für so eine Situation: 
    o o o o o o o o
    o o o o o o o o
    o o o x o o o o
    o o o o x o o o 
    o o o o o x o o 
    o o o o o o x o
    Wenn 4 Steine in einer solchen Diagonalen liegen, gibt diese Funktion true zurück.
  */
  checkBackwardSlashSegments({
    focalRow,
    focalCol,
    minRow,
    minCol,
    maxRow,
    maxCol
  }) {
    const startBackwardSlash = (row, col) => {
      while (row < maxRow && col > minCol) {
        row++;
        col--;
      }
      return [row, col];
    };
    let row, col;
    for (
      [row, col] = startBackwardSlash(focalRow, focalCol);
      row >= minRow && col <= maxCol;
      row--, col++
    ) {
      const winner = this.getWinner(
        this.checkers,
        [row - 1, col + 1],
        [row - 2, col + 2],
        [row - 3, col + 3]
      );
      if (winner) return winner;
    }
  }

  /* Prüft, ob das Spiel durch den letzten Stein, der gelegt wurde, gewonnen worden ist.
     Dazu muss in alle Richtungen (horizontal, vertical und diagonal) grprüft werden, ob eine Reihe von 4 gleichen Steinen existiert.
  */
  checkForWinFrom(lastChecker) {
    if (!lastChecker) return;
    /* focalRow enthält die Zeile des gerade gesetzten Steins, focalCol die Spalte 
       Wurde des letzte Stein links unten gesetzt sieht das so auf:
       focalRow = 0 und focalCol = 0
    */
    const { row: focalRow, col: focalCol } = lastChecker;

    const minCol = min(focalCol);
    const maxCol = max(focalCol, this.colCount - 1);
    const minRow = min(focalRow);
    const maxRow = max(focalRow, this.rowCount - 1);
    const coords = { focalRow, focalCol, minRow, minCol, maxRow, maxCol };

    return (
      this.checkHorizontalSegments(coords) ||
      this.checkVerticalSegments(coords) ||
      this.checkForwardSlashSegments(coords) ||
      this.checkBackwardSlashSegments(coords)
    );
  }
}
