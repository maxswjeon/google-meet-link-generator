FROM node:18-alpine

RUN mkdir /app
WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

RUN pnpm install --frozen-lockfile

COPY . /app

RUN pnpm run build

ENTRYPOINT ["pnpm", "run"]

CMD ["start"]