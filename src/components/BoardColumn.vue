/* BoardColumn.vue baut eine Spalte des Spielfelds auf, indem es BoardChecker.vue benutzt.
   Im template-Bereich werden dazu mehrere leere Kreise aufeinander gesetzt, um eine Spalte zu bilden (v-for="checker in checkers")
*/
<template>
  <svg :x="col * cellSize" y="0">
    <g @click="drop(col)" class="column">
      <board-checker
        v-for="checker in checkers"
        :key="key(checker)"
        :checker="checker"
        :cellSize="cellSize"
        :rowCount="rowCount"
        :checkerRadius="checkerRadius"
        :status="status"
        @land="land"
      ></board-checker>
      <rect
        :class="status"
        :key="col"
        :col="col"
        :width="cellSize"
        :height="boardHeight"
        :fill="color"
        :fill-opacity="opacity"
        :mask="mask"
      ></rect>
    </g>
  </svg>
</template>

<script>
import BoardChecker from "./BoardChecker.vue";
import { OVER } from "../shared/constants.js";

export default {
  name: "BoardColumn",
  props: [
    "checkers",
    "col",
    "color",
    "cellSize",
    "boardHeight",
    "checkerRadius",
    "rowCount",
    "mask",
    "status"
  ],

  components: {
    BoardChecker
  },

  computed: {
    /* Hier wird die unterste Zeile einer Spalte bestimmt, in der noch kein Stein liegt.
       In diese Zeile wird dann der neue Stein gelegt.
    */
    nextOpenRow() {
      return Math.max(...this.checkers.map(c => c.row).concat(-1)) + 1;
    },

    /* Wenn das Spiel beendet wurde, wird der Hintergrund leicht durchsichtig gemacht */
    opacity() {
      return this.status === OVER ? 0.2 : 1.0;
    }
  },

  methods: {
    key({ row, col }) {
      return `${row}${col}`;
    },

    land() {
      this.$emit("land");
    },

    drop(col) {
      console.log("dropping", col);
      const row = this.nextOpenRow;

      if (row < this.rowCount) {
        this.$emit("drop", { row, col });
      } else {
        console.log("cannot drop", { row, col });
      }
    }
  }
};
</script>