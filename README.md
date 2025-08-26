# StrataRegula VS Code Extension

Enhanced VS Code support for StrataRegula YAML Configuration Pattern Compiler.

## Features

### 🎯 **Intelligent YAML Support**
- **Syntax Highlighting**: Special highlighting for StrataRegula wildcard patterns (`*`, `**`)
- **IntelliSense**: Auto-completion for common configuration patterns
- **Snippets**: Pre-built templates for service times, resource limits, and traffic routing

### ⚡ **Integrated Commands**
- **Compile Configuration**: Right-click any YAML file to compile with StrataRegula
- **Preview Output**: See compiled results in tree format
- **Environment Check**: Run `strataregula doctor` from within VS Code

### 🛠️ **Smart Patterns**

**Wildcard Pattern Recognition:**
```yaml
service_times:
  web.*.response: 200    # Single-level wildcard
  api.**.timeout: 30     # Multi-level recursive wildcard
```

**Configuration Templates:**
- `sr-service-times`: Service timing configuration
- `sr-resource-limits`: Resource limit configuration  
- `sr-traffic-routing`: Traffic routing configuration
- `sr-complete-config`: Full configuration template

## Installation

### From VS Code Marketplace (Recommended)
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "StrataRegula"
4. Click Install

### Manual Installation
1. Download `.vsix` file from releases
2. Open VS Code
3. `Ctrl+Shift+P` → "Extensions: Install from VSIX"
4. Select the downloaded file

## Prerequisites

**StrataRegula CLI** must be installed and available in PATH:
```bash
pip install strataregula

# Verify installation
strataregula --version
```

## Usage

### 🚀 **Quick Start**

1. **Create YAML file** with StrataRegula patterns:
```yaml
service_times:
  web.*.response: 150
  api.*.timeout: 30
```

2. **Use IntelliSense**: Type `sr-` for snippet suggestions

3. **Compile Configuration**: 
   - Right-click file → "StrataRegula: Compile Configuration"
   - Or use Command Palette (`Ctrl+Shift+P`) → "StrataRegula: Compile Configuration"

### 📊 **Available Commands**

| Command | Description | Shortcut |
|---------|-------------|----------|
| `StrataRegula: Compile Configuration` | Compile YAML to Python/JSON/YAML | Right-click menu |
| `StrataRegula: Preview Compiled Output` | Show tree-formatted preview | Command Palette |
| `StrataRegula: Check Environment` | Run environment diagnostics | Command Palette |

### 🎨 **Syntax Highlighting**

**Special highlighting for:**
- ✨ **Wildcard operators**: `*` and `**`
- 🏷️ **Configuration keys**: `service_times`, `resource_limits`, `traffic_routing`
- 🔢 **Pattern values**: Numeric values in configurations
- 📝 **Service patterns**: `web.*.response` style patterns

### 📝 **Code Snippets**

Type these prefixes and press `Tab`:

- **`sr-service-times`**: Service timing template
- **`sr-resource-limits`**: Resource limits template
- **`sr-traffic-routing`**: Traffic routing template  
- **`sr-wildcard`**: Single wildcard pattern
- **`sr-recursive-wildcard`**: Recursive wildcard pattern
- **`sr-complete-config`**: Full configuration example

## Configuration

### Extension Settings

Currently no custom settings required. The extension automatically detects StrataRegula patterns in YAML files.

### StrataRegula CLI Configuration

Make sure `strataregula` command is available:
```bash
# Check if StrataRegula is installed
which strataregula  # On Unix
where strataregula  # On Windows

# Test compilation
strataregula doctor
```

## Examples

### Basic Service Configuration
```yaml
service_times:
  web.frontend.response: 200
  web.backend.response: 300
  api.v1.timeout: 30
  api.v2.timeout: 45
```

### Advanced Hierarchical Configuration  
```yaml
regions:
  tokyo:
    web.*.cpu: 80
    api.*.memory: 512
  osaka:
    web.*.cpu: 60
    api.*.memory: 256
```

## Troubleshooting

### StrataRegula Command Not Found
```bash
# Install StrataRegula
pip install strataregula

# Add to PATH if needed
export PATH=$PATH:/path/to/python/scripts
```

### Compilation Errors
1. Check YAML syntax validity
2. Run `strataregula doctor --fix-suggestions`
3. Verify file contains StrataRegula patterns

### Extension Not Activating
- Ensure you're working with `.yaml` or `.yml` files
- Check VS Code Developer Console for errors

## Development

### Building from Source
```bash
git clone https://github.com/strataregula/strataregula-vscode
cd strataregula-vscode
npm install
npm run compile
```

### Testing
- Press `F5` in VS Code to launch Extension Development Host
- Open a YAML file with StrataRegula patterns
- Test commands and IntelliSense

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Related Projects

- **[StrataRegula](https://github.com/strataregula/strataregula)** - Main YAML configuration compiler
- **[StrataRegula LSP](https://github.com/strataregula/strataregula-lsp)** - Language Server Protocol implementation

## License

This extension is licensed under the [MIT License](LICENSE).

## Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/strataregula/strataregula-vscode/issues)
- **Documentation**: [StrataRegula Docs](https://github.com/strataregula/strataregula/docs)
- **Community**: [GitHub Discussions](https://github.com/strataregula/strataregula/discussions)

---

**StrataRegula VS Code Extension v0.1.0** - Enhanced YAML configuration pattern editing with intelligent IntelliSense.