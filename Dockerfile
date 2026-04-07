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

# At runtime: push schema to database, then start the server
CMD cd server && npx prisma db push --skip-generate && cd .. && npm start
