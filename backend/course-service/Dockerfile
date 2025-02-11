# Stage 1: Build the application
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

# Build the NestJS project
RUN npm run build

# Stage 2: Create the final, optimized image
FROM node:22.13.1

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"]