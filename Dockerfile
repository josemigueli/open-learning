FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/core/package*.json ./packages/core/
COPY packages/bot/package*.json ./packages/bot/

# Install dependencies
RUN npm install

# Copy source code and courses
COPY . .

# Ensure data directory exists for SQLite
RUN mkdir -p data

# Expose no ports since it's a polling bot
# Command to push DB schema and start bot
CMD ["sh", "-c", "npx drizzle-kit push && npm run dev"]