FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY prisma ./prisma
COPY tsconfig.json .
COPY src ./src
COPY prisma.config.ts .

RUN npx prisma generate

RUN npm run build

CMD ["node", "dist/index.js"]