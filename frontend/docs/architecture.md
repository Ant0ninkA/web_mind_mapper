# Frontend Architecture Diagrams

Generated from the Mermaid sources in [`diagrams/`](./diagrams). Each diagram has a
`.mmd` source plus rendered `.svg` (scalable) and `.png` (2×) images.

To regenerate after editing a `.mmd`:

```bash
# from frontend/
PUPPETEER_SKIP_DOWNLOAD=true npm install --no-save @mermaid-js/mermaid-cli puppeteer
cd docs/diagrams
../../node_modules/.bin/mmdc -p puppeteer.json -i 01-architecture.mmd -o 01-architecture.svg
```

## 1. Layered architecture (module dependencies)
![Architecture](./diagrams/01-architecture.svg)

## 2. Routing map
![Routing](./diagrams/02-routing.svg)

## 3. Editor component hierarchy (`/map/:id`)
![Editor tree](./diagrams/03-editor-tree.svg)

## 4. Editor state & data flow
![Data flow](./diagrams/04-data-flow.svg)

## 5. API layer → backend endpoints
![API layer](./diagrams/05-api-layer.svg)

## 6. Auth / session sequence
![Auth sequence](./diagrams/06-auth-sequence.svg)
