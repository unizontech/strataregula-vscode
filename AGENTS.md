# AGENTS

自動化エージェントの責務・手順・Runログ様式を定義します。

## 共通原則
- **1 PR = 1 目的**
- **Runログは必ず作成**（Summary は非空、JSTで保存）

## Run Log Agent
- 目的: コマンド実行結果を `docs/run/*.md` に記録して可観測性を高める
- 優先度:
  1) `scripts/new_run_log.py` がある場合（例: world-simulation）
  2) 無ければ `tools/runlog.py`（軽量版）
  3) さらに無ければ `tools/runlog.sh`

### 使い方
```bash
# Python (軽量版)
python tools/runlog.py \
  --label smoke \
  --summary "smoke for cli/tests" \
  --intent "verify unified env works"

# シェル版（最短）
./tools/runlog.sh smoke "smoke for cli/tests" "verify unified env works"
```

## Extension Development Agent
- 目的: VS Code拡張機能の開発・テスト・パッケージ化の自動化
- ライフサイクル管理: 開発、デバッグ、テスト、公開
- 品質保証: TypeScript型チェック、ESLint、Extension Host テスト

### 使い方
```bash
# 拡張機能ビルド
npm run compile
npm run watch

# テスト実行
npm run test

# VSIX パッケージ作成
vsce package

# マーケットプレイス公開
vsce publish
```

## Marketplace Publishing Agent
- 目的: VS Code Marketplace への自動公開とバージョン管理
- リリース管理: セマンティックバージョニング、チェンジログ生成
- 品質ゲート: 公開前の自動テストとバリデーション

### 使い方
```bash
# バージョンバンプ
npm version patch  # or minor, major

# リリース準備
npm run prepare-release

# マーケットプレイス公開
npm run publish

# リリースノート生成
npm run generate-changelog
```

## ログサンプル（JST）

```markdown
# Run Log - extension-test
- When: 2025-08-30T20-00JST
- Repo: strataregula-vscode
- Summary: VS Code extension smoke test and package validation

## Intent
verify extension functionality and prepare for marketplace release

## Commands
npm run compile
npm run test
vsce package --out StrataRegula-test.vsix

## Results
- TypeScript compilation: ✓ no errors
- extension tests: 12 passed
- VSIX package: 1.2MB, validated successfully
- marketplace requirements: all met

## Next actions
- update README with new features
- create release notes for v0.2.0
- schedule marketplace publishing
```

**タグ**: #automation #agents #runlog #vscode #extension #marketplace
