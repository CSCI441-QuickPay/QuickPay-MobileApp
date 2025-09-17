# Dockerfile
FROM node:20-alpine

# Install dependencies needed for Expo
RUN apk add --no-cache bash git python3 make g++

# Set working directory
WORKDIR /app

# Copy package.json & lock file first (for caching)
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g expo-cli && npm install

# Copy rest of the code
COPY . .

# Expose Expo dev server ports
EXPOSE 8081 19000 19001 19002

# Default command: start Expo in development mode
CMD ["npx", "expo", "start", "--tunnel"]
