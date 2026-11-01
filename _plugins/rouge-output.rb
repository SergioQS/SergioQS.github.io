# ```output blocks in posts: text printed by the code cell above it.
# Registered as a (plain text) language so it gets the same HTML as highlighted code
# (<div class="language-output highlighter-rouge">) and can be styled in _sass/_cells.scss.

require "rouge"

module Rouge
  module Lexers
    class SiteOutput < PlainText
      title "Output"
      desc "Text printed by a code cell"
      tag "output"
    end
  end
end
