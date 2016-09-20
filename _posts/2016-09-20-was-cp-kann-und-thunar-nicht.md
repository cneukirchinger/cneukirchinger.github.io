---
layout: post
title:  "Was cp kann und Thunar nicht"
date:   2016-09-20s 07:00:00 +0200
categories: linux cp thunar lubuntu
comments: true
author: "Christian"
---

Der Titel ist etwas unfair gewählt, weil ich hier Äpfel mit Birnen vergleiche. Auf meinem Rechner nutze ich Lubuntu 16.04 und dort kommt als Dataimanager "Thunar" zum Einsatz. Bei der Zusammenführung von mehreren Fotoarchiven ist mir aufgefallen, dass Thunar gleichnamige Dateien entweder überschreibt oder überspringt. Leider kann Thunar kein Suffix hinzufügen und die doppelte Datei trotzdem abspeichern. Aber mit Hilfe von cp im Terminal habe ich die Archive doch wieder vollständig zusammenführen können.

Nach einer kurzen Google-Suche bin ich auf [askubuntu.com][askubuntu-cp] fündig geworden. Thunar unterstützt die Erstellung von Duplikaten leider nicht. Aber der Kopierbefehl cp hat einen Parameter der konfiguriert wie mit doppelten Dateien umgegangen werden soll `--backup`. Die Werte für den Parameter lauten folgendermaßen:

* `none, off`: keine Backups erstellen (selbst wenn `--backup` als Parameter gegeben ist)
* `numbered, t`: nummerierte Backups erstellen
* `existing, nil`: Backups nummeriert erstellen wenn vorhanden, ansonsten einfache Backups anlegen
* `simple, never`: immer einfache Backups erstellen

Als Beispiel hat der folgende Kopierbefehl zwei Fotoverzeichnisse zusammengeführt und mir die Duplikate dabei erhalten:

{% highlight bash %}
cp --backup=existing ~/Fotos1/* ~/Fotos2
{% endhighlight %}

[askubuntu-cp]: http://askubuntu.com/questions/538913/how-can-i-copy-files-with-duplicate-filenames-into-one-directory-and-retain-both
