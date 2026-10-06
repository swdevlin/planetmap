FROM node:20-alpine

ENV NODE_ENV=production PORT=3013
WORKDIR /app

COPY package.json index.js ./
COPY src ./src

USER node
EXPOSE 3013

# Blue/green: the deployment tooling should only switch traffic once this passes.
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

CMD ["node", "index.js"]
