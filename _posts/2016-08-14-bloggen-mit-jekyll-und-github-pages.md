---
layout: post
title:  "Bloggen mit Jekyll und GitHub Pages"
date:   2016-08-14 05:45:37 +0200
categories: jekyll github pages
---
Um einen Blog zu betreiben gibt es viele verschiedene Möglichkeiten. Dabei reicht die Auswahl von selbstgeschriebenen statischen HTML-Seiten bis hin zu dynamischen Blogging-System (wie [Wordpress][wordpress], [Ghost][ghost] und viele mehr). Die Wahl des geeigneten Systems hängt von den persönlichen Ansprüchen und Anforderungen des eigenen Blogs. So kann es durchaus Sinn machen einen Blog, der nur in großen Intervallen geführt wird, statisch und einfach zu halten und dabei auf oft nicht benötigte dynamische Zusatzfunktionen zu verzichten.

Meiner Meinung nach fallen hier statische Webseiten Generatoren (wie [Jekyll][jekyll], [Hyde][hyde] und viele mehr) in diese Nische. Hier wird die Seite über Konfigurationsdateien parametriert und der Inhalt über simple Textdateien ohne eigene Datenbanken geführt. Mit einem eigenen Build Prozess wird die Webseite generiert und kann dann veröffentlicht werden. Persönlich habe ich mich für Jekyll entschieden.

* Jekyll basiert auf Ruby. Diese Programmiersprache wollte ich einfach mal ausprobieren und hoffe mit der Beschäftigung mit Jeyll ein paar Erfahrungen sammeln zu können.
* Das Veröffentlichen auf GitHub Pages gestaltet sich mit Jekyll relativ einfach und so brauche ich keinen eigenen Webspace zu kümmern.

Die Erstellung und Anpassung des Jeyll Blogs gestaltet sich laut dem [Quick-start Guide][jekyll-quickstart] einfach und ist in wenigen Schritten abgeschlossen. Ich nutze Xubuntu 16.04 und habe Jeyll über apt-get installiert

{% highlight bash %}
sudo apt-get install jekyll
mkdir blog
cd blog
jekyll new .
{% endhighlight %}

Ich habe mich bewusst für die Methode entschieden, das Verzeichnis vorher selbst zu erstellen und den Blog über `jekyll new .` zu erzeugen, da ich meinen Blog in einem geklonten Git-Projekt ablege.

Mit `jekyll serve` werden die HTML-Seiten erzeugt und mit Hilfe eines internen Webservers auf `localhost:4000` veröffentlicht. Ist man fertig mit der Anpassung der entsprechenden Konfigurationsdateien und hat eigene Blog Einträge erstellt, kann die Seite veröffentlicht werden. Ich habe diesen Blog auf GitHub Pages gestellt.

[ghost]: https://ghost.org
[hyde]: https://hyde.github.io
[jekyll]: https://jekyllrb.com
[jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-quickstart]: https://jekyllrb.com/docs/quickstart
[wordpress]: https://wordpress.com
