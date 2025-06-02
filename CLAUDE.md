# Journal MCP Server

npx配布のMCP serverでジャーナル機能を提供。Markdownファイルでエントリを保存し、React Router v7のWebビューアも同時起動。

## 概要

- **配布方法**: npx
- **データ保存**: Markdownファイル (`~/.local/share/journal-mcp/`)
- **機能**: MCPサーバー + Webビューア同時起動
- **対象**: Claude Code用MCP server

## 技術構成

### パッケージ構成

```json
{
  "name": "@coji/journal-mcp",
  "version": "1.0.0",
  "description": "MCP server for journal entries with web viewer",
  "type": "module",
  "bin": {
    "journal-mcp": "./dist/index.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "npm run build:server && npm run build:web",
    "build:server": "tsc -p tsconfig.server.json",
    "build:web": "react-router build",
    "dev:web": "react-router dev",
    "dev:server": "tsc --watch",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "gray-matter": "^4.0.3",
    "fast-glob": "^3.3.2",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router": "^7.0.0",
    "@react-router/node": "^7.0.0",
    "@react-router/serve": "^7.0.0",
    "isbot": "^4.1.0"
  },
  "devDependencies": {
    "@react-router/dev": "^7.0.0",
    "@types/react": "^18.2.20",
    "@types/react-dom": "^18.2.7",
    "@types/node": "^20.0.0",
    "typescript": "^5.1.0",
    "vite": "^5.0.0"
  },
  "engines": {
    "node": ">=18"
  },
  "keywords": ["mcp", "journal", "claude-code", "markdown"],
  "license": "MIT"
}
```

### ファイル構造

```
journal-mcp-server/
├── package.json
├── tsconfig.json
├── tsconfig.server.json
├── react-router.config.ts
├── vite.config.ts
├── src/
│   ├── index.ts              # エントリーポイント（MCP + Web同時起動）
│   ├── setup.ts              # Claude Desktop設定自動追加
│   ├── mcp-server.ts         # MCPサーバー実装
│   ├── web-server.ts         # Webサーバー実装
│   ├── journal/
│   │   ├── manager.ts        # ジャーナル管理（ファイル操作）
│   │   ├── search.ts         # 検索機能
│   │   └── types.ts          # 型定義
│   └── utils/
│       ├── paths.ts          # パス管理（XDG準拠）
│       ├── files.ts          # ファイル操作ユーティリティ
│       └── system.ts         # システムコマンド検出
├── app/
│   ├── root.tsx              # React Router v7 root
│   ├── routes.ts             # ルート定義
│   ├── routes/
│   │   ├── home.tsx          # ホーム（最近のエントリ）
│   │   ├── entries.$date.tsx # 日付別エントリ
│   │   ├── search.tsx        # 検索ページ
│   │   └── tags.tsx          # タグ一覧
│   └── components/
│       ├── EntryCard.tsx
│       ├── SearchForm.tsx
│       └── TagList.tsx
├── public/
├── dist/                     # ビルド出力
└── README.md
```

## 機能仕様

### MCPサーバー機能

- `add_entry` - 新しいジャーナルエントリを追加（同日なら既存ファイルに追記）
- `search_entries` - エントリ検索（日付、タグ、キーワード）
- `get_recent_entries` - 最近のエントリ取得
- `list_tags` - 使用されているタグ一覧
- `get_entry_by_date` - 特定日のエントリ取得
- `get_daily_summary` - 日別サマリー表示

### セットアップ機能

- `--setup` - Claude Desktopの設定ファイルに自動追加
- 設定ファイルの自動検出（Mac/Windows）
- バックアップ作成
- 既存設定の保持

### Webビューア機能

- エントリ一覧表示（時系列）
- 日付別エントリ表示
- タグベース検索
- キーワード検索
- エントリ作成・編集（簡易）
- 日別統計表示（エントリ数、タグ使用状況）

## データ形式

### 保存場所

- **パス**: `~/.local/share/journal-mcp/`
- **XDG準拠**: `XDG_DATA_HOME/journal-mcp/`

### ディレクトリ構造

```
~/.local/share/journal-mcp/
├── entries/
│   ├── 2025/
│   │   ├── 06/
│   │   │   ├── 2025-06-01.md
│   │   │   └── 2025-06-02.md
│   │   └── 05/
│   └── 2024/
├── config.json              # 設定ファイル
└── .gitignore               # 自動生成
```

