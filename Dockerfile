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

FROM node:20-alpine

WORKDIR /usr/src/app

# Installer les dépendances de production seulement
COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier les fichiers construits depuis l'étape builder
COPY --from=builder /usr/src/app/dist ./dist

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3500

# Exposer le port
EXPOSE ${PORT}

# Commande de démarrage
CMD ["node", "dist/main"]