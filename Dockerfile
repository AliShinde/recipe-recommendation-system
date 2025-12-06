# Recipe Recommendation System - Docker Image
# Single container serving both frontend and backend

# Use Debian-based Node image for better Python compatibility
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install Python and pip for ML model
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install frontend dependencies and build
COPY client/package*.json ./client/
RUN cd client && npm ci --production=false
COPY client/ ./client/
RUN cd client && npm run build

# Install backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --production=false
COPY server/ ./server/

# Copy ML model files BEFORE installing Python deps
COPY ml-model/ ./ml-model/

# Install Python ML dependencies directly with pip3
RUN pip3 install --break-system-packages --no-cache-dir -r ml-model/requirements.txt

# Build TypeScript backend
RUN cd server && npm run build

# Move frontend build to backend's public folder
RUN mkdir -p server/public && mv client/build/* server/public/

# Set working directory to server
WORKDIR /app/server

# Expose port
EXPOSE 10000

# Set environment variable
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
