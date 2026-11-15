# frozen_string_literal: true

# Markdown inside foldable sections written with HTML in posts and pages:
#
#   <details>
#   <summary>Título que se despliega</summary>
#
#   Texto con **Markdown**, $LaTeX$, listas y bloques de código.
#
#   </details>
#
# kramdown (Jekyll's Markdown converter) copies the inside of an HTML block as it is, unless the
# tag carries markdown="1"; the writing panel's preview, GitHub and Colab do convert it. This adds
# markdown="1" to every <details> tag that has no markdown attribute, outside code blocks and
# inline code, so the site shows these sections as the panel does. (The theme's
# {% details Título %}...{% enddetails %} tag, _plugins/details.rb, keeps working too.)
module SiteDetails
  OPEN_TAG = /<details(?=[\s>])(?![^>]*\bmarkdown\s*=)/i
  FENCE = /\A( {0,3})(`{3,}|~{3,})/
  CODE_SPAN = /(`+)(?!`).+?(?<!`)\1(?!`)/m
  MARKDOWN_EXTENSIONS = %w[.md .markdown .mkdown .mkdn .mkd].freeze

  module_function

  def markdown?(doc)
    MARKDOWN_EXTENSIONS.include?(doc.extname.to_s.downcase)
  end

  def add_markdown_attribute(text)
    split_code_fences(text).map do |kind, chunk|
      kind == :code ? chunk : prose(chunk)
    end.join
  end

  # inline code (`<details>`) is left alone
  def prose(chunk)
    spans = []
    chunk = chunk.gsub(CODE_SPAN) do |span|
      spans << span
      "\u0000CODE#{spans.size - 1}\u0000"
    end
    chunk = chunk.gsub(OPEN_TAG, '<details markdown="1"')
    chunk.gsub(/\u0000CODE(\d+)\u0000/) { spans[Regexp.last_match(1).to_i] }
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
  next unless SiteDetails.markdown?(doc) && doc.content.to_s =~ /<details/i

  doc.content = SiteDetails.add_markdown_attribute(doc.content)
end
