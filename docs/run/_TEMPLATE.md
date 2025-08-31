# Runログテンプレート

**実行日時 (JST)**: [YYYY-MM-DD HH:MM]  
**タスク**: [作業内容の1行説明]

## Summary
[作業の概要・目的を記述。空にしない。]

## Intent
[なぜこの作業を行ったかの意図・背景]

## Commands
```bash
# VS Code extension開発コマンド例
npm run compile
npm run build  
npm run watch
npm run package
npm run publish
npm run lint

# テスト関連
npm test
npm run test:unit

# VS Code Extension Host での動作確認
code --install-extension ./StrataRegula-x.x.x.vsix
code --uninstall-extension Unizontechcoltd.StrataRegula

# TypeScript関連
tsc -p ./
tsc --watch

# 開発環境
code . # VS Code で開く
F5     # Extension Development Host で実行
```

## Results
- [結果の要点]
- [発生した問題と解決方法]
- [成功/失敗の判定]
- [Extension Host での動作確認結果]

## Artifacts
- [生成されたファイル・アウトプット]
- [更新されたドキュメント]
- [作成されたPR・イシュー]
- [生成された .vsix パッケージ]
- [更新された extension.ts や package.json]

## Next actions
- [次に実行すべきアクション]
- [今後の課題・改善点]
- [他のリポジトリへの展開予定]
- [VS Code Marketplace への公開予定]

---

## Notes
- **Summary必須**: 空の Summary は禁止
- **JST時刻**: 日本標準時で記録
- **コマンド記録**: 再現可能性のため実際のコマンドを記載
- **1PR=1目的**: ログも単一の目的に集中
- **Extension Testing**: 必ずExtension Development Hostでの動作確認を含める
- **Package Version**: パッケージ化する際は package.json のバージョン更新を記録