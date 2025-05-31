# Production stage
FROM oven/bun:latest
WORKDIR /app
ARG ROUTE_NAME

# Enable Bun's runtime logging and stdout
ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps" \
    BUN_RUNTIME_LOGGING=1 \
    BUN_LOG_LEVEL=debug \
    BUN_FORCE_TTY=1

# Copy only the built files
COPY /dist/apps/routes/${ROUTE_NAME} .
COPY ./k8s-prd-ca-cert.crt .

# Health check using Bun's native fetch
HEALTHCHECK --interval=30s --timeout=3s \
  CMD bun --eval 'fetch("http://localhost:3000/health").then(r => process.exit(r.ok ? 0 : 1))' || exit 1

# Direct execution without shell wrapper
CMD ["bun", "./serve.js"]
