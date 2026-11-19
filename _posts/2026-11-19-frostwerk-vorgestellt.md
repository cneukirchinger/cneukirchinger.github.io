---
title: "Frostwerk: Die Eisfabrik muss laufen"
date: 2026-11-19 10:00:00 +0100
excerpt: "Ein kleines Browsergame über Instandhaltung: Wer eine Eisfabrik am Laufen halten will, muss Störungen beheben und sich in SPS, Feldbussen, Antrieben und Security weiterbilden."
categories: [Projekte]
tags: [Frostwerk, Spiel, Automatisierung, JavaScript]
header:
  teaser: /assets/images/frostwerk-halle.jpg
toc: true
toc_label: "Inhalt"
---

Wenn in einer Produktionsanlage eine einzige Maschine stehen bleibt, steht oft die ganze Linie.
Genau dieses Gefühl steckt in meinem neuen Projekt:
**[Frostwerk – Der Instandhalter]({{ "/apps/frostwerk/" | relative_url }})**, ein kleines
Browsergame, das in einer Eisfabrik spielt.

![Titelbildschirm von Frostwerk]({{ "/assets/images/frostwerk-titel.jpg" | relative_url }})

## Worum geht's?

Du bist Instandhalter der Frostwerk Eisfabrik. Sieben Prozessmaschinen und ein Leitstand
machen aus Milch Eiscreme: Rohstoffannahme, Mischer, Pasteurisierer, Homogenisator,
Gefrierzylinder, Abfüllung und Härtetunnel. Solange alles läuft, bringt jede Charge Eis Geld
ein. Sobald aber eine Maschine stört, steht alles still, und die Uhr läuft gegen dich.

![Die Fabrikhalle: oben die Produktionslinie, unten Leitstand und Instandhaltung]({{ "/assets/images/frostwerk-halle.jpg" | relative_url }})

## Sechs Technologien

Jede Störung gehört zu einer von sechs Technologien aus der Automatisierungstechnik:

- SPS & TIA Portal
- PROFINET
- PROFIBUS
- Antriebstechnik
- HMI & SCADA
- Industrial Security

Nicht jede Maschine kann in jeder Technologie ausfallen. Für jede Technologie hast du eine
Skillstufe von 0 bis 5. Je höher die Stufe, desto leichter die Reparatur und desto seltener
fällt die Technik überhaupt aus. Das ist vorbeugende Instandhaltung im Spiel.

## Reparieren per Minispiel

Störungen behebst du in einem von zwei Minispielen:

- **Timing** (PROFINET, PROFIBUS, Antriebe): Den Cursor genau im grünen Bereich stoppen.
- **Code-Sequenz** (SPS, HMI, Security): Eine Pfeilfolge unter Zeitdruck eingeben.

Mit steigendem Skill werden die Zielbereiche größer, die Sequenzen kürzer und die Zeit länger.
Jede selbst behobene Störung bringt einen kleinen Bonus und macht die nächste Schulung in
dieser Technologie günstiger. Ist eine Störung zu schwer, rufst du den Hersteller an. Das kostet,
aber du kannst dich in der Zwischenzeit um die nächste Baustelle kümmern.

## Weiterbilden oder weiterproduzieren?

Die eigentliche Entscheidung im Spiel ist, wann du in Weiterbildung investierst:

- **Online-Kurs** am Terminal: günstig, +1 Stufe, und die Anlage läuft weiter.
- **Präsenzschulung:** +2 Stufen auf einmal, dafür teurer und mit geplantem Stillstand.

Wird das Budget knapp, hilft die Werkleitung: entweder mit einem **Weiterbildungszuschuss**,
wenn du eine Fachfrage richtig beantwortest, oder mit einem **Budgetvorschuss**, der automatisch
aus den Produktionserlösen zurückgezahlt wird.

Hast du alle sechs Technologien auf Stufe 5 gebracht, bist du Meister-Instandhalter. Es gibt ein
Zertifikat mit Statistik und Sternen, je nachdem, wie hoch die Verfügbarkeit der Linie war.

## Technik

Wie schon der [Tipptrainer]({{ "/projects/tipptrainer/" | relative_url }}) kommt Frostwerk ohne
Frameworks und ohne Build-Schritt aus: eine HTML-Datei, ein Stylesheet und ein JavaScript.
Die Halle wird auf einem Canvas gezeichnet. Alle Grafiken entstehen prozedural im Code, es gibt
also keine einzige Bilddatei, und die Soundeffekte erzeugt die WebAudio-API.

## Spielen

👉 **[Schicht beginnen]({{ "/apps/frostwerk/" | relative_url }})**

Steuerung, Spielregeln im Detail und eine Tastenübersicht gibt es auf der
[Projektseite]({{ "/projects/frostwerk/" | relative_url }}).
