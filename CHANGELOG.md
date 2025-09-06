# Changelog

All notable changes to the "strataregula-lsp" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2025-09-06

### Fixed
- GitHub Release creation permission (403 error)
- Added `permissions: contents: write` to workflow

## [0.2.1] - 2025-09-06

### Fixed
- TypeScript compilation error with jest.setup.ts
- Release workflow with preflight checks and proper PAT handling

### Enhanced
- Added version consistency check in CI
- Added CHANGELOG validation in release workflow
- Improved release automation with npm run publish

## [0.2.0] - 2025-09-06

### Added
- StrataRegula Python パッケージ v0.3.0 との完全統合
- 新コマンド: Show Kernel Statistics (v0.3.0) - カーネル統計情報の表示
- Web View による統計情報表示機能の強化

### Enhanced
- StrataRegula v0.3.0 の新機能への対応
- パフォーマンスと安定性の向上
- 拡張機能のバージョン体系を StrataRegula コアと連携

### Dependencies
- StrataRegula Python パッケージ v0.3.0 以降が必要

## [0.1.4] - 2025-08-28

### Added
- インデックス設定オプション（include/exclude/persist/watch）
- メンテナンスコマンド（Reindex/Reset Cache/Show Stats）
- 快適運用のための設定ガイド

### Enhanced  
- パフォーマンス最適化のための設定項目
- 差分監視とキャッシュ機能の制御
- ユーザー向け設定例とベストプラクティス

## [0.1.3] - 2025-08-28

### Changed
- Removed "Language Server" / "LSP" text from user-facing messages
- Simplified messages to just "StrataRegula is ready!"
- Cleaner UI text without technical terminology

## [0.1.2] - 2025-08-28

### Fixed
- Fixed missing server directory in extension package
- Corrected .vscodeignore to include LSP server files
- Resolved "Server initialization failed" error

### Changed  
- Updated extension packaging to include all required server components

## [0.1.1] - 2025-08-28

### Changed
- Updated extension name from "strataregula-lsp" to "StrataRegula" 
- Improved package configuration for VS Code Marketplace publishing
- Enhanced authentication workflow for marketplace publication

## [0.1.0] - 2025-08-28

### Added
- 初版リリース（YAML LSP / 階層補完 / 学習型提案）
- Language Server Protocol (LSP) integration
- 階層的補完システム（深度ベース）
- 学習型パターン解析エンジン
- YAML設定ファイルの動的解析
- LSPサーバー再起動コマンド
- プライバシー保護アーキテクチャ（完全ローカル処理）

[Unreleased]: https://github.com/unizontech/strataregula-vscode/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/unizontech/strataregula-vscode/releases/tag/v0.1.0
