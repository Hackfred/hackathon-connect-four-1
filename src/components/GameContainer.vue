/*
  GameContainer.vue enthält den Kern unseres Spiels. 
  Hier werden die Regeln von "4 Gewinnt" festgelegt.
  Es gibt hier z.B. Funktionen, die prüfen, ob ein Spieler das Spiel gewonnen hat.
  Um das Spielbrett aufzusetzen, benutzt GameContainer.vue die anderen drei Komponenten,  v.a. GameBoard.vue
  Damit diese Aufgabe gelöst werden kann, musst ihr nur Änderungen in GameContainer.vue vornehmen. Die anderen 3 Files enthalten keine Fehler, ihr könnte aber trotzdem reinschauen, wenn auch deren Bedeutung interessiert.
*/
<template>
  <div>
    <!-- Hier kann ein beliebiger Text über dem Spielfeld angezeigt werden. 
         Der Inhalt wird durch die Variable instructions gesteuert.
         Ihr findet den Wert dieser Variablen weiter unten in dieser Datei und könnt ihn natürlich verändern.
    -->
    <p>{{ instructions }}</p>
    <game-board
      :checkers="checkers"
      :rowCount="rowCount"
      :colCount="colCount"
      :status="status"
      @drop="drop"
      @land="land"
    ></game-board>
    <!-- Dieser Bereich wird nur angezeigt, wenn das Spiel beendet wurde.-->
    <p v-if="gameOver">
      {{ overMessage }}
      <a href="#" @click="reset">Spiel neustarten.</a>
    </p>
    <!-- Dieser Bereich wird nur angezeigt, wenn das Spiel läuft.-->
    <p v-else>{{ whoseTurn }}</p>
  </div>
</template>

<script>
import Vue from "vue";
import GameBoard from "./GameBoard.vue";
import {
  PLAY,
  RED,
  OVER,
  EMPTY,
  BLUE,
  EVENT_BUS_AI
} from "../shared/constants.js";
import { titleize, min, max, key, maybeDone } from "../shared/functions.js";
// import VirtualBoard from "../shared/board.js";

