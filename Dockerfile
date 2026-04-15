# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build do Vite
RUN npm run build

# Runtime stage - usar servidor web leve
FROM node:18-alpine

WORKDIR /app

# Instalar servidor web simples para servir arquivos estáticos
RUN npm install -g serve

# Copiar arquivos compilados do builder
COPY --from=builder /app/dist ./dist

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Comando para iniciar - servir a pasta dist na porta 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
