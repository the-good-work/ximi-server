FROM node:16

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# Files required by pnpm install
COPY  package.json pnpm-lock.yaml  ./

RUN pnpm install --frozen-lockfile --prod

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "npx", "tsc",  "src/app.js" ]
CMD [ "node",  "dist/app.js" ]
