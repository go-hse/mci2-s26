// 1. Hilfsfunktionen (Utilities)
const erzeugeId = () => Math.random().toString(36).substr(2, 9);
const datumFormatieren = (datum) => new Intl.DateTimeFormat('de-DE').format(datum);

// 2. Datenmodell (Klasse)
class Aufgabe {
    constructor(titel, prioritaet = 'normal') {
        this.id = erzeugeId();
        this.titel = titel;
        this.prioritaet = prioritaet;
        this.erstelltAm = new Date();
        this.erledigt = false;
    }

    abschliessen() {
        this.erledigt = true;
        console.log(`Aufgabe "${this.titel}" wurde erledigt.`);
    }
}

// 3. Initiale Daten
const startAufgaben = [
    { titel: "Einkaufen", prio: "hoch" },
    { titel: "JS Module lernen", prio: "kritisch" }
];

// 4. Hauptlogik / App-Steuerung
const aufgabenListe = startAufgaben.map(a => new Aufgabe(a.titel, a.prio));

console.log("--- Aktuelle Aufgaben ---");
aufgabenListe.forEach(a => {
    const datum = datumFormatieren(a.erstelltAm);
    console.log(`[${datum}] ${a.titel} (Prio: ${a.prioritaet})`);
});

aufgabenListe[0].abschliessen();