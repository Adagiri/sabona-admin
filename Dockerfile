FROM node:18

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app/

COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the project
RUN pnpm run build

# Expose the port for the application
EXPOSE 5173

# Run the start script
CMD ["pnpm", "run", "start"]
