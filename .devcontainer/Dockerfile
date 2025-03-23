FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    libavutil-dev \
    imagemagick \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces
