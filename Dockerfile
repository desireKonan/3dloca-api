#For Dev
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

RUN apk add --no-cache build-base python3 openssl
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm ci

COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate

RUN npm run build

RUN npm rebuild bcrypt --build-from-source

#For prod
FROM node:20-alpine

RUN apk add --no-cache tzdata && \
    addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Installer les dépendances de production seulement
COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copier les fichiers construits depuis l'étape builder
COPY --from=builder /usr/src/app/dist ./dist

# Définir l'utilisateur
USER nodejs

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposer le port
EXPOSE ${PORT}

# Commande de démarrage
CMD ["node", "dist/main"]