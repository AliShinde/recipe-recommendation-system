# Recipe Recommendation System - Docker Image
# Single container serving both frontend and backend

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Python and pip for ML model
RUN apk add --no-cache python3 py3-pip && \
    python3 -m ensurepip && \
    pip3 install --upgrade pip

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

# Install Python ML dependencies using python3 -m pip
RUN python3 -m pip install --no-cache-dir -r ml-model/requirements.txt

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
