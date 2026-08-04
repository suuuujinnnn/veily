# Repository working rules

- Keep the component-based `src` architecture; never consolidate the app into one source file.
- Use `npm run dev` for development and `npm run export:html` only when creating the shareable `dist-single/index.html` artifact.
- Portable builds use `HashRouter`, local mock data, and bundled assets; they must run without a backend or web server.
- Treat `dist-single` as generated output: never edit it or read it as implementation reference.
- For later changes, inspect the requested page/component/data file and its direct dependencies first. Do not scan or reread the whole repository by default.
