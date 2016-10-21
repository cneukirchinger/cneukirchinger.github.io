---
layout: post
title:  "SQL Snippets"
date:   2016-10-20 07:00:00 +0200
categories: sql sqlite
comments: true
author: "Christian"
---

In letzter Zeit habe ich es immer wieder mit größeren Datenmengen zu tun. Die Auswertung von 1,5GB großen Excel Tabellen macht irgendwann keinen Spass mehr. Darum spiele ich die Daten in eine [sqlite-Datenbank][sqlite] ein und werte über einfache Abfragen meine Daten aus. Das geht zum Teil schneller und ich kann wesentlich größere Datenmengen verarbeiten. Währendessen bin ich auf einige nützliche Konstrukte gestoßen, die ich hier kurz vorstellen möchte. Es geht um die Entfernung von doppelten Datensätzen und die Auswertung von Minima und Maxima von Datensätzen. Dabei nutze ich den [DB Browser for SQLite][dbbrowsersqlite] für die Konvertierung und Abfrage der Daten.

# Duplikate entfernen
Wenn in einer Tabelle doppelte Einträge vorhanden sind, können diese mit folgendem Befehl gelöscht werden. Dank [StackOverflow][so-delete-duplicates] habe ich schnell eine entsprechende Abfrage gefunden. Dabei verbleibt der erste Eintrag in der Datenbank. Das ganze geschieht mit Hilfe der Eigenschaft [`rowid`][sqlite-rowid] von sqllite. Wenn Datensätze komplett identisch sind und kein eindeutiger primärer Schlüssel existiert, kann sqlite trotzdem die einzelnen Datensätze mittel der internen `rowid` unterscheiden. Bei der Abfrage werden alle Spalten gruppiert und dann die niedrigste `rowid` ausgewählt. Die restlichen Einträge werden dann gelöscht.

{% highlight sql %}
DELETE FROM anschluesse
WHERE
  rowid NOT IN
  (
    SELECT MIN(rowid)
    FROM table
    GROUP BY
      column1,
      column2,
      ...
  )
{% endhighlight %}

# MIN(), MAX() von Textwerten
Diese Abfrage behandelt gleich zwei Themen. Aus einer Liste mit vielen Datenpunkten möchte ich den jeweilgen maximalen und minimalen Wert erhalten. Aber die Werte liegen nicht als Zahl vor, sondern als Text. Damit sqlite sie als Zahlen vergleichen kann, müssen sie umgewandelt werden. Zunächst wird das Komma durch einen Punkt mit Hilfe des [`REPLACE`][sqlite-replace] Befehls ausgetauscht. Dann kann mit [`CAST`][sqlite-cast] der Typ des Werts umgewandelt werden. In diesem Fall geschieht die Umwandlung in eine Gleitkommazahl `float`. Schließlich wird die Abfrage gruppiert und mit [`MIN`][sqlite-min] und [`MAX`][sqlite-max] die entsprechende Werte ermittelt. Die Tabelle beschreibt ein kleines Beispiel der Daten für die Abfrage.

| parent_col | text_value |
|------------|------------|
| unit1      | 2,50       |
| unit1      | 5554,50    |
| unit1      | 723,3      |
| unit2      | 100,4      |
| unit2      | 4,65       |

{% highlight sql %}
SELECT
  parent_col,
  MIN(CAST(REPLACE(text_value, ",", ".") AS float)),
  MAX(CAST(REPLACE(text_value, ",", ".") AS float))
FROM table
WHERE
  CAST(REPLACE(text_value, ",", ".") AS float) > 0
GROUP BY parent_col
{% endhighlight %}

[so-delete-duplicates]: http://stackoverflow.com/questions/8190541/deleting-duplicate-rows-from-sqlite-database
[sqlite-rowid]: https://sqlite.org/lang_createtable.html#rowid
[sqlite-min]: https://sqlite.org/lang_corefunc.html#minoreunc
[sqlite-max]:  https://sqlite.org/lang_corefunc.html#maxreunc
[sqlite-replace]: https://www.sqlite.org/lang_replace.html
[sqlite-cast]: https://www.sqlite.org/lang_expr.html#castexpr
[sqlite]: https://sqlite.org/
[dbbrowsersqlite]: https://github.com/sqlitebrowser/sqlitebrowser/releases
