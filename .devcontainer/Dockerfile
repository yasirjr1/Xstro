FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# Install additional media processing tools and dependencies
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

# Install additional Python packages for media processing
RUN pip3 install \
    Pillow \
    moviepy \
    opencv-python \
    numpy \
    pydub

# Set working directory
WORKDIR /workspaces
