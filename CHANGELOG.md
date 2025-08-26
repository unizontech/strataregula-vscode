# Change Log

All notable changes to the "strataregula-vscode" extension will be documented in this file.

## [0.1.0] - 2025-08-26

### Added
- **Initial Release** of StrataRegula VS Code Extension
- **Syntax Highlighting** for StrataRegula YAML patterns
  - Wildcard operators (`*`, `**`) highlighting
  - Configuration key highlighting (`service_times`, `resource_limits`, etc.)
  - Pattern value highlighting for numeric configurations
- **IntelliSense Support**
  - Auto-completion for wildcard patterns
  - Smart suggestions based on StrataRegula context
- **Code Snippets**
  - `sr-service-times`: Service timing configuration template
  - `sr-resource-limits`: Resource limit configuration template
  - `sr-traffic-routing`: Traffic routing configuration template
  - `sr-wildcard`: Single wildcard pattern
  - `sr-recursive-wildcard`: Recursive wildcard pattern
  - `sr-complete-config`: Complete configuration example
- **Integrated Commands**
  - `StrataRegula: Compile Configuration`: Compile YAML files using StrataRegula CLI
  - `StrataRegula: Preview Compiled Output`: Show tree-formatted compilation preview
  - `StrataRegula: Check Environment`: Run StrataRegula environment diagnostics
- **Context Menu Integration**
  - Right-click on YAML files to access StrataRegula commands
- **Language Configuration**
  - Proper YAML language support with StrataRegula-specific enhancements
  - Auto-closing pairs and bracket matching
  - Indentation rules optimized for YAML

### Features
- **Pattern Recognition**: Automatically detects StrataRegula patterns in YAML files
- **Error Handling**: Comprehensive error messages for compilation failures
- **Progress Indicators**: Visual feedback during compilation and preview operations
- **Multi-Format Output**: Support for Python, JSON, and YAML output formats
- **Environment Integration**: Seamless integration with StrataRegula CLI

### Requirements
- VS Code ^1.74.0
- StrataRegula CLI installed and available in PATH
- Python 3.8+ (for StrataRegula CLI)

---

## Upcoming Features (Roadmap)

### [0.2.0] - Planned
- **Language Server Protocol (LSP)** integration
- **Real-time validation** of StrataRegula patterns
- **Hover documentation** for patterns and configurations
- **Go-to-definition** for pattern references
- **Refactoring support** for pattern renaming

### [0.3.0] - Planned
- **Debugging support** for StrataRegula compilation
- **Visual pattern editor** with GUI interface
- **Configuration templates** library
- **Performance profiling** integration

---

For more information about StrataRegula, visit:
- **Main Project**: https://github.com/strataregula/strataregula
- **Documentation**: https://github.com/strataregula/strataregula/docs
- **VS Code Extension**: https://github.com/strataregula/strataregula-vscode