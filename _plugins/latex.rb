# LaTeX in markdown posts and pages, written the same way as in Jupyter / Colab:
#
#   inline:   $...$    \(...\)
#   display:  $$...$$  \[...\]  \begin{align} ... \end{align} (any \begin{...}\end{...})
#
# kramdown (Jekyll's markdown converter) reads parts of LaTeX as markdown: \{ becomes {,
# \\ becomes \, a*b*c turns into italics, \( becomes (. So, before Liquid and markdown run,
# each formula is swapped for a placeholder, and after the conversion it is put back exactly
# as written, for MathJax to typeset in the browser.
#
# Code blocks (``` or ~~~) and `inline code` are left alone, so "$x" in Julia code stays code.
# A $ followed by a space, or a closing $ followed by a digit, is not math ($5 and $10 is text).
# Write \$ for a literal dollar sign.
#
# The writing panel's preview (admin/admin.js) follows the same rules.

require "cgi"

module SiteLatex
  MARKDOWN_EXTENSIONS = %w[.md .markdown .mkd .mkdn .mdown].freeze
  FENCE = /\A( {0,3})(`{3,}|~{3,})/
  CODE_SPAN = /(`+)(?!`).+?(?<!`)\1(?!`)/m
  MATH = /
    (?<!\\)\$\$.+?(?<!\\)\$\$                          # $$ display $$
    | \\\[.+?\\\]                                      # \[ display \]
    | \\\(.+?\\\)                                      # \( inline \)
    | \\begin\{([A-Za-z]+\*?)\}.+?\\end\{\1\}          # \begin{env} ... \end{env}
    | (?<![\\$])\$(?![\s$])                            # $ inline $
      (?:\\.|[^\\$\n]|\n(?![ \t]*\n))+?
      (?<![\s\\])\$(?!\d)
  /mx

  module_function

  def markdown?(doc)
    MARKDOWN_EXTENSIONS.include?(doc.extname.to_s.downcase)
  end

  # Replaces the formulas in +text+ by placeholders; returns [new_text, formulas]
  def protect(text)
    formulas = []
    out = split_code_fences(text).map do |kind, chunk|
      kind == :code ? chunk : protect_prose(chunk, formulas)
    end
    [out.join, formulas]
  end

  def protect_prose(chunk, formulas)
    spans = []
    chunk = chunk.gsub(CODE_SPAN) do |span|
      spans << span
      "\u0000CODE#{spans.size - 1}\u0000"
    end
    chunk = chunk.gsub(MATH) do |formula|
      formulas << formula
      placeholder(formulas.size - 1)
    end
    chunk.gsub(/\u0000CODE(\d+)\u0000/) { spans[Regexp.last_match(1).to_i] }
  end

  def placeholder(index)
    "XLATEXF#{index}X"
  end

  # Puts the formulas back (HTML-escaped, MathJax reads the text)
  def restore(html, formulas)
    html.gsub(/XLATEXF(\d+)X/) do
      formula = formulas[Regexp.last_match(1).to_i]
      formula ? CGI.escapeHTML(formula) : Regexp.last_match(0)
    end
  end

  # [[:prose, text], [:code, fenced block], ...]
  def split_code_fences(text)
    parts = []
    buffer = +""
    fence = nil
    text.each_line do |line|
      if fence
        buffer << line
        if line =~ /\A {0,3}#{Regexp.escape(fence[0])}{#{fence.size},}\s*\z/
          parts << [:code, buffer]
          buffer = +""
          fence = nil
        end
      elsif (match = line.match(FENCE))
        parts << [:prose, buffer] unless buffer.empty?
        buffer = +line
        fence = match[2]
      else
        buffer << line
      end
    end
    parts << [fence ? :code : :prose, buffer] unless buffer.empty?
    parts
  end
end

Jekyll::Hooks.register [:pages, :documents], :pre_render do |doc|
  next unless SiteLatex.markdown?(doc) && doc.content.to_s.match?(/[$\\]/)

  doc.content, formulas = SiteLatex.protect(doc.content)
  doc.data["__latex_formulas"] = formulas unless formulas.empty?
end

Jekyll::Hooks.register [:pages, :documents], :post_convert do |doc|
  formulas = doc.data.delete("__latex_formulas")
  doc.content = SiteLatex.restore(doc.content, formulas) if formulas
end