export default {
  name: "GameContainer",

  components: {
    GameBoard
  },

  /* Hier werden einige Variablen gesetzt, die Einstellungen zum Spiel treffen (z.B. die Größe des Spielfelds oder welcher Spieler beginnt)*/
  data() {
    return {
      checkers: {},
      isLocked: false,
      isLockedByAI: false,
      playerColor: RED,
      rowCount: 6,
      colCount: 7,
      status: PLAY,
      instructions: "Klicke auf eine der Spalten, um einen Stein zu setzen.",
      winner: undefined
    };
  },

  computed: {
    overMessage() {
      if (this.winner) {
        return `${titleize(this.winner.color.displayName)} gewinnt!`;
      } else {
        return `Unentschieden!`;
      }
    },

    moves() {
      return Object.values(this.checkers);
    },

    /* Hier wird berechnet, welcher Spieler an der Reihe ist.
       Das wirkt sich dann auf den Text aus, der unter dem Spielfeld angezeigt wird.
    */
    whoseTurn() {
      if (this.moves.length === 0) {
        return `${titleize(this.playerColor.displayName)} beginnt.`;
      } else {
        return `${titleize(this.playerColor.displayName)} ist dran.`;
      }
    },

    /* Hier wird berechnet, ob das Spiel vorbei ist. 
       Diese Information wird oben im Template-Bereich benutzt, um dynamisch die Textanzeigt unter dem Spielfeld zu verändern.
    */
    gameOver() {
      if (this.status === OVER) {
        return true;
      } else {
        return false;
      }
    }
  },

  methods: {
    key,

    calculateColumLvl1() {
      const col = 0;
      return col;
    },

    calculateColumLvl2() {
      let possible_moves = [];
      for (let i = 0; i < this.colCount; i++) {
        // if (this.checkers.canPlay(i)) {
        possible_moves.push(i);
        //}
      }

      const move = Math.floor(Math.random() * possible_moves.length);

      return possible_moves[move];
    },

    calculateColumLvl3() {
      const getNewRow = (checkers, col) => {
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

      const simulateXMoves = (checkersCopy, playerColor, moves) => {
        const canWinWithNextMove = () => {
          for (let i = 0; i < this.colCount; i++) {
            const row = getNewRow(checkersCopy, i);

            let newChecker = this.getChecker(checkersCopy, { row, col: i });
            newChecker["color"] = JSON.parse(JSON.stringify(playerColor));
            checkersCopy[key(row, i)] = newChecker;
            const isWin = this.checkForWinFrom(checkersCopy, { row, col: i });
            delete checkersCopy[key(row, i)];
            if (row < this.rowCount && isWin !== undefined) {
              // player can win with his upcoming turn => return score and colum to select
              return [
                (this.colCount * this.rowCount -
                  Object.keys(checkersCopy).length) /
                  2,
                i
              ];
            }
          }

          return [0, -1];
        };

        if (moves === 1) {
          return canWinWithNextMove();
        } else {
          // check for draw

          // check if current player (in simulation can win with next move)
          const nextMove = canWinWithNextMove();
          if (nextMove[1] !== -1) {
            return nextMove;
          }

          // get all scores for possible next moves

          let highestScore = -this.colCount * this.rowCount;
          let bestMove = 0;
          for (let i = 0; i < this.colCount; i++) {
            const row = getNewRow(checkersCopy, i);
            if (row < this.rowCount) {
              // play the move in simulation
              let newChecker = this.getChecker(checkersCopy, { row, col: i });
              newChecker["color"] = JSON.parse(JSON.stringify(playerColor));
              //let checkersCopy = JSON.parse(JSON.stringify(checkersCopy));
              checkersCopy[key(row, i)] = newChecker;

              let nextPlayerColor;
              if (playerColor === BLUE) {
                nextPlayerColor = RED;
              } else {
                nextPlayerColor = BLUE;
              }
              // player can win with his upcoming turn => return score and colum to select
              const score = simulateXMoves(
                checkersCopy,
                nextPlayerColor,
                moves - 1
              );
              if (-score[0] > highestScore) {
                bestMove = i;
                highestScore = -score[0];
              }
              delete checkersCopy[key(row, i)];
            }
          }
          return [highestScore, bestMove];
        }
      };

      /* level 3 */
      console.log(this.checkers);

      const weights = simulateXMoves(
        JSON.parse(JSON.stringify(this.checkers)),
        this.playerColor,
        6
      );
      console.log(weights);
      return weights[1];
    },

    async makeAIMove() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(this.calculateColumLvl3());
        }, 100);
      });
    },

    /* Wenn diese Methode aufgerufen wird, wird ein neues Spiel gestartet. 
       Damit wird der Zustand des Spiels vollständig zurückgesetzt.
    */
    reset() {
      this.winner = undefined;
      this.isLocked = false;
      this.isLockedByAI = false;
      this.status = PLAY;
      this.checkers = {}; /* Hier entfernen wir alle Steine vom Feld */
    },

    /* Diese Methode sorgt dafür, dass die Spieler abwechselnd an die Reihe kommen.*/
    toggleColor() {
      if (this.playerColor === RED) {
        this.playerColor = BLUE;
      } else {
        this.playerColor = RED;
      }
    },

    /* Diese Methode setzt einen Stein auf eine bestimmte Stelle des Spielfelds. */
    setChecker({ row, col }, attrs = {}) {
      const checker = this.getChecker(this.checkers, { row, col });
      return Vue.set(this.checkers, key(row, col), { ...checker, ...attrs });
    },

    getChecker(checkers, { row, col }) {
      return checkers[key(row, col)] || { row, col, color: "empty" };
    },

    /* Diese Methode wird immer dann aufgerufen, wenn ein Spieler einen Stein aufs Spielfeld setzt. 
       Nach dem Setzen des Steins wird überprüft, ob das Spiel dadurch beendet wurde (z.B. weil einer der Spieler gewonnen hat).
       Danach ist der Nächste spieler and der Reihe.
    */
    drop({ col, row }) {
      /* Hier wird geprüft, ob der Spieler überhaupt einen Stein setzen darf.
         Wenn isLocked den Wert true hat, ist das Spielfeld gesperrt und es wird kein Stein gesetzt.
         Das ist z.B. der Fall, wenn das Spiel beendet wurde.
      */
      if (this.isLocked || this.isLockedByAI) return;

      this.isLocked = true;
      const color = this.playerColor;

      /* Das ist eine Test-Ausgabe (ähnlich zu System.out.println("")).
         Man kann diese Ausgaben auf der rechten Seite unter "Console" sehen.
         Sie können helfen, den Ablauf dieses Programms besser zu verstehen.   
      */
      this.setChecker({ row, col }, { color });

      /* Prüft, ob das Spiel beendet wurde */
      this.isDraw = this.checkForDraw();
      this.winner = this.checkForWinFrom(this.checkers, { row, col });
      /* Spielerwechsel */
      this.toggleColor();
    },

    /* Diese Methode wird aufgerufen, wenn ein neuer Stein auf dem Feld gelandet ist.
       => Also kurz nachdem drop() aufgerufen wurde.
    */
    land() {
      if (this.isDraw) return this.displayDraw();

      if (this.winner) {
        this.displayWin(this.winner);
      } else {
        this.isLocked = false;

        if (this.moves.length % 2 === 1) {
          this.isLockedByAI = true;
          this.makeAIMove().then(col => {
            if (col >= 0 && col < this.colCount) {
              this.isLockedByAI = false;
              EVENT_BUS_AI.$emit(`drop-checker-to-col-${col}`, "setChecker");
            } else {
              console.log("Our AI calculated a colum that is not valid.");
            }
          });
        }
      }
    },

    /* Prüft, ob das Spiel mit einem Unentschieden beendet wurde. */
    checkForDraw() {
      if (Object.keys(this.checkers).length === this.rowCount * this.colCount) {
        return true;
      } else {
        return false;
      }
    },

    /* Prüft, ob einer der Spieler auf einem Teil des Spielfeldes gewonnen hat.
       Diese Methode wird immer mit einem Array von 4 Spielfeldpositionen aufgerufen.
       Wenn auf diesen 4 Positionen 4 gleichfarbige Steine liegen, gibt diese Methode true zurück, weil dieser Spieler dann gewonnen hat.
    */
    getWinner(checkers, ...segment) {
      if (segment.length !== 4) return false;
      const segment_checkers = segment.map(([row, col]) =>
        this.getChecker(checkers, { row, col })
      );
      const color = segment_checkers[0].color;
      if (color === EMPTY) return false;
      if (segment_checkers.every(c => c.color.value === color.value))
        return { color: color, checkers: segment_checkers };
      return false;
    },

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
    checkHorizontalSegments(checkers, { focalRow, minCol, maxCol }) {
      for (let row = focalRow, col = minCol; col <= maxCol; col++) {
        const winner = this.getWinner(
          checkers,
          [row, col],
          [row, col + 1],
          [row, col + 2],
          [row, col + 3]
        );
        if (winner) return winner;
      }
    },

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
    checkVerticalSegments(checkers, { focalRow, focalCol, minRow, maxRow }) {
      for (let col = focalCol, row = minRow; row <= focalRow; row++) {
        const winner = this.getWinner(
          checkers,
          [row, col],
          [row + 1, col],
          [row + 2, col],
          [row + 3, col]
        );
        if (winner) return winner;
      }
    },

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
    checkForwardSlashSegments(
      checkers,
      { focalRow, focalCol, minRow, minCol, maxRow, maxCol }
    ) {
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
          checkers,
          [row, col],
          [row + 1, col + 1],
          [row + 2, col + 2],
          [row + 3, col + 3]
        );
        if (winner) return winner;
      }
    },

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
    checkBackwardSlashSegments(
      checkers,
      { focalRow, focalCol, minRow, minCol, maxRow, maxCol }
    ) {
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
          checkers,
          [row, col],
          [row - 1, col + 1],
          [row - 2, col + 2],
          [row - 3, col + 3]
        );
        if (winner) return winner;
      }
    },

    /* Prüft, ob das Spiel durch den letzten Stein, der gelegt wurde, gewonnen worden ist.
       Dazu muss in alle Richtungen (horizontal, vertical und diagonal) grprüft werden, ob eine Reihe von 4 gleichen Steinen existiert.
    */
    checkForWinFrom(checkers, lastChecker) {
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
        this.checkHorizontalSegments(checkers, coords) ||
        this.checkVerticalSegments(checkers, coords) ||
        this.checkForwardSlashSegments(checkers, coords) ||
        this.checkBackwardSlashSegments(checkers, coords)
      );
    },

    /* Beendet das Spiel, wenn es ein Unentschieden gibt */
    displayDraw() {
      this.status = OVER;
    },

    /* Beendet das Spiel, wenn es einen Gewinner gibt */
    displayWin(winner) {
      this.winner = winner;
      this.status = OVER;
      /* Hier werden die 4 Steine markiert, die das Spiel entschieden haben. */
      this.winner.checkers.forEach(checker => {
        this.setChecker(checker, { isWinner: true });
      });

      /* Diese Funktion prüft, ob ihr die Aufgabe gelöst habt.
         Ihr müsst sie nicht weiter beachten. */
      maybeDone(this).then(i => (this.instructions = i));
    }
  }
};
</script>
