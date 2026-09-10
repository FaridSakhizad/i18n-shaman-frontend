# i18nshaman App

React frontend for the i18nshaman localization workspace.

## Scripts

- `npm start` - start the local development server.
- `npm run build` - create a production build.

## Local Notes

- API calls are centralized under `src/api`.
- API errors use the shared `ProblemDetails` shape.
- Successful API payloads are unwrapped through the shared request helpers.
