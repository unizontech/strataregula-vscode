# Contributing

- PR は小さく、1 PR = 1 目的。
- `docs/run/*.md` に記録する Runログの Summary は必ず非空にしてください。
- CI must be green before merging.

Thank you for your interest in contributing to StrataRegula VS Code Extension!

## Development Setup

### Prerequisites
- Node.js 20+ and npm
- VS Code (latest stable version)
- Git
- TypeScript knowledge

### Setup
```bash
git clone https://github.com/unizontech/strataregula-vscode.git
cd strataregula-vscode
npm install
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow TypeScript best practices
   - Update language definitions in `syntaxes/` if needed
   - Add/update commands in `src/extension.ts`
   - Update `package.json` for new commands/settings

3. **Test Changes**
   ```bash
   # Compile TypeScript
   npm run compile
   
   # Build for packaging
   npm run build
   
   # Package extension
   npm run package
   ```

4. **Manual Testing**
   - Press `F5` in VS Code to launch Extension Development Host
   - Test YAML intellisense and completion
   - Test StrataRegula commands
   - Verify language server integration

5. **Submit Pull Request**

## Code Style

- **TypeScript**: Follow VS Code extension patterns
- **Language Files**: JSON format for syntax highlighting and snippets
- **Configuration**: VS Code contribution points in `package.json`
- **LSP Integration**: Proper Language Server Protocol implementation

## Extension Architecture

### Core Components
- **`src/extension.ts`**: Main extension entry point
- **`syntaxes/strataregula.tmGrammar.json`**: YAML syntax highlighting
- **`snippets/strataregula.json`**: Code snippets
- **`language-configuration.json`**: Language configuration
- **`server/lsp_server.py`**: Python LSP server integration

### Key Features
- **YAML IntelliSense**: Auto-completion for StrataRegula patterns
- **Syntax Highlighting**: Enhanced YAML syntax with StrataRegula keywords
- **Command Integration**: Direct access to StrataRegula CLI commands
- **LSP Communication**: Real-time analysis and validation

### VS Code Integration Points
- **Languages**: Register `strataregula-yaml` language
- **Commands**: StrataRegula CLI integration commands
- **Configuration**: Extension settings and preferences
- **Menus**: Context menu integration for YAML files

## Testing

### Manual Testing Checklist
- [ ] Extension activates on YAML files
- [ ] Syntax highlighting works correctly
- [ ] Auto-completion provides relevant suggestions
- [ ] Commands execute without errors
- [ ] Status bar shows extension state
- [ ] Settings are respected

### Extension Development
```bash
# Launch development instance
code --extensionDevelopmentPath=.

# Install locally for testing
code --install-extension StrataRegula-*.vsix
```

## Language Server Protocol

The extension integrates with StrataRegula LSP server:
- **Completion**: Pattern-aware auto-completion
- **Diagnostics**: Real-time validation and error checking
- **Hover**: Documentation on hover
- **Definition**: Go-to-definition for patterns

## Packaging and Distribution

### Building Release
```bash
# Update version in package.json
npm version patch|minor|major

# Package extension
npm run package

# Publish to marketplace (maintainers only)
npm run publish
```

### Extension Manifest
Update `package.json` for:
- New commands and keybindings
- Configuration properties
- Activation events
- Dependencies and engines

## Quality Standards

- **Extension Guidelines**: Follow VS Code extension best practices
- **Performance**: Minimal startup impact
- **Accessibility**: Keyboard navigation support
- **Internationalization**: Prepare for i18n if needed

## Documentation

Link to detailed developer documentation: [docs/README_FOR_DEVELOPERS.md](docs/README_FOR_DEVELOPERS.md)

## License

By contributing, you agree that your contributions will be licensed under Apache License 2.0.