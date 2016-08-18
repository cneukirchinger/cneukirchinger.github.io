---
layout: post
title:  "Disqus mit Jekyll und Github Pages"
date:   2016-08-18 07:00:00 +0200
categories: jekyll github pages disqus
comments: true
author: "Christian"
---

Ich wollte für meinen Jekyll Blog eine Kommentarfunktion realisieren und habe dafür [Disqus][disqus] auserkoren. Auf mehreren Blog-Seiten habe ich Disqus in Aktion gesehen und möchte das auch gerne ausprobieren. Um den Dienst bei mir zu implementieren sind einige Anpassungen Layout und der Jekyll Konfigurations notwenig. Als Installationshilfe habe ich die [Dokumentation][disqus_jekyll_install] verwendet.

# Disqus im Post darstellen
Für jeden Post soll auswählbar sein, dass Kommentare angezeigt werden sollen oder nicht. Dazu muss im YML-Frontmatter des Posts eine Variable `comments` eingeführt werden.

{% highlight yml %}
---
...
categories: jekyll github pages disqus
comments: true
author: "Christian"
...
---
{% endhighlight %}

Damit kann ich im Post einen Bereich definieren, wo die Disqus-Kommentare angezeigt werden können, wenn ich über die Frontmatter die Anzeige der Kommentare aktiviert habe. In der Disqus-Dokumentation gibt es eine generische Code-Vorlage, die man auf seiner Seite einfügen kann um die Kommentare darzustellen.

{% highlight html linenos %}
{% raw %}{% if page.comments %}{% endraw %}
<div id="disqus_thread"></div>
<script>
var disqus_config = function () {
    this.page.url = "{% raw %}{{ page.url | prepend: site.url }}{% endraw  %}";  // Replace PAGE_URL with your page's canonical URL variable
    this.page.identifier = "{% raw %}{{ page.url }}{% endraw %}"; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
};
(function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://DISQUS_USERNAME.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
})();
</script>
{% raw %}{% endif %}{% endraw %}
{% endhighlight %}

Mit diesem Codeschnipsel wird ein `div`-Bereich für die Kommentare definiert. Über Javascript wird die Disqus-Logik geladen. In Zeile 10 muss der eigne Disqus-Username eingetragen werden. Für die Konfiguration sind die Zeilen 5 und 6 relevant. Hier sollen eindeutige Namen für die aktuelle Seite vergeben werden, damit die Kommentare wieder den selben Posts zugeordnet werden können. Sonst kann es passieren, das z.B. der Protokoll Wechsel von `https://` auf `http://` auf unterschiedliche Kommentare verweist. Details dazu finden sich [hier][disqus-url-config].

# Anzahl der Kommentare im Index darzustellen
In der Übersicht des Blogs soll für jeden Post die Anzahl der Kommentare angezeigt werden. Dafür muss die `index.html` angepasst werden. An der Stelle wo der Link und die Anzahl der Kommentare angezeigt muss der folgende Code eingefügt werden.

{% highlight html linenos %}
{% raw %}{% if post.comments %}{% endraw %}
  <i class="fa fa-comment" aria-hidden="true"></i>
  <a href="{{ post.url | prepend: site.url }}#disqus_thread"></a>
{% raw %}{% endif %}{% endraw %}
{% endhighlight %}

In den Einstellungen des eigenen Disqus-Accounts kann man die Anzeige der gezählten Kommentare anpassen und auch lokalisieren. Diese Einstellung findet man unter Disqus -> Admin -> Settings -> Community und dann dem Bereich "Comment Count Link".

Für meinen Blog habe ich Disqus implementiert und bin gespannt auf die Rückmeldungen.

[disqus]: https://disqus.com/
[disqus_jekyll_install]: https://help.disqus.com/customer/portal/articles/472138-jekyll-installation-instructions
[disqus-url-config]: https://disqus.com/admin/universalcode/#configuration-variables
