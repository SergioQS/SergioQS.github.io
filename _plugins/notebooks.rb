# Jupyter notebooks shown directly in posts.
#
# A post names its notebook in the front matter:
#
#     notebook: assets/jupyter/MyNotebook.ipynb
#
# _layouts/post.liquid then includes _includes/notebook.liquid, which shows the buttons
# (Colab, GitHub, download, show/hide code) and the cells. The cells are turned into HTML
# at build time by nbconvert with the template in _plugins/nbconvert/jekyll-site.
#
# This file also:
#   - stores the number of words in each post's notebook (markdown and code cells, not the
#     outputs) in `notebook_words`, used by the reading time on the section pages, and the
#     notebook's language in `notebook_language`;
#   - moves the images inside the notebook into separate files next to it, so the post
#     page stays small and images load as the reader scrolls;
#   - publishes the .ipynb itself, so the download button works (the
#     jekyll-jupyter-notebook gem otherwise replaces it with an HTML page).
#
# Posts that still use {% jupyter_notebook %} keep working as before (iframe).

require "base64"
require "cgi"
require "digest"
require "fileutils"
require "json"
require "open3"
require "set"

module SiteNotebooks
  TEMPLATE_DIR = File.expand_path("nbconvert", __dir__)
  TEMPLATE_NAME = "jekyll-site".freeze
  # Notebook paths written in a post's body by the old iframe embed
  EMBEDDED_PATH = %r{assets/jupyter/[^'"\s{}%]+?\.ipynb}
  DATA_IMAGE = %r{<img\b([^>]*?)\ssrc="data:image/(png|jpeg|gif|svg\+xml);base64,([^"]+)"([^>]*)>}
  IMAGE_EXTENSIONS = { "png" => "png", "jpeg" => "jpg", "gif" => "gif", "svg+xml" => "svg" }.freeze

  @html_cache = {}
  @images_added = Set.new

  class << self
    attr_reader :images_added

    def normalize(path)
      path.to_s.strip.sub(%r{\A/+}, "")
    end

    # Notebooks used by a post: front matter `notebook:` and old {% jupyter_notebook %} embeds
    def paths_for(post)
      paths = []
      paths << normalize(post.data["notebook"]) if post.data["notebook"]
      paths.concat(post.content.to_s.scan(EMBEDDED_PATH))
      paths.uniq
    end

    def read(file)
      JSON.parse(File.read(file, encoding: "UTF-8"))
    end

    def words_in(notebook)
      (notebook["cells"] || []).sum do |cell|
        next 0 unless %w[markdown code].include?(cell["cell_type"])

        source = cell["source"]
        source = source.join if source.is_a?(Array)
        source.to_s.split.size
      end
    end

    def language_of(notebook)
      name = notebook.dig("metadata", "language_info", "name") || notebook.dig("metadata", "kernelspec", "language")
      name.to_s.empty? ? nil : name.to_s.capitalize
    end

    # HTML of the cells, converted once per version of the notebook (and of the template)
    def cells_html(file)
      key = [file, File.mtime(file), Dir[File.join(TEMPLATE_DIR, "**", "*")].map { |f| File.mtime(f) }.max]
      @html_cache[key] ||= convert(file)
    end

    def convert(file)
      command = [
        "jupyter", "nbconvert", "--to", "html",
        "--template", TEMPLATE_NAME,
        "--TemplateExporter.extra_template_basedirs=#{TEMPLATE_DIR}",
        "--TemplateExporter.exclude_input_prompt=True",
        "--TemplateExporter.exclude_output_prompt=True",
        "--HTMLExporter.exclude_anchor_links=True",
        "--stdout", file,
      ]
      html, log, status = Open3.capture3(*command)
      raise "nbconvert failed: #{log.lines.last(3).join.strip}" unless status.success?

      html.force_encoding("UTF-8")
    end

    # The post already shows its title: drop the notebook's first heading when it is the same text
    def drop_repeated_title(html, title)
      first = html.match(%r{<h1[^>]*>(.*?)</h1>}m)
      return html unless first && title

      same = plain(first[1]) == plain(title)
      same ? html.sub(first[0], "") : html
    end

    def plain(text)
      CGI.unescapeHTML(text.to_s.gsub(/<[^>]+>/, "")).gsub(/[*_`]/, "").squeeze(" ").strip.downcase
    end

    # Writes the images embedded in the HTML to /assets/jupyter/<notebook name>/ and links them
    def extract_images(site, path, html)
      dir = File.join("/", File.dirname(path), File.basename(path, ".ipynb"))
      html.gsub(DATA_IMAGE) do
        before, type, data, after = Regexp.last_match.captures
        bytes = Base64.decode64(data.gsub(/\s+/, ""))
        name = "#{Digest::SHA1.hexdigest(bytes)[0, 16]}.#{IMAGE_EXTENSIONS[type]}"
        add_image(site, dir, name, bytes)
        url = File.join(site.baseurl.to_s, dir, name)
        %(<img loading="lazy" data-zoomable#{before} src="#{url}"#{after}>)
      end
    end

    def add_image(site, dir, name, bytes)
      return if images_added.include?([dir, name])

      images_added << [dir, name]
      site.static_files << GeneratedFile.new(site, dir, name, bytes)
    end
  end

  # A file written from memory (images taken out of a notebook)
  class GeneratedFile < Jekyll::StaticFile
    def initialize(site, dir, name, bytes)
      super(site, site.source, dir, name)
      @bytes = bytes
    end

    def modified?
      true
    end

    def mtime
      0
    end

    def write(dest)
      path = destination(dest)
      return false if File.exist?(path) && File.binread(path) == @bytes

      FileUtils.mkdir_p(File.dirname(path))
      File.binwrite(path, @bytes)
      true
    end
  end

  # {% notebook_cells path %}: the cells of a notebook as HTML (see _includes/notebook.liquid)
  class CellsTag < Liquid::Tag
    def initialize(tag_name, markup, parse_context)
      super
      @path = Liquid::Variable.new(markup.strip, parse_context)
    end

    def render(context)
      site = context.registers[:site]
      page = context.registers[:page] || {}
      path = SiteNotebooks.normalize(@path.render(context))
      file = File.join(site.source, path)
      unless File.file?(file)
        Jekyll.logger.warn "Notebook:", "#{path} not found (used in #{page['path']})"
        return %(<p class="notebook-error">Notebook not found: #{CGI.escapeHTML(path)}</p>)
      end

      html = SiteNotebooks.cells_html(file)
      html = SiteNotebooks.drop_repeated_title(html, page["title"])
      SiteNotebooks.extract_images(site, path, html)
    rescue StandardError => e
      Jekyll.logger.error "Notebook:", "could not show #{path} (#{e.message})"
      %(<p class="notebook-error">The notebook could not be shown here; use the buttons above to open it.</p>)
    end
  end

  # Publishes the .ipynb of every post's notebook (for the download button)
  class Downloads < Jekyll::Generator
    priority :lowest

    def generate(site)
      published = site.static_files.map(&:relative_path).to_set
      site.posts.docs.each do |post|
        next unless post.data["notebook"]

        path = SiteNotebooks.normalize(post.data["notebook"])
        next if published.include?(path) || !File.file?(File.join(site.source, path))

        site.static_files << Jekyll::StaticFile.new(site, site.source, File.dirname(path), File.basename(path))
        published << path
      end
    end
  end
end

Liquid::Template.register_tag("notebook_cells", SiteNotebooks::CellsTag)

Jekyll::Hooks.register :site, :after_reset do |_site|
  SiteNotebooks.images_added.clear
end

# Word count (reading time) and language of each post's notebook
Jekyll::Hooks.register :site, :post_read do |site|
  notebooks = {}
  site.posts.docs.each do |post|
    paths = SiteNotebooks.paths_for(post)
    next post.data["notebook_words"] = 0 if paths.empty?

    words = 0
    paths.each do |path|
      file = File.join(site.source, path)
      next unless File.file?(file)

      notebooks[file] ||= begin
        SiteNotebooks.read(file)
      rescue StandardError => e
        Jekyll.logger.warn "Notebook:", "could not read #{path} (#{e.message})"
        {}
      end
      words += SiteNotebooks.words_in(notebooks[file])
      post.data["notebook_language"] ||= SiteNotebooks.language_of(notebooks[file])
    end
    post.data["notebook_words"] = words
  end
end
