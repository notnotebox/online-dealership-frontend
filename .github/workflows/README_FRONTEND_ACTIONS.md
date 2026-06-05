# GitHub Actions - Frontend

## Workflows
- `.github/workflows/ci.yml` : install + build a chaque push/PR
- `.github/workflows/deploy.yml` : build + upload `dist/` sur VPS (push sur `main` ou manuel)
- Les workflows installent d'abord `pnpm` puis Node afin que `pnpm install` soit toujours disponible sur le runner.

## Secrets GitHub requis
- `VPS_HOST` : IP ou domaine du VPS
- `VPS_PORT` : port SSH (souvent `22`)
- `VPS_USER` : utilisateur SSH
- `VPS_SSH_KEY` : cle privee SSH (format OpenSSH)
- `VPS_FRONTEND_WEB_ROOT` : dossier web servi par Caddy (ex: `/var/www/online-dealership`)

## Comportement de deploy
1. Build Vite (`pnpm run build`)
2. Upload du contenu `dist/` vers le dossier web du VPS
3. Reload de Caddy si service present
