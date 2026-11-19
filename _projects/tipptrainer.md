---
title: "Tipptrainer"
excerpt: "Zehn-Finger-Schreiben üben – mit frei wählbaren Tasten, Fingerfarben und Fortschrittsstatistik."
header:
  teaser: /assets/images/tipptrainer-teaser.svg
  overlay_color: "#6c5ce7"
  actions:
    - label: "Tipptrainer starten"
      url: "/apps/tipptrainer/"
tags: [Lernen, JavaScript]
---

Ein Tipptrainer für das Zehn-Finger-System auf der deutschen QWERTZ-Tastatur.
Er läuft komplett im Browser, braucht keine Anmeldung und speichert nichts auf einem Server.

**[▶ Tipptrainer öffnen]({{ "/apps/tipptrainer/" | relative_url }})**

## Funktionen

- **Tasten frei wählen**: per Klick auf der Bildschirmtastatur oder über Vorlagen wie *Grundstellung*, *Obere Reihe*, *Zahlen* usw.
- **Drei Übungsarten**: ganze deutsche Wörter, Übungssilben oder gemischt – jeweils nur aus den gewählten Tasten.
- **Umfang einstellbar**: Anzahl der Absätze, Zeilen pro Absatz und Zeichen pro Zeile.
- **Farbige Tastatur**: zeigt, welcher Finger welche Taste anschlägt; lässt sich zum blinden Üben ausblenden.
- **Auswertung**: Zeit, Anschläge pro Minute, Fehler, Trefferquote, die häufigsten Problem-Tasten und ein Verlauf der letzten Übungen.

## Technik

Eine einzelne HTML-Datei mit eingebettetem CSS und JavaScript, ohne Abhängigkeiten.
Der Übungsverlauf liegt im `localStorage` des Browsers.

Mehr dazu im Blogpost: [Der Tipptrainer ist online]({% post_url 2026-11-19-tipptrainer-vorgestellt %}).
