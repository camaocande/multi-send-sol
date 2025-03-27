# Multi-Send Solana

複数の Solana ウォレットに同時に SOL を送金するためのスクリプトです。

## 機能

- CSV ファイルから複数の送金先アドレスを読み込み
- バッチ処理による効率的な送金
- 送金結果の CSV ファイル出力
- テストネット/デブネットでのテスト機能
- エラーハンドリングとリトライ機能

## 必要条件

- Node.js v16 以上
- npm または yarn
- Solana ウォレット（送信元）
- Solana CLI（テスト用）

## セットアップ

1. リポジトリをクローン:

```bash
git clone https://github.com/yourusername/multi-send.git
cd multi-send
```

2. 依存パッケージをインストール:

```bash
npm install
```

3. 送信元のキーファイルを設定:
   - 送信元のウォレットの秘密鍵を JSON ファイルとして保存
   - デフォルトでは `xxx.json` という名前で保存

## 使用方法

### メインネットでの実行

```bash
node solana-batch-transfer.js
```

### テストネットでの実行

```bash
node solana-batch-transfer.js testnet
```

### デブネットでの実行

```bash
node solana-batch-transfer.js devnet
```

### テスト用のキーペア生成

## テストネット/デブネットでのテスト

1. テスト用のキーペアを生成:

```bash
node generate-test-wallet.js
```

2. テストネット/デブネットで SOL を取得:

   ### CLI を使用する場合

   ```bash
   # テストネットの場合
   solana airdrop 1 <公開鍵> --url https://api.testnet.solana.com

   # デブネットの場合
   solana airdrop 1 <公開鍵> --url https://api.devnet.solana.com
   ```

   ### Web Faucet を使用する場合

   - [Solana Faucet](https://solfaucet.com/) にアクセス
   - 生成した公開鍵を入力して SOL を取得

3. テスト用の CSV ファイルを作成:

```csv
wallet_address
<テスト用の送金先アドレス1>
<テスト用の送金先アドレス2>
```

4. スクリプトを実行:

```bash
# テストネットの場合
node solana-batch-transfer.js testnet

# デブネットの場合
node solana-batch-transfer.js devnet
```

## 設定オプション

`solana-batch-transfer.js` の `CONFIG` オブジェクトで以下の設定が可能です：

- `keyPath`: 送信元のキーファイルパス
- `csvPath`: 送信先アドレスの CSV ファイルパス
- `outputPath`: 結果を保存する CSV ファイルパス（自動的に日時付きのファイル名が生成されます）
- `solPerWallet`: 1 ウォレットあたりの送金額 (SOL)
- `batchSize`: 1 トランザクションあたりの最大送金数
- `network`: 使用するネットワーク (mainnet/testnet/devnet)
- `rpcUrl`: カスタム RPC URL
- `confirmationLevel`: トランザクション確認レベル

## 結果ファイル

送金結果は以下の形式の CSV ファイルに保存されます：

```csv
wallet_address,status,transaction_signature,timestamp,batch_number
<送金先アドレス>,success/failed,<トランザクション署名>,<タイムスタンプ>,<バッチ番号>
```

## 注意事項

- 送金前に十分な SOL 残高があることを確認してください
- テストネット/デブネットでは、より大きな金額でテストが可能です
- 秘密鍵は安全に管理し、公開しないでください
- テスト用のキーペアは本番環境では使用しないでください

## トラブルシューティング

1. 残高不足エラー

   - 送信元ウォレットの残高を確認
   - テストネット/デブネットの場合は、Faucet から SOL を取得

2. トランザクション失敗

   - RPC ノードの状態を確認
   - ネットワークの混雑状況を確認
   - バッチサイズを小さくして再試行

3. キーファイルエラー
   - キーファイルのパスが正しいか確認
   - キーファイルの形式が正しいか確認

## ライセンス

MIT

## 作者

camao

## 貢献

バグ報告や機能改善の提案は、GitHub の Issue でお願いします。
プルリクエストも歓迎です。

```

```
