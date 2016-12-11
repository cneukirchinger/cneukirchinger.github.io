---
layout: post
title:  "Alte PHP-Projekte und PHP7"
date:   2016-12-11 07:00:00 +0200
categories: php
comments: false
author: "Christian"
---

Eines meiner ersten PHP-Projekte war ein Frontend für eine DVD-Datenbank meines Vaters. Vor sechs Jahren hat das simple PHP-Skript die Daten aus einer MySQL-Datenbank geholt und im Browser angezeigt. Der Server auf dem die Applikation lief wurde nun von Debian auf Ubuntu aktualisiert und nun läuft PHP7 als Standard PHP-Interpreter. Die Folge: Das Skript läuft nicht mehr! Interessanterweise gab es mehrere Stellen zu ändern, damit das Frontend wieder so läuft wie vor sechs Jahren.

# PHP7 im userdir von apache2
Auf unserem Server hat jeder Benutzer sein public_html-Verzeichnis wo jeder seine Projekte laufen lassen kann. Standardmäßig 
