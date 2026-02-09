# Notes

A simple note-taking application built with Electron.

## Features

- Create, edit, and delete notes
- Cross-platform support (Linux, Windows, macOS)
- Custom frameless window design

## Development

### Prerequisites

- Node.js (v20 or higher)
- npm

### Installation

```bash
npm install
```

### Running the application

```bash
npm start
```

### Building

Build for all platforms:
```bash
npm run build
```

Build for specific platform:
```bash
npm run build -- --linux   # Linux (AppImage, deb, rpm)
npm run build -- --win     # Windows (NSIS installer, zip)
npm run build -- --mac     # macOS (DMG, zip)
```

## CI/CD

### Build Workflow

The project includes GitHub Actions workflows for automated building:

- **Build Workflow** (`.github/workflows/build.yml`): Automatically builds the application for Linux, Windows, and macOS on every push to `main`/`master` branches and pull requests. Build artifacts are uploaded and available for download in the Actions tab.

### Release Workflow

- **Release Workflow** (`.github/workflows/release.yml`): Automatically creates GitHub releases with built artifacts when you push a version tag (e.g., `v1.0.0`).

To create a release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow will build for all platforms and attach the installers to the GitHub release.

## License

ISC
