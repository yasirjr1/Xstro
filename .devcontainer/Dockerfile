FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    libavutil-dev \
    imagemagick \
    ghostscript \
    exiftool \
    mediainfo \
    build-essential \
    python3-dev \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces
