FROM mcr.microsoft.com/vscode/devcontainers/base:0-debian-11

# Install Hugo (Extended)
ARG HUGO_VERSION="0.115.1"
RUN apt-get update \
  && apt-get install -y wget tar \
  && wget https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz \
  && tar -xzf hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz hugo \
  && mv hugo /usr/local/bin/ \
  && rm hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz \
  && apt-get clean -y && rm -rf /var/lib/apt/lists/*