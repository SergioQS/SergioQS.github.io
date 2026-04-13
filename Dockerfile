FROM ruby:3.3-slim

ENV DEBIAN_FRONTEND=noninteractive

LABEL description="Local development image for SergioQS.github.io"

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        git \
        imagemagick \
        inotify-tools \
        locales \
        nodejs \
        procps \
        python3-pip \
        zlib1g-dev && \
    pip --no-cache-dir install --upgrade --break-system-packages nbconvert jupyter

RUN apt-get clean && \
    apt-get autoremove && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /tmp/*

RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && \
    locale-gen

ENV EXECJS_RUNTIME=Node \
    JEKYLL_ENV=development \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8

RUN mkdir -p /srv/jekyll

COPY Gemfile Gemfile.lock /srv/jekyll/
WORKDIR /srv/jekyll

RUN gem install --no-document jekyll bundler && \
    bundle install --no-cache

EXPOSE 8080

COPY bin/entry_point.sh /tmp/entry_point.sh

CMD ["/tmp/entry_point.sh"]
