# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 3000 for the React development server
EXPOSE 3000

# Start Vite on port 3000 and bind to all network interfaces
CMD ["npm", "run", "dev", "--", "--port", "3000", "--host", "0.0.0.0"]