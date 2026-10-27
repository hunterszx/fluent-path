# Project rules

- Keep NPM as the documented package manager for local installations, with a synchronized package-lock.json for reproducible installs.
- Local setup copies the public-only .env.example only when .env is absent; never export hosted private credentials or overwrite an existing local configuration.
- Preserve the TanStack Start bootstrap and hosted Vite configuration; local source delivery must not change application behavior or authorization.