# 開発前に必ず読む資料

> 🔗 必読: [AGENTS.md](../AGENTS.md) – 自動化手順／Run Log ルール（Summary 非空・JST）

## 基本ポリシー
- 1 PR = 1 目的
- Runログは `docs/run/*.md` に必ず追加（Summary / Intent / Next actions）
- CI は常にグリーン維持
- Extension Development Host での動作確認必須

## よく使うコマンド

### 開発・ビルド
```bash
# TypeScript コンパイル
npm run compile
npm run build

# 開発モード（ファイル監視）
npm run watch

# リンター実行
npm run lint

# パッケージ化
npm run package

# Marketplace 公開
npm run publish
```

### テスト・デバッグ
```bash
# テスト実行
npm test
npm run test:unit

# VS Code Extension Host で動作確認
F5  # VS Code内でExtension Development Host起動

# 拡張機能のインストール・削除
code --install-extension ./StrataRegula-x.x.x.vsix
code --uninstall-extension Unizontechcoltd.StrataRegula
```

### Language Server 関連
```bash
# LSP server 再起動 (コマンドパレット)
Ctrl+Shift+P > "StrataRegula: Restart Server"

# キャッシュリセット
Ctrl+Shift+P > "StrataRegula: Reset/Flush Cache"

# インデックス統計表示
Ctrl+Shift+P > "StrataRegula: Show Index Stats"
```

## 開発フロー
1. ブランチ作成: `git checkout -b feature/your-feature`
2. 実装・テスト
   - `npm run watch` でファイル監視開始
   - F5 で Extension Development Host 起動
   - VS Code でYAMLファイル開いてインテリセンス動作確認
3. ビルド・パッケージ化: `npm run build && npm run package`
4. コミット・プッシュ
5. PR作成（このテンプレートのチェックリスト確認）

## ディレクトリ構成
```
strataregula-vscode/
├── src/                    # TypeScript ソースコード
│   └── extension.ts        # メインエントリーポイント
├── out/                    # コンパイル済みJavaScript
├── server/                 # Language Server (Python)
│   └── lsp_server.py
├── syntaxes/              # TextMate Grammar
├── snippets/              # VS Code スニペット
├── assets/                # アイコン等のリソース
├── docs/                  # ドキュメント
│   └── run/               # 開発作業ログ
├── package.json           # 拡張機能マニフェスト
├── tsconfig.json          # TypeScript設定
└── language-configuration.json  # 言語設定
```

## VS Code Extension 開発のポイント

### 1. package.json の重要項目
- `activationEvents`: 拡張機能がアクティベートされるタイミング
- `contributes.commands`: コマンドパレットに追加されるコマンド
- `contributes.configuration`: 設定項目の定義
- `main`: エントリーポイント (`./out/extension.js`)

### 2. 動作確認方法
- F5 キーで Extension Development Host を起動
- 別のVS Codeインスタンスで拡張機能をテスト
- コマンドパレット (Ctrl+Shift+P) でコマンド実行確認
- YAMLファイルでインテリセンス動作確認

### 3. デバッグ
- `console.log()` は Extension Development Host の出力パネルに表示
- VS Code のデベロッパーツール (Help > Toggle Developer Tools) を活用
- Language Server のログは独立したプロセスで確認

### 4. パッケージ化・公開
- `npm run package` で `.vsix` ファイル生成
- `npm run publish` で VS Code Marketplace に公開
- `package.json` のバージョン番号更新を忘れずに

## トラブルシューティング

### Language Server が起動しない
```bash
# Python環境確認
python --version
python -c "import sys; print(sys.path)"

# LSP server を直接実行
python server/lsp_server.py
```

### インテリセンスが効かない
1. `Ctrl+Shift+P > "StrataRegula: Restart Server"`
2. `Ctrl+Shift+P > "StrataRegula: Reset/Flush Cache"`
3. `Ctrl+Shift+P > "StrataRegula: Show Index Stats"` でファイル認識確認

### 拡張機能が認識されない
1. `package.json` の `activationEvents` を確認
2. Extension Host でエラーログ確認
3. コンパイルエラーがないか `npm run compile` で確認

## 開発時の注意事項
- TypeScript の型安全性を活用し、`any` 型は避ける
- VS Code API の変更に注意（`engines.vscode` でサポート範囲指定）
- Language Server との通信は非同期で行う
- リソース（ファイルウォッチャー等）の適切な dispose を実装
- テレメトリはデフォルト OFF を維持（プライバシー配慮）

## 関連リンク
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)