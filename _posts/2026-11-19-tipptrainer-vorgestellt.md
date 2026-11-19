---
title: "Der Tipptrainer ist online"
date: 2026-11-19 09:00:00 +0100
excerpt: "Ein kleiner Browser-Tipptrainer zum Üben des Zehn-Finger-Systems – mit selbst gewählten Tasten, Fingerfarben und Statistik."
categories: [Projekte]
tags: [Tipptrainer, Lernen, JavaScript]
header:
  teaser: /assets/images/tipptrainer-teaser.svg
toc: true
toc_label: "Inhalt"
---

Zehn-Finger-Schreiben lernt man nicht durch Lesen, sondern durch Tippen – und zwar am besten mit
genau den Tasten, die man gerade übt. Genau dafür habe ich einen kleinen
**[Tipptrainer]({{ "/apps/tipptrainer/" | relative_url }})** gebaut, der direkt im Browser läuft.

## Die Idee

Viele Tipptrainer geben feste Lektionen vor. Ich wollte etwas, bei dem man selbst bestimmt,
welche Tasten drankommen: zuerst nur die Grundstellung `asdf jklö`, dann `g` und `h` dazu,
später die obere Reihe und so weiter. Der Übungstext wird jedes Mal neu aus genau diesen
Tasten zusammengesetzt.

## So funktioniert's

Das Üben läuft in vier Schritten:

1. **Tasten auswählen** – per Klick auf der Bildschirmtastatur oder mit einer Vorlage wie
   *Grundstellung*, *+ G H*, *Obere Reihe*, *Untere Reihe*, *Zahlen* oder *Satzzeichen*.
   Wer ⇧ dazunimmt, übt auch Großbuchstaben.
2. **Übungsart wählen** – ganze deutsche Wörter, Übungssilben oder eine Mischung aus beidem.
   Es kommen nur Wörter vor, die sich mit den gewählten Tasten tatsächlich tippen lassen.
3. **Umfang festlegen** – Absätze, Zeilen pro Absatz und Zeichen pro Zeile. Eine Vorschau zeigt,
   wie eine Zeile ungefähr aussehen wird.
4. **Tastatur ein- oder ausblenden** – am Anfang hilft die farbige Tastatur, später übt man
   besser blind.

Dann heißt es: *Los geht's!*

## Die farbige Tastatur

Jede Taste ist in der Farbe des Fingers eingefärbt, der sie anschlägt – vom kleinen Finger
über Ring-, Mittel- und Zeigefinger bis zum Daumen auf der Leertaste. Beim Üben wird die
nächste Taste hervorgehoben, sodass man nicht auf die echte Tastatur schauen muss.

## Auswertung

Nach jeder Übung gibt es eine Zusammenfassung:

- benötigte **Zeit** und **Anschläge pro Minute**,
- Anzahl der **Fehler** und der Anteil **richtig getippter** Zeichen,
- die Tasten, bei denen es **die meisten Fehler** gab – ideal, um sie gezielt nachzuüben,
- ein Verlauf der **letzten Übungen**, damit man den eigenen Fortschritt sieht.

Der Verlauf wird nur lokal im Browser gespeichert (`localStorage`). Es gibt keine Anmeldung
und keine Daten, die irgendwohin geschickt werden.

## Technik

Der ganze Tipptrainer ist eine einzige HTML-Datei mit eingebettetem CSS und JavaScript – ohne
Frameworks und ohne Build-Schritt. Damit lässt er sich einfach hier auf GitHub Pages ausliefern
oder auch offline nutzen: Datei herunterladen, im Browser öffnen, fertig.

## Ausprobieren

👉 **[Zum Tipptrainer]({{ "/apps/tipptrainer/" | relative_url }})**

Weitere Infos gibt es auf der [Projektseite]({{ "/projects/tipptrainer/" | relative_url }}).
Viel Spaß beim Tippen!
