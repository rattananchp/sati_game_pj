FROM node:20-alpine

WORKDIR /app

# Copy package configuration files
COPY package.json package-lock.json ./

# Install dependencies (ignoring scripts initially)
RUN npm ci --ignore-scripts

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the typical Express port (fallback)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
