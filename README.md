# StrataRegula LSP

動的設定ファイルの学習型インテリセンス。YAMLを解析し、**頻度/階層ベース**で補完候補を提案します。

## ✨ 主な機能

### 🧠 学習型インテリセンス
- プロジェクトのYAMLファイルを解析して使用パターンを学習
- 頻度ベースで最適な補完候補を提案
- 階層的補完：深度に応じた候補（環境/サービス/設定タイプ）

### ⚡ 高速補完
- `prod.` → 環境名の補完
- `web.` → サービス名の補完  
- `database.` → 設定タイプの補完
- フォールバック：学習データなしでも基本補完を提供

### 🔧 Language Server Protocol (LSP)
- 標準LSPによる高性能な解析エンジン
- リアルタイムパターン認識
- VS Code以外のエディタにも将来対応予定

## 🚀 使い方

1. 拡張機能をインストール
2. YAML ファイルを開く
3. `prod.`, `web.`, `database.` などを入力すると補完が表示
4. Ctrl+Space で手動補完トリガー

### 補完例
```yaml
service_times:
  prod.    # ← ここで補完候補が表示
  
resource_limits:
  web.     # ← サービス名補完
  
environments:
  production:
    database.  # ← 設定タイプ補完
```

## 📋 コマンド

- `StrataRegula: Restart Language Server` - LSPサーバー再起動

## ⚙️ 設定

- `strataregulaLsp.maxSuggestions` (既定: 6) - 補完候補の最大数
- `strataregulaLsp.telemetry` (既定: false) - 匿名テレメトリ

## 🔒 プライバシー

- **完全ローカル処理**: すべての解析がユーザー環境内で完結
- **外部通信なし**: ネットワーク接続は一切行いません
- **データ保護**: 設定ファイルの内容が外部に送信されることはありません

## 📊 互換性

- **VS Code**: 1.90+ 
- **ファイル形式**: YAML (`.yaml`, `.yml`)
- **動作環境**: Windows, macOS, Linux

## 🔧 トラブルシューティング

### LSPが起動しない場合
1. コマンドパレット → "StrataRegula: Restart Language Server"
2. VS Codeを再起動
3. Python環境の確認（LSPサーバーはPythonで動作）

## 📚 開発者向け

このプロジェクトはUML駆動開発アプローチで設計されています：
- [GitHub - strataregula-lsp](https://github.com/unizontech/strataregula-lsp)
- [UML設計文書](https://github.com/unizontech/strataregula-lsp/tree/main/docs)

## 📝 更新履歴

### 0.1.0 - 2025-08-28
- 初版リリース
- YAML LSPサーバー統合
- 階層的補完機能
- 学習型提案エンジン
- LSPサーバー再起動コマンド

## 📄 ライセンス

Apache-2.0