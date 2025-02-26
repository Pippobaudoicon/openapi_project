FROM ubuntu:20.04

# Avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js, npm, dos2unix, and git
RUN apt-get update && \
    apt-get install -y curl dos2unix git && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Copy the rest of the application
COPY . .

# Fix script permissions and line endings
RUN dos2unix deploy.sh && \
    chmod +x deploy.sh

CMD git config user.email "584j8n67g474t9mmdebve63toi88ab@bots.bitbucket.org" && ./deploy.sh