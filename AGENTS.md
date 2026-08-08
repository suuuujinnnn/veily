# Repository working rules

- Keep the component-based `src` architecture; never consolidate the app into one source file.
- Use `npm run dev` for development and `npm run build` for production verification.
- Keep mock data in `src/data` and reusable UI in `src/components`; do not add generated artifacts to the repository.
- For later changes, inspect the requested page/component/data file and its direct dependencies first. Do not scan or reread the whole repository by default.
