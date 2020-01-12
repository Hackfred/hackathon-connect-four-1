/*
  In dieser Dabei wird das Verhalten der kleinsten Einheit des Spiels, eines einzelnen Spielsteins, festgelegt.
  Aus diesem einzelnen Spielstein wird dann in BoardColumn.vue eine Spalte und in GameBoard.vue das gesamte Spielfeld zusammengesetzt.
  Hier wird z.B auch die Fallanimation programmiert, die den Stein von oben nach unten ins Feld fallen lässt.
*/
<template>
  <transition @enter="enter" :css="false">
    <circle :cx="centerX" :cy="centerY" :r="checkerRadius" :fill="color" :fill-opacity="opacity"/>
  </transition>
</template>
  
<script>
import { OVER } from "../shared/constants.js";
import { Bounce } from "gsap";
import { TweenMax } from "gsap";

export default {
  name: "BoardChecker",
  props: ["checker", "cellSize", "rowCount", "checkerRadius", "status"],

  computed: {
    row() {
      return this.checker.row;
    },
    col() {
      return this.checker.col;
    },
    color() {
      return this.checker.color.value;
    },
    isWinner() {
      return this.checker.isWinner;
    },
    opacity() {
      return this.status === OVER && !this.isWinner ? 0.25 : 1.0;
    },

    centerX() {
      return this.cellSize / 2;
    },

    centerY() {
      return this.cellSize / 2 + this.cellSize * (this.rowCount - 1 - this.row);
    },

    fromY() {
      return -1 * (this.centerY + this.cellSize);
    },

    destY() {
      return 0;
    },

    percentage() {
      return (this.rowCount - this.row) / this.rowCount;
    },

    duration() {
      return 0.2 + 0.4 * this.percentage;
    }
  },

  methods: {
    enter(el, done) {
      const fromParams = { y: this.fromY };
      const destParams = {
        y: this.destY,
        ease: Bounce.easeOut,
        onComplete: () => {
          this.$emit("land");
          done();
        }
      };

      return TweenMax.fromTo(el, this.duration, fromParams, destParams);
    }
  }
};
</script>