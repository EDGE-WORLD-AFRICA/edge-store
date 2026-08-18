# Edge Store App

A cross-platform desktop application for managing store inventory, sales, and operations. Built with Tauri, React, and TypeScript.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v8 or higher) - [Install Guide](https://pnpm.io/installation)
- **Rust** (latest stable) - [Install Guide](https://www.rust-lang.org/tools/install)
- **Tauri CLI** - Will be installed automatically via pnpm

### Platform-Specific Requirements

#### Windows
- Microsoft Visual Studio C++ Build Tools
- WebView2 Runtime (pre-installed on Windows 11)

#### macOS
- Xcode Command Line Tools: `xcode-select --install`

#### Linux
- webkit2gtk: `sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`

## Installation

1. **Clone the repository**
   ```bash
      git clone <repository-url>
      cd edge-store
      pnpm install

      cd apps/edge-store-app
      pnpm install
      pnpm tauri dev (to run with tauri application window )
      pnpm dev (to run only browser version  but Tauri-specific features (like device fingerprinting) will not work.)