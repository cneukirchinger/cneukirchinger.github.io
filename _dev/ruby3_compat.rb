# Kompatibilitäts-Patches nur für die lokale Vorschau.
#
# GitHub Pages pinnt alte Gem-Versionen (Jekyll 3.9, Liquid 4.0.3,
# pathutil 0.16.2), die mit Ruby >= 3.x nicht mehr laufen. Diese Datei wird
# über das Gemfile geladen; GitHub Pages ignoriert das Gemfile und baut mit
# eigener Ruby-Version, dort hat sie also keinen Effekt.

# --- Liquid 4.0.3 ------------------------------------------------------------
# Ruft String#tainted?, #taint und #untaint auf, die in Ruby 3.2 entfernt
# wurden. Als wirkungslose Methoden ergänzen, aber nur, wenn sie fehlen.
unless Object.method_defined?(:tainted?)
  class Object
    def tainted? = false
    def taint = self
    def untaint = self
  end
end

# --- pathutil 0.16.2 ---------------------------------------------------------
# Übergibt Optionen als Positions-Hash an File.read & Co. Seit Ruby 3 wird der
# nicht mehr automatisch zu Keyword-Argumenten:
#   "no implicit conversion of Hash into Integer (TypeError)"
# Das Gemfile wird ausgewertet, bevor pathutil geladen ist. Per `prepend`
# haben diese Methoden trotzdem Vorrang, egal wann pathutil nachgeladen wird.
module PathutilRuby3Fix
  def read(*args, **kwd)
    kwd[:encoding] ||= encoding
    out = File.read(self, *args, **kwd)
    normalize[:read] ? out.encode(universal_newline: true) : out
  end

  def binread(*args, **_kwd)
    out = File.binread(self, *args) # binread kennt keine Encoding-Optionen
    normalize[:read] ? out.encode(universal_newline: true) : out
  end

  def readlines(*args, **kwd)
    kwd[:encoding] ||= encoding
    lines = File.readlines(self, *args, **kwd)
    normalize[:read] ? lines.map { |l| l.encode(universal_newline: true) } : lines
  end

  def write(data, *args, **kwd)
    kwd[:encoding] ||= encoding
    data = data.encode(crlf_newline: true) if normalize[:write]
    File.write(self, data, *args, **kwd)
  end

  def binwrite(data, *args, **kwd)
    kwd[:encoding] ||= encoding
    data = data.encode(crlf_newline: true) if normalize[:write]
    File.binwrite(self, data, *args, **kwd)
  end
end

class Pathutil; end
Pathutil.prepend(PathutilRuby3Fix)
