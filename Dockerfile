FROM oven/bun:latest

WORKDIR /app

# Install dependencies using Bun
COPY bun.lock bunfig.toml package.json ./
RUN bun install

# Copy source files and build the app
COPY . .
RUN bun run build

EXPOSE 8080

CMD ["bun", "run", "preview", "--host", "0.0.0.0", "--port", "8080"]
