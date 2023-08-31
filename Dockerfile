FROM node:16

RUN npm install -g pnpm
# RUN curl -f https://get.pnpm.io/v8.6.js | node - add --global pnpm

# Files required by pnpm install
COPY  package.json pnpm-lock.yaml  ./

RUN pnpm install --frozen-lockfile --prod

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "echo", "\"$REDIS_URL\"" ]
CMD [ "npx", "tsc",  "src/app.js" ]
CMD [ "node",  "dist/app.js" ]
