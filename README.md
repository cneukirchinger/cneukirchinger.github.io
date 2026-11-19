# cneukirchinger.github.io

Persönlicher Blog mit Projekten, gebaut mit [Jekyll](https://jekyllrb.com/) und dem Theme
[Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/), ausgeliefert über GitHub Pages.

## Struktur

| Pfad | Inhalt |
| --- | --- |
| `_posts/` | Blogposts (`JJJJ-MM-TT-titel.md`) |
| `_projects/` | Projektseiten (Beschreibung), erscheinen unter `/projekte/` |
| `apps/<name>/` | Die Apps selbst, z. B. der Tipptrainer unter `/apps/tipptrainer/` |
| `_pages/` | Statische Seiten (Über mich, Archiv, Tags …) |
| `_data/navigation.yml` | Hauptnavigation |

## Neuer Blogpost

Datei `_posts/2026-12-01-mein-titel.md` anlegen:

```markdown
---
title: "Mein Titel"
tags: [Beispiel]
---

Text …
```

## Neues Projekt

1. Die App als eigenständige Datei(en) nach `apps/mein-projekt/` legen (Einstieg: `index.html`,
   ohne Front Matter, damit Jekyll sie unverändert kopiert). Erreichbar unter `/apps/mein-projekt/`.
2. Die Beschreibung als `_projects/mein-projekt.md` mit `title`, `excerpt` und optional
   `header.teaser` anlegen und dort auf `/apps/mein-projekt/` verlinken.

## Lokale Vorschau

```bash
bundle install
bundle exec jekyll serve
```

Dann <http://localhost:4000> öffnen.

GitHub Pages gibt Jekyll 3.9 mit Liquid 4.0.3 vor, das unter Ruby ≥ 3.2 nicht mehr läuft.
Das `Gemfile` lädt deshalb lokal den Patch [`_dev/ruby3_compat.rb`](_dev/ruby3_compat.rb).
GitHub Pages ignoriert das `Gemfile`, dort ändert sich nichts.
