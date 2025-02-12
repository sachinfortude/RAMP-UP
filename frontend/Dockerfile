# Stage 1: Build the Angular application
FROM node:22.13.1 AS builder

# Set the working directory
WORKDIR /app

# Disable strict SSL to bypass certificate verification issues
RUN npm config set strict-ssl false

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular project
RUN npm run build -- --configuration=production

# Stage 2: Serve the application using Nginx
FROM nginx:latest

# Copy the built Angular app from the builder stage to the Nginx HTML directory
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]