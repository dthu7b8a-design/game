# Reset Year

Reset Year is a browser-based narrative adventure created by a six-person team. Players follow three characters through branching choices, multiple endings and two mini-games.

Read the [Chinese README](README.md) for screenshots, installation, controls, architecture, contributor context and known limitations. The game uses static HTML, CSS, JavaScript, jQuery and browser localStorage; no server account or cloud sync is provided.

```bash
git clone https://github.com/dthu7b8a-design/game.git
cd game
npm ci --ignore-scripts
npm start
```

Open <http://127.0.0.1:4173/>. Use `npm test`, `npm run check` and `npm run build` for verification and a static build. Node.js 18 or later is required for these scripts.

Local account passwords retain the original plaintext storage format; do not reuse important passwords. The source license is [Mulan PSL v2](LICENSE); third-party media provenance is documented separately in [THIRD_PARTY_ASSETS.md](docs/THIRD_PARTY_ASSETS.md).
