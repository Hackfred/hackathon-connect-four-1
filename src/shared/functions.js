export const range = num => [...Array(num).keys()];
export const key = (row, col) => `${row}${col}`;
export const cssUrl = id => `url(#${id})`;
export const titleize = text =>
  text[0].toUpperCase() + text.slice(1, text.length);
export const min = num => Math.max(num - 3, 0);
export const max = (num, max) => Math.min(num + 3, max);

/* Diese Funktion wird benutzt, um zu prüfen, ob die Aufgabe erfolgreich gelöst wurde */
export const maybeDone = t => {
  async function sha256(message) {
    const msgBuffer = new TextEncoder("utf-8").encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map(b => ("00" + b.toString(16)).slice(-2))
      .join("");
    return hashHex;
  }

  return new Promise(async (resolve, reject) => {
    const msgHash = t.overMessage.substring(0, t.overMessage.indexOf(" "));
    const code =
      Object.values(t.checkers)
        .sort(
          (a, b) => a.row * t.colCount + a.col - (b.row * t.colCount + b.col)
        )
        .reduce((a, b) => {
          console.log(b);
          return a + (b.row + 1) * (b.col + 1) * b.color.displayName.length;
        }, "") + msgHash;
    const s = await sha256(code);
    const p1 = s.substr(0, 8);
    const p2 = s.substr(8, 8);
    console.log(p1, p2);
    if (p2 === "71d486aa") {
      resolve(
        `Gratulations, ihr habt diese Aufgabe gelöst. Ihr bekommt diesen Code: ${p1}`
      );
    } else {
      resolve(t.instructions);
    }
  });
};
