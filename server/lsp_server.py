#!/usr/bin/env python3
"""
LSP Server launcher for StrataRegula VS Code extension
This script starts the StrataRegula LSP server with proper path resolution
"""
import sys
import os
from pathlib import Path

def main():
    # Add the StrataRegula LSP package to Python path
    current_dir = Path(__file__).parent
    
    # Look for strataregula-lsp in common locations
    lsp_paths = [
        # Same parent directory as extension (development)
        current_dir.parent.parent / "strataregula-lsp",
        # User's project directory
        Path.home() / "project" / "strataregula-lsp",
        # Global installation path
        Path("/usr/local/lib/strataregula-lsp"),
    ]
    
    lsp_server_path = None
    for path in lsp_paths:
        if path.exists() and (path / "strataregula_lsp").exists():
            lsp_server_path = path
            break
    
    if not lsp_server_path:
        print(f"Error: Could not find strataregula-lsp installation", file=sys.stderr)
        print(f"Searched paths: {[str(p) for p in lsp_paths]}", file=sys.stderr)
        sys.exit(1)
    
    # Add to Python path
    sys.path.insert(0, str(lsp_server_path))
    
    try:
        # Import and run the LSP server
        from strataregula_lsp.server import main as server_main
        server_main()
    except ImportError as e:
        print(f"Error importing StrataRegula LSP server: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error starting StrataRegula LSP server: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()