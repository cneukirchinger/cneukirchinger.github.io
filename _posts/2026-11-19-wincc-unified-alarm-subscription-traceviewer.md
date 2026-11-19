---
title: "WinCC Unified: Auf Alarme reagieren und JavaScript mit dem Traceviewer debuggen"
date: 2026-11-19 11:00:00 +0100
excerpt: "Warum ein Bit, das anstehende Störungen anzeigen soll, dauerhaft auf 0 blieb, und wie der Traceviewer den Fehler in einer einzigen Zeile JavaScript verraten hat."
categories: [Automatisierung]
tags: [WinCC Unified, TIA Portal, JavaScript, Alarme, Debugging]
toc: true
toc_label: "Inhalt"
---

Vor Kurzem erreichte mich eine Anfrage zu einem Projekt, das nach WinCC Unified migriert
worden war. Die Aufgabe klang einfach: Sobald eine Störmeldung ansteht, soll in der Kopfzeile
die Meldeleiste und ein Warnsymbol eingeblendet werden. Das Skript dafür stammte aus der
Siemens Template Suite. Trotzdem blieb das Bit, das die Anzeige steuert, **dauerhaft auf 0**.

Die Ursache war am Ende eine einzige fehlende Deklaration. Der Fall eignet sich gut, um drei
Dinge zu zeigen: dass in WinCC Unified jetzt JavaScript die Skriptsprache ist, wie man mit einer
Alarm Subscription auf Meldungen reagiert und wie man solche Fehler mit dem Traceviewer findet.

## JavaScript statt VBScript

Wer aus WinCC Comfort/Advanced oder WinCC Professional kommt, kennt VBScript bzw. C-Skripte.
WinCC Unified setzt stattdessen auf **JavaScript**. Für Umsteiger ist das eine echte
Umstellung: Die Sprache verhält sich in vielen Details anders, etwa beim Gültigkeitsbereich
von Variablen, beim asynchronen Arbeiten mit Promises (`.then()` / `.catch()`) oder eben bei
der Frage, ob eine Variable deklariert sein muss.

Der Zugriff auf die Runtime läuft über das Objekt `HMIRuntime`, Variablen liest und schreibt
man über `Tags("Name")`. Die Skripte eines Bildes legt WinCC Unified als JavaScript-Module ab,
erkennbar am `export function …` vor jeder Ereignisfunktion. Das wird gleich noch wichtig.

## Auf Alarme reagieren: die Alarm Subscription

Wer im Skript mitbekommen will, dass Meldungen kommen oder gehen, muss nicht zyklisch pollen.
Stattdessen abonniert man die Meldungen:

1. `HMIRuntime.Alarming.CreateSubscription()` legt ein Abonnement an.
2. Über `Filter` und `Language` legt man fest, welche Meldungen in welcher Sprache geliefert
   werden. Ein leerer Filter bedeutet: alle Meldungen.
3. In `OnAlarm` hinterlegt man eine Funktion, die bei jeder Änderung aufgerufen wird.
4. `Start()` aktiviert das Abonnement.

Das Skript aus der Template Suite hängt am Ereignis *Geladen* eines Bildes. Es fragt
beim Bildaufbau einmal die aktiven Meldungen ab und aktualisiert danach bei jeder
Meldungsänderung die Variable `AlarmVisible`:

```javascript
export function Bild_OnLoaded(item) {
  sub = HMIRuntime.Alarming.CreateSubscription();   // ← hier knallt es
  sub.Filter = "";
  sub.Language = HMIRuntime.Language;

  // Initialabfrage beim Bildaufbau
  HMIRuntime.Alarming.GetActiveAlarms(HMIRuntime.Language)
    .then((alarms) => Tags("AlarmVisible").Write(alarms.length > 0))
    .catch((err) => Tags("AlarmVisible").Write(false));

  // Bei jeder Meldungsänderung neu bewerten
  sub.OnAlarm = (errorCode, systemName, alarmResultArray) => {
    HMIRuntime.Alarming.GetActiveAlarms(HMIRuntime.Language)
      .then((alarms) => Tags("AlarmVisible").Write(alarms.length > 0))
      .catch((err) => Tags("AlarmVisible").Write(false));
  };

  sub.Start();
}
```

Auf den ersten Blick sieht das plausibel aus. In der Runtime passiert aber nichts.

## Fehlersuche mit dem Traceviewer

Wenn ein Skript in WinCC Unified scheitert, gibt es auf dem Bildschirm meistens **keine
Fehlermeldung**. Das Skript bricht einfach ab. Der erste Griff geht deshalb zum
**Traceviewer** (*WinCC Unified RT Trace Viewer*), der mit der Runtime installiert wird. Er
zeigt die Trace-Ausgaben der Runtime live an, darunter auch alle Fehler der Script Engine.

Beim Nachstellen des Projekts stand dort sofort Folgendes:

![Traceviewer-Ausgabe: Uncaught ReferenceError: sub is not defined in Events.js, Zeile 7]({{ "/assets/images/wincc-unified-traceviewer-referenceerror.png" | relative_url }})

Die Meldung verrät alles, was man braucht:

- **Wo:** im Bildmodul `Events.js`, Funktion `…_OnLoaded`, Zeile 7, Spalte 7.
- **Was:** `Uncaught ReferenceError: sub is not defined`.
- **Welche Zeile:** Der Trace zitiert sie direkt: `sub = HMIRuntime.Alarming.CreateSubscription();`

Der Bildname `AlarmVisible` in der Ausgabe stammt aus meinem Testprojekt.

Ein kleiner Tipp am Rande: Mit `HMIRuntime.Trace("…")` kann man aus eigenen Skripten Ausgaben
in denselben Trace schreiben. Das ist das `console.log` von WinCC Unified und oft der schnellste
Weg, um zu sehen, ob und mit welchen Werten ein Skript überhaupt läuft.

## Die Ursache: eine nicht deklarierte Variable

`sub` wird zugewiesen, aber nirgends mit `let`, `const` oder `var` deklariert. In einem
klassischen Browser-Skript würde JavaScript in diesem Fall stillschweigend eine globale
Variable anlegen. JavaScript-**Module** laufen aber immer im *Strict Mode*, und dort ist die
Zuweisung an eine nicht deklarierte Variable ein Fehler.

Weil der Fehler gleich in der **ersten Zeile** der Funktion auftritt, bricht das komplette
Skript ab. Die Initialabfrage läuft nie, `OnAlarm` wird nie zugewiesen, und `Start()` wird
nie aufgerufen. Niemand schreibt also jemals auf `AlarmVisible`, und das Bit bleibt auf 0.

Vermutlich stand die Deklaration ursprünglich im globalen Definitionsbereich der Vorlage und
ist beim Aufräumen des Projekts verloren gegangen.

## Die Lösung

Es gibt zwei Wege, je nachdem, wie lange die Subscription leben soll.

**Lokal deklarieren**, direkt in der Funktion:

```javascript
let sub = HMIRuntime.Alarming.CreateSubscription();
```

**Global deklarieren**, im globalen Definitionsbereich der Skripte. Das ist sinnvoll, wenn die
Subscription länger erhalten bleiben soll, etwa über einen Bildwechsel hinweg, oder wenn sie
aus einem anderen Ereignis wieder mit `sub.Stop()` beendet werden soll:

```javascript
// Globaler Definitionsbereich
let sub;
```

```javascript
export function Globales_Bild_OnLoaded(item) {
  sub = HMIRuntime.Alarming.CreateSubscription();
  // … Rest wie oben
}
```

Mit einer der beiden Änderungen läuft das Skript durch, und die Meldeleiste erscheint, sobald
eine Störung ansteht.

## Fazit

- WinCC Unified spricht **JavaScript**, und zwar als Module im Strict Mode. Variablen müssen
  deklariert werden, sonst bricht das Skript mit einem `ReferenceError` ab.
- Mit einer **Alarm Subscription** reagiert man ereignisgesteuert auf kommende und gehende
  Meldungen, ganz ohne zyklisches Abfragen.
- Wenn „einfach nichts passiert“, lohnt sich zuerst ein Blick in den **Traceviewer**. Er
  nennt Datei, Funktion, Zeile und Fehlertyp, in diesem Fall die Lösung in einer Zeile.
