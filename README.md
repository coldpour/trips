# FunTrips

Plan your next adventure. Maximize your fun.

https://funtrips.netlify.app/

## Development

React SPA on Vite

```sh
npm run dev
```

Supabase postgres as a service. Supabase Auth. Create an account and create some data.

Production uses a Netlify Function to wake the Supabase project if it is paused.
Set `SUPABASE_MANAGEMENT_TOKEN` in Netlify with a Supabase Management API token
that can read and restore the project.

## Lint

```sh
npm run lint
```

## Test

Fully mocked network requests with Cypress. Click everything. No data cleanup.

```sh
npm test
```
