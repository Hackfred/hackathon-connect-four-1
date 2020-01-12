/* 
  App.vue ist das Haupt-File, in der unser Spielfeld gestartet wird.
  Außer App.vue gibt es noch vier andere Files, in denen die der Code für dieses Spiel aufgeteilt ist.
  Diese liegen im Ordner /components und haben alle die Endung .vue.
  Vue ist das JavaScript Framework, mit dem dieses Spiel geschrieben wurde.
  Änderungen zur Lösung dieser Aufgabe müssen nur in GameContainer.vue gemacht werden, alle anderen Dateien enthalten keine Fehler.
  Im Ordner /shared liegen noch ein paar allgemeine Funktionen und Konstanten, die für diese Aufgabenstellung aber nicht von Bedeutung sind.

  Hier noch eine paar kurze Erklärungen zum folgenden Code, die euch helfen können:
  1. Im Code haben wir immer wieder kurze Kommentare geschrieben, die erklären, was hier passiert.
     Kommentare erkennt ihr so: /* Das ist ein Kommentar */
  2. Der Aufbau der .vue Files ist immer gleich:
     a) Template-Definition: Hier wird das Grundgerüst für die Benutzeroberfläche gebaut (bei uns ist das das Viergewinnt-Spielfeld)
        Dieser Bereich wird immer von einem template-tag umschlossen.
     b) Skript-Definition: Hier wird die Logik definiert, die unser Programm dynamisch macht. Bei uns sind das z.B. die Spielregeln von Vier-Gewinnt.
        Dieser Bereich wird immer von einem script-tag umschlossen.  
     c) Style-Definition: Hier wird bestimmt, wie unsere Benutzeroberfläche aussehen wird. So werden Farben und Schriftgrößen, aber auch Animationen festgelegt.
        Dieser Bereich wird immer von einem style-tag umschlossen.
  3. Vielleicht hast du bisher noch nie JavaScript, HTML und CSS gelesen. Keine Sorge, das ist kein Problem.
     Den größten Teil des Codes kann man sehr einfach verstehen, manchmal kann aber ein Englisch-Wörterbuch helfen ;)
     Ihr könnte diesen Code beliebig verändern und so ruhig ausprobieren, was sich am Spiel ändert, wenn ihr eine Zeile Code austauscht.
     Eure Änderungen werden sofort übernommen, indem das Spiel auf der rechten Seite neu geladen wird.
     Wenn ihr zum Ausgangszustand der Aufgabe zurückkehren wollt, schließt ganz einfach dieses Fenster und öffnet den Link aus dem Aufgabenblatt neu.
     Dadurch werden alle eure Änderungen zurückgesetzt.
 */

/* Template-Definition (HTML)
   Der h2-tag definiert eine Überschrift (Vier gewinnt).
   Der GameContainer-tag ist ein Platzhalter, der auf die Template-Definition von Gamecontainer.vue verweißt.
*/
<template>
  <div id="app">
    <h2>Vier gewinnt</h2>
    <GameContainer></GameContainer>
  </div>
</template>

/* Skipt-Definition 
   Hier werden die anderen vier .vue-Files aus /components importiert.
   Das muss in App.vue, der Hauptdatei passieren, damit das Spiel funktioniert. 
   Die Bedeutung dieser Files wird in der jeweiligen Datei erklärt.
*/
<script>
import GameContainer from "./components/GameContainer";
import GameBoard from "./components/GameBoard";
import BoardColumn from "./components/BoardColumn";
import BoardChecker from "./components/BoardChecker";

export default {
  name: "App",
  components: {
    GameContainer,
    GameBoard,
    BoardChecker,
    BoardColumn
  }
};
</script>

/* Style-Definition 
   Ihr könnt hier testweise ein paar der Werte verändern. 
   Dann seht ihr, wie diese das Aussehen des Spielfelds beeinflussen.
   Denkt daran: Ihr könnt eure Änderungen jederzeit zurücksetzen, indem ihr den Link der Aufgabenstellung neu öffnet.
*/
<style>
body {
  /* Hintergrund das Spielfelds*/
  background-color: azure;
}

a {
  text-decoration: none;
}

.logo h3 {
  margin: 0;
}

.game-board {
  border: 5px cadetblue solid;

  width: 350px;
  margin: 0 auto;
}

.column {
  cursor: pointer;
}

.column rect.play:hover {
  fill-opacity: 0.75;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
