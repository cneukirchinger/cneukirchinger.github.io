# FROSTWERK – Der Instandhalter

Ein kleines Browsergame in einer Eisfabrik, präsentiert von **Grollmus**.

Du bist Instandhalter der Frostwerk Eisfabrik. Sieben Prozessmaschinen und ein Leitstand machen aus Milch Eiscreme. Fällt **eine** davon aus, steht die ganze Linie. Behebe Störungen, verdiene mit laufender Produktion Budget und bilde dich in der **Grollmus Akademie** weiter, bis du alle sechs Technologien gemeistert hast.

## Starten

Keine Installation und keine Abhängigkeiten. Öffne einfach `index.html` im Browser.
Alternativ startest du einen lokalen Server:

```bash
python3 -m http.server 8000   # dann http://localhost:8000
```

## Steuerung

| Taste | Aktion |
|---|---|
| Pfeiltasten / WASD | Bewegen, im Code-Minispiel Richtungen eingeben |
| E / Leertaste | Interagieren, im Timing-Minispiel auslösen |
| H | Störungsdialog: Hersteller des Anlagenteils anrufen |
| 1 – 3 | Fachgespräch: Antwort wählen |
| Esc | Dialog schließen / Minispiel abbrechen / Pause |
| P · M | Pause · Ton an/aus |
| Mausklick in die Halle | Hinlaufen, bei Objekten automatisch interagieren |

### Smartphone & Tablet

Das Spiel läuft im Querformat (im Hochformat erscheint ein Hinweis zum Drehen). Beim Start wird – wo vom Browser unterstützt – in den Vollbildmodus gewechselt.

| Geste | Aktion |
|---|---|
| Daumen auf die Halle legen und ziehen | Bewegen (virtueller Joystick) |
| Objekt oder Stelle antippen | Hinlaufen, bei Objekten automatisch interagieren |
| ✋-Button unten rechts | Interagieren / Online-Kurs pausieren |
| ❚❚-Button oben rechts | Pause |
| Buttons im Minispiel | „Jetzt!“ (Timing) bzw. Pfeil-Buttons (Code-Sequenz) |

Auf kleinen Displays werden HUD, Skill-Leiste und Dialoge automatisch vergrößert dargestellt.

## Spielprinzip

- **Anlage:** Rohstoffannahme → Mischer → Pasteurisierer → Homogenisator → Gefrierzylinder → Abfüllung → Härtetunnel, dazu der Leitstand (SCADA). Jede Maschine kann nur in bestimmten Technologien stören.
- **Technologien (Skills 0–5):** SPS & TIA Portal, PROFINET, PROFIBUS, Antriebstechnik, HMI & SCADA, Industrial Security.
- **Störungen beheben:** Je nach Technologie gibt es eines von zwei Minispielen.
  - *Timing* (PROFINET, PROFIBUS, Antriebe): Den Cursor im grünen Bereich stoppen.
  - *Code-Sequenz* (SPS, HMI, Security): Die Pfeilfolge auf Zeit eingeben.

  Ein höherer Skill bedeutet größere Zielbereiche, kürzere Sequenzen, mehr Zeit und weniger Ausfälle in dieser Technologie (vorbeugende Instandhaltung).
- **Reparaturbonus:** Jede selbst behobene Störung bringt einen kleinen Geldbonus: €10 + €10 × Skillstufe der Technologie + €5 × Schweregrad. Der Betrag steht vorab im Störungsdialog.
- **Keine Störungen während einer Reparatur:** Solange du selbst reparierst (Minispiel), entstehen keine neuen Störungen. Während der Herstellerservice arbeitet, können weiterhin Störungen auftreten. Nach Abschluss gibt es 3 s Schonfrist, dann können Maschinen wieder ausfallen.
- **Herstellerservice:** Für zu schwere Störungen rufst du den Hersteller des Anlagenteils an. Jede Maschine hat einen eigenen, fiktiven Hersteller. Das kostet Geld, und der Servicetechniker behebt die Störung, während du dich um anderes kümmerst.
- **Grollmus Akademie** (Terminal im Büro):
  - 💻 **Online:** günstig, +1 Stufe. Du lernst am Terminal, und die Anlage läuft weiter. Du kannst den Kurs jederzeit pausieren und fortsetzen.
  - 🏫 **Präsenz:** +2 Stufen auf einmal. Dafür teurer, und die Anlage geht in einen geplanten Stillstand.
- **Werkleitung** (oben links in der Halle): Wenn die Linie steht und kein Geld reinkommt, die Schulung aber nicht warten soll, gibt es zwei Wege zu Budget:
  - 🎓 **Weiterbildungszuschuss:** Ein Fachgespräch, also eine Quizfrage zu einer der sechs Technologien. Bei richtiger Antwort gibt es einen nicht rückzahlbaren Zuschuss, danach ist 90 s Pause. Bei falscher Antwort beträgt die Sperre 45 s.
  - 💶 **Budgetvorschuss:** Den Betrag gibt es sofort. Zurückgezahlt werden 110 %, automatisch mit 50 % der Produktionserlöse. Es kann immer nur ein Vorschuss offen sein.

  Beide Beträge steigen mit deinem Gesamtlevel. Steht die Linie und reicht das Budget nicht, weist dich ein Hinweis auf die Werkleitung hin.
- **Praxisrabatt:** Jede selbst behobene Störung gibt −5 % auf die nächste Schulung dieser Technologie (max. −25 %).
- **Ende:** Sind alle sechs Technologien auf Stufe 5, gibt es das Grollmus-Akademie-Zertifikat „Meister-Instandhalter“ mit Statistik und Sternebewertung nach Linienverfügbarkeit. Die Bestzeit wird lokal gespeichert.

## Anpassen

- Das Balancing (Erlöse, Kurskosten, Störungsrate, Herstellerservice, Zuschuss, Vorschuss …) steht im Objekt `CFG` am Anfang von [game.js](game.js).
- Störungstexte, Grollmus-Tipps und Fachfragen der Werkleitung stehen in `FAULTS`, `TIPS` und `QUIZ`. Bei `QUIZ` ist die erste Antwort jeweils die richtige; die Reihenfolge wird im Spiel gemischt.
- Die Herstellernamen (`maker` in `MACHINES`) sind frei erfunden.
- Die Sponsorfarbe ist `--grollmus` in [style.css](style.css). Bitte vor einer Veröffentlichung mit dem Corporate Design abgleichen. Das Logo ist aktuell nur eine Text-Wortmarke, und die Sponsortexte sind Platzhalter, die Marketing freigeben sollte.

## Dateien

- `index.html`: Seite und HUD
- `style.css`: Gestaltung von HUD, Dialogen, Minispielen und Zertifikat
- `game.js`: Spiellogik und Canvas-Rendering, alle Grafiken prozedural, Sound über WebAudio
