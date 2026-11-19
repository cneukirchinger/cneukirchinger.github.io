---
title: "Frostwerk – Der Instandhalter"
excerpt: "Browsergame in einer Eisfabrik: Störungen beheben, Budget verdienen und sich in sechs Automatisierungs-Technologien zum Meister-Instandhalter hocharbeiten."
header:
  teaser: /assets/images/frostwerk-halle.jpg
  overlay_image: /assets/images/frostwerk-halle.jpg
  overlay_filter: 0.6
  actions:
    - label: "Frostwerk spielen"
      url: "/apps/frostwerk/"
tags: [Spiel, Automatisierung, JavaScript]
---

Du bist Instandhalter in der Frostwerk Eisfabrik. Sieben Prozessmaschinen und ein Leitstand
machen aus Milch Eiscreme. Fällt **eine** davon aus, steht die ganze Linie.

**[▶ Frostwerk spielen]({{ "/apps/frostwerk/" | relative_url }})**

![Die Fabrikhalle mit der Produktionslinie von der Rohstoffannahme bis zum Härtetunnel]({{ "/assets/images/frostwerk-halle.jpg" | relative_url }})

## Spielprinzip

- **Die Anlage:** Rohstoffannahme → Mischer → Pasteurisierer → Homogenisator → Gefrierzylinder →
  Abfüllung → Härtetunnel, dazu der Leitstand (SCADA).
- **Sechs Technologien:** SPS & TIA Portal, PROFINET, PROFIBUS, Antriebstechnik, HMI & SCADA und
  Industrial Security, jeweils mit Stufe 0 bis 5.
- **Störungen beheben** in zwei Minispielen: *Timing* (Cursor im grünen Bereich stoppen) oder
  *Code-Sequenz* (Pfeilfolge auf Zeit eingeben). Ein höherer Skill bedeutet einfachere Reparaturen
  und seltenere Ausfälle.
- **Herstellerservice:** Zu schwere Störungen kann ein Servicetechniker beheben. Das kostet Geld,
  aber du kannst dich währenddessen um andere Maschinen kümmern.
- **Akademie:** Online-Kurse am Terminal (+1 Stufe, die Anlage läuft weiter) oder Präsenzschulung
  (+2 Stufen, dafür geplanter Stillstand).
- **Werkleitung:** Wenn das Geld knapp wird, gibt es einen Weiterbildungszuschuss für eine richtig
  beantwortete Fachfrage oder einen Budgetvorschuss.
- **Ziel:** Alle sechs Technologien auf Stufe 5. Am Ende gibt es ein Zertifikat mit Statistik und
  einer Sternebewertung nach Linienverfügbarkeit.

## Steuerung

| Taste | Aktion |
| --- | --- |
| Pfeiltasten / WASD | Bewegen, im Code-Minispiel Richtungen eingeben |
| E / Leertaste | Interagieren, im Timing-Minispiel auslösen |
| H | Im Störungsdialog den Hersteller anrufen |
| 1 – 3 | Antwort im Fachgespräch wählen |
| Esc | Dialog schließen, Minispiel abbrechen, Pause |
| P · M | Pause · Ton an/aus |

## Technik

Reines HTML, CSS und JavaScript ohne Abhängigkeiten. Die Fabrikhalle wird auf einem Canvas
gezeichnet, alle Grafiken entstehen prozedural im Code, die Töne erzeugt die WebAudio-API.
Die Bestzeit wird lokal im Browser gespeichert.

Mehr dazu im Blogpost: [Frostwerk: Die Eisfabrik muss laufen]({% post_url 2026-11-19-frostwerk-vorgestellt %}).
