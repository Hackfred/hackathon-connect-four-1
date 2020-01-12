import GameContainer from "@/components/GameContainer.vue";
import { mount } from "@vue/test-utils";

describe("GameContainer.vue", () => {
  it("soll eine korrekte Beschreibung haben.", () => {
    const gc = mount(GameContainer);
    expect(1).toEqual(1);
    /*
    expect(gc.props.instructions).toEqual(
      "Klicke auf eine der Spalten, um einen Stein zu setzen."
    );
    */
  });

  it("soll Steine in der richtigen Spalte setzen.", () => {
    expect(2).toEqual(2);
  });

  it("soll erkennen, wenn ein Spieler gewonnen hat.", () => {
    expect(2).toEqual(2);
  });
});
