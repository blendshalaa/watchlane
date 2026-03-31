FROM mcr.microsoft.com/playwright:v1.50.1-noble

# Set the working directory
WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies for both client and server
RUN npm run install:all

# Generate Prisma types
RUN cd server && npx prisma generate

# Build the frontend Vite app and backend TypeScript code
RUN npm run build

# Explicitly install the exact chromium browser for playwright
RUN cd server && npx playwright install chromium

# Expose the API port
EXPOSE 3000

# Start the centralized Express server
CMD ["npm", "start"]
