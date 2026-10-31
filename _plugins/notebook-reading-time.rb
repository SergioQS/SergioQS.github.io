# Reading time for posts that embed Jupyter notebooks.
#
# {% jupyter_notebook %} shows the notebook in an iframe that loads a separate HTML file,
# so `post.content` has almost no words and long notebooks were listed as "1 min".
# After the site is read, this hook finds the notebooks each post embeds (paths such as
# assets/jupyter/X.ipynb in its source) and stores the number of words in their markdown
# and code cells in `post.notebook_words`. Outputs (numbers, tables, plots) are not counted.
#
# Used by the reading time on the section pages (_pages/mathematics.md, computation.md,
# other_areas.md).

require "json"

module NotebookReadingTime
  NOTEBOOK_PATH = %r{assets/jupyter/[^'"\s{}%]+?\.ipynb}

  def self.words_in(file)
    notebook = JSON.parse(File.read(file, encoding: "UTF-8"))
    (notebook["cells"] || []).sum do |cell|
      next 0 unless %w[markdown code].include?(cell["cell_type"])

      source = cell["source"]
      source = source.join if source.is_a?(Array)
      source.to_s.split.size
    end
  rescue StandardError => e
    Jekyll.logger.warn "Notebook reading time:", "could not read #{file} (#{e.message})"
    0
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  words_by_file = {}
  site.posts.docs.each do |post|
    paths = post.content.to_s.scan(NotebookReadingTime::NOTEBOOK_PATH).uniq
    post.data["notebook_words"] = paths.sum do |relative_path|
      file = File.join(site.source, relative_path)
      next 0 unless File.file?(file)

      words_by_file[file] ||= NotebookReadingTime.words_in(file)
    end
  end
end
