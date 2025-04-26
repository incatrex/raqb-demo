FROM mcr.microsoft.com/devcontainers/java:17

# Install additional packages
USER root
RUN apt-get update && apt-get install -y curl gnupg2

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set back to non-root user
USER vscode

# Set working directory
WORKDIR /workspace
