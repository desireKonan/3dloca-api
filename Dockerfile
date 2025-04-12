# #For Dev
# FROM node:20-alpine AS builder

# WORKDIR /usr/src/app

# RUN apk add --no-cache build-base python3 openssl
# COPY package*.json ./
# COPY tsconfig*.json ./
# COPY nest-cli.json ./

# RUN npm ci

# COPY prisma ./prisma
# COPY src ./src

# RUN npx prisma generate

# RUN npm run build

# RUN npm rebuild bcrypt --build-from-source

# FROM node:20-alpine

# WORKDIR /usr/src/app

# # Installer les dépendances de production seulement
# COPY --from=builder /usr/src/app/package*.json ./
# RUN npm ci --only=production && npm cache clean --force

# # Copier les fichiers construits depuis l'étape builder
# COPY --from=builder /usr/src/app/dist ./dist

# # Variables d'environnement
# ENV NODE_ENV=production
# ENV PORT=3500

# # Exposer le port
# EXPOSE ${PORT}

# # Commande de démarrage
# CMD ["node", "dist/main"]


# Étape 1: Builder l'application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# 1. Installer les dépendances système nécessaires pour Prisma et les builds natifs
RUN apk add --no-cache --virtual .build-deps \
    build-base \
    python3 \
    openssl

# 2. Copier les fichiers de configuration (optimisation du cache Docker)
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma/schema.prisma ./prisma/

# 3. Installer les dépendances
RUN npm ci && \
    npx prisma generate && \
    npm cache clean --force

# 4. Copier le reste de l'application
COPY src ./src
COPY prisma ./prisma

# 5. Builder l'application
RUN npm run build && \
    npm rebuild bcrypt --build-from-source && \
    rm -rf src && \
    apk del .build-deps

# Étape 2: Image finale de production
FROM node:20-alpine

WORKDIR /usr/src/app

# 1. Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs

# 2. Installer les dépendances système nécessaires pour Prisma en runtime
RUN apk add --no-cache openssl

# 3. Copier uniquement le nécessaire depuis le builder
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/prisma ./prisma

# 4. Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3500

# 5. Configurer les permissions
USER nodejs

# 6. Exposer le port
EXPOSE ${PORT}

# 7. Commande de démarrage avec migration automatique (optionnel)
ENTRYPOINT ["sh", "-c", "node dist/main"]