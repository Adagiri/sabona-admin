FROM node:18

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app/

COPY . .

RUN pnpm install

RUN pnpm run build

EXPOSE 5173

CMD ["pnpm", "run", "start"]
