FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app

# The backend uses only Node.js built-in modules.
COPY server.js ./server.js

# Cloud Run supplies PORT at runtime.
CMD ["node", "server.js"]
