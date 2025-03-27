# Multi-Send Solana

Solana のバッチ送金ツールです。複数のウォレットアドレスに対して、一度に SOL を送金することができます。

## 機能

- 複数のウォレットアドレスへの一括送金
- CSV ファイルからの送金先アドレスと金額の読み込み
- 送金状況のリアルタイム表示
- エラーハンドリングとリトライ機能

## 必要条件

- Node.js v14 以上
- npm または yarn
- Solana ウォレット（送金元）

## インストール

1. リポジトリをクローン

```bash
git clone https://github.com/camaocande/multi-send-sol.git
cd multi-send-sol
```

2. 依存パッケージのインストール

```bash
npm install
```

## 使い方

1. 送金先アドレスと金額を CSV ファイルに記載します。

   - フォーマット: `address,amount`
   - 例:
     ```
     address,amount
     ABC123...,1.5
     DEF456...,2.0
     ```

2. プログラムを実行

```bash
node solana-batch-transfer.js
```

3. 送金元のウォレットを接続し、送金を承認します。

## 注意事項

- 送金前に十分な SOL 残高があることを確認してください
- テストネットでの動作確認をお勧めします
- 大量の送金を行う場合は、適切な間隔を設定してください

## ライセンス

MIT

## 作者

camaocande