### Markdownファイル形式

```markdown
---
title: "2025-06-02"
tags: ["work", "learning", "api", "meeting"]
created: "2025-06-02T09:30:00+09:00"
updated: "2025-06-02T17:45:00+09:00"
entries_count: 3
---

# 2025-06-02

## 09:30 - Project Alpha
- 新しいAPIの設計を検討
- パフォーマンス要件の確認
- #api #design #alpha

## 14:00 - Learning Session
- MCPサーバーの実装方法を学習
- React Router v7の新機能調査
- #learning #mcp #react

## 17:45 - Meeting Notes (追加: Claude Chat #2)
- チームミーティング
- 来週のスプリント計画
- #meeting #team

---
*最終更新: 2025-06-02 17:45 | エントリ数: 3*
```

## 使用方法

### セットアップ（推奨）

```bash
# Claude Desktopの設定に自動追加
npx @coji/journal-mcp --setup

# 設定確認
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json  # Mac
cat %APPDATA%\Claude\claude_desktop_config.json  # Windows
```

### 手動設定

```json
{
  "mcpServers": {
    "journal": {
      "command": "npx",
      "args": ["@coji/journal-mcp"]
    }
  }
}
```

### 実行

```bash
# Claude Desktopが自動で起動（MCPサーバー + Webビューア同時起動）
# Webビューア: http://localhost:3000

# 手動起動（開発時）
npx @coji/journal-mcp
```

### Claude Desktopでの使用例

```
"今日学んだReactの新機能をジャーナルに記録して"
"先週のAPI開発関連のメモを検索して"
"プロジェクトAlphaのタグが付いたエントリを全て表示して"
"今日のジャーナルに会議の内容を追加して"
"昨日何をしたか教えて"
```

### ジャーナル管理の特徴

**同日複数エントリ:**
- 同じ日の複数チャットからの追記は1つのMarkdownファイルに統合
- 時系列でエントリが追加される
- frontmatterのタグとメタデータは自動更新

**ファイル操作:**
- **ロック機能**: 同時書き込み時の競合回避
- **自動バックアップ**: 追記前に既存内容を保護
- **タグ統合**: 新しいタグを既存タグリストにマージ
- **メタデータ更新**: updated時刻とエントリ数の自動更新

**検索とフィルタ:**
- 日付範囲指定での検索
- タグの組み合わせ検索
- 本文の全文検索（正規表現対応）
- エントリ数やタグ使用頻度による並び替え

## セットアップ詳細

### 自動設定機能

`--setup`オプションで以下を自動実行：

1. **設定ファイル検出**
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **バックアップ作成**
   - 既存設定を `.backup` として保存

3. **設定追加**
   ```json
   {
     "mcpServers": {
       "journal": {
         "command": "/usr/local/bin/npx",
         "args": ["@coji/journal-mcp"],
         "env": {
           "JOURNAL_PORT": "3000"
         }
       }
     }
   }
   ```

4. **npxパス自動検出**
   - `which npx` (Unix/Mac)
   - `where npx` (Windows)
   - フルパスで設定してClaude Desktopから確実に実行

5. **検証**
   - JSON形式の妥当性チェック
   - 重複設定の確認
   - npxコマンドの存在確認

### 設定オプション

```bash
# 基本セットアップ
npx @coji/journal-mcp --setup

# ポート指定
npx @coji/journal-mcp --setup --port 3001

# 設定ファイルパス指定
npx @coji/journal-mcp --setup --config-path /path/to/config.json

# 既存設定を上書き
npx @coji/journal-mcp --setup --force
```

## 技術的詳細

### 依存関係

- **MCP SDK**: `@modelcontextprotocol/sdk`
- **ファイル処理**: `gray-matter`, `fast-glob`
- **Web**: `react-router`, `@react-router/node`, `@react-router/serve`
- **ビルド**: `@react-router/dev`, `typescript`, `vite`

### 特徴

- **ネイティブ依存なし**: npx高速化
- **ポータブル**: Markdownファイルで他ツール連携可能
- **XDG準拠**: Linux標準のディレクトリ配置
- **同時起動**: MCPサーバーとWebビューアが1コマンドで起動

### 検索機能

- ファイル名による日付検索
- frontmatterによるタグ検索
- 本文の全文検索（正規表現対応）
- 複合条件検索
- エントリ数による日別フィルタ
- タグ使用頻度分析
