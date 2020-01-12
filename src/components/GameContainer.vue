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
import { PLAY, RED, OVER, EMPTY, BLUE } from "../shared/constants.js";
import { titleize, min, max, key, maybeDone } from "../shared/functions.js";

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
      playerColor: BLUE,
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

    /* Wenn diese Methode aufgerufen wird, wird ein neues Spiel gestartet. 
       Damit wird der Zustand des Spiels vollständig zurückgesetzt.
    */
    reset() {
      this.winner = undefined;
      this.isLocked = false;
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

    /* Diese Methode setzt einen Setin auf eine bestimmte Stelle des Spielfelds. */
    setChecker({ row, col }, attrs = {}) {
      const checker = this.getChecker({ row, col });
      return Vue.set(this.checkers, key(row, col), { ...checker, ...attrs });
    },

    getChecker({ row, col }) {
      return this.checkers[key(row, col)] || { row, col, color: "empty" };
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
      if (this.isLocked) return;

      this.isLocked = true;
      const color = this.playerColor;

      /* Das ist eine Test-Ausgabe (ähnlich zu System.out.println("")).
         Man kann diese Ausgaben auf der rechten Seite unter "Console" sehen.
         Sie können helfen, den Ablauf dieses Programms besser zu verstehen.   
      */
      console.log("setting checker", key(row, col), { row, col, color });
      this.setChecker({ row, col }, { color });

      /* Prüft, ob das Spiel beendet wurde */
      this.checkForDraw() || this.checkForWinFrom({ row, col });
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
      }
    },

    /* Prüft, ob das Spiel mit einem Unentschieden beendet wurde. */
    checkForDraw() {
      console.log(
        Object.keys(this.checkers).length === this.rowCount * this.colCount
      );
      if (Object.keys(this.checkers).length === this.rowCount * this.colCount) {
        this.isDraw = true;
      }
    },

    /* Prüft, ob einer der Spieler auf einem Teil des Spielfeldes gewonnen hat.
       Diese Methode wird immer mit einem Array von 4 Spielfeldpositionen aufgerufen.
       Wenn auf diesen 4 Positionen 4 gleichfarbige Steine liegen, gibt diese Methode true zurück, weil dieser Spieler dann gewonnen hat.
    */
    getWinner(...segment) {
      if (segment.length !== 4) return false;
      const checkers = segment.map(([row, col]) =>
        this.getChecker({ row, col })
      );
      const color = checkers[0].color;
      if (color === EMPTY) return false;
      if (checkers.every(c => c.color === color)) return { color, checkers };
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
    checkHorizontalSegments({ focalRow, minCol, maxCol }) {
      for (let row = focalRow, col = minCol; col <= maxCol; col++) {
        const winner = this.getWinner(
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
    checkVerticalSegments({ focalRow, focalCol, minRow, maxRow }) {
      for (let col = focalCol, row = minRow; row <= focalRow; row++) {
        const winner = this.getWinner(
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

      this.winner =
        this.checkHorizontalSegments(coords) ||
        this.checkVerticalSegments(coords) ||
        this.checkForwardSlashSegments(coords) ||
        this.checkBackwardSlashSegments(coords);
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
