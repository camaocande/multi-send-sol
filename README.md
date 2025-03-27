# Multi-Send Solana

Solana の複数ウォレットへの一括送金スクリプト

## 機能

- 複数のウォレットアドレスへの一括送金
- バッチ処理による効率的な送金
- 送金結果の CSV ファイル出力
- テストネット/デブネット対応
- バニティアドレス対応

## 必要条件

- Node.js v16 以上
- npm または yarn
- Solana CLI（テスト用）

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/camaocande/multi-send-sol.git
cd multi-send-sol

# 依存パッケージをインストール
npm install
```

## 使用方法

1. 送信元のウォレットを準備:

```bash
# 通常のウォレット生成
node generate-test-wallet.js

# または、バニティアドレスを生成
solana-keygen grind --starts-with <希望の文字列>:1 --outfile test-wallet.json
```

2. テストネット/デブネット用の SOL を取得:

```bash
# テストネットの場合
solana airdrop 1 <ウォレットアドレス> --url https://api.testnet.solana.com

# デブネットの場合
solana airdrop 1 <ウォレットアドレス> --url https://api.devnet.solana.com
```

3. 送信先アドレスの CSV ファイルを準備:

```csv
wallet_address
<送金先アドレス1>
<送金先アドレス2>
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
