source "https://rubygems.org"

# Lokale Vorschau mit denselben Versionen wie GitHub Pages:
#   bundle install && bundle exec jekyll serve
gem "github-pages", group: :jekyll_plugins
gem "jekyll-include-cache", group: :jekyll_plugins
gem "webrick"
gem "bigdecimal" # ab Ruby 3.4 kein Standard-Gem mehr

# Liquid 4.0.3 (von GitHub Pages vorgegeben) läuft nicht mit Ruby >= 3.2.
# Der Patch wird nur lokal geladen; GitHub Pages ignoriert dieses Gemfile.
require_relative "_dev/ruby3_compat" if RUBY_VERSION >= "3.2"
