# LYKU

## Prerequisites

### Build-time

- Bun

### Local testing

- Bun
- Postgres
- Redis

### Production

- Bun
- Doppler
- A postgres database
- A redis instance
- A cloudflare account
- CircleCI (if you want CI/CD)
- DigitalOcean Registry
- DigitalOcean Kubernetes

## Build

```bash
bun i && bun run build
```

## Run

```bash
bun run dev
```

# Deploy microservices

**_Note:_** Limits parallelism to 1 by default due to the hundreds of registry calls required when rolling out all 80 microservices.

```bash
bun run kubernetize
```

# Deploy webui

```bash
bun run deploy
```
