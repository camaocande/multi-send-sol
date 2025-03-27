# Solana バッチ送金スクリプト

このスクリプトは、Solanaブロックチェーン上で複数のウォレットアドレスに効率的にSOLを送金するためのツールです。1つのトランザクションで最大20アドレスに同時に送金できるため、トランザクション手数料を大幅に削減できます。

## 特徴

- 1トランザクションで最大20アドレスへの送金
- CSVファイルからのウォレットアドレス一括読み込み
- トランザクション結果の自動記録
- カスタムRPCエンドポイントのサポート
- バッチ処理による大量ウォレットへの効率的な送金
- 詳細なエラーハンドリングと再試行オプション

## 前提条件

- Node.js（バージョン14以上推奨）
- npm または yarn

## セットアップ

1. リポジトリをクローンするか、ファイルをダウンロードします。

2. 依存パッケージをインストールします：

```bash
npm install
```

または

```bash
yarn install
```

3. 設定を準備します：

- `xxx.json` - 送信元のSolanaキーペアJSONファイル
- `wallets.csv` - 送金先ウォレットアドレスリスト（1行に1アドレス、またはヘッダー付きCSV）

## 使用方法

### 基本的な実行方法

```bash
node solana-batch-transfer.js
```

### カスタムRPCエンドポイントを指定する場合

```bash
node solana-batch-transfer.js https://your-custom-rpc-endpoint.com
```

または環境変数として設定：

```bash
RPC_URL=https://your-custom-rpc-endpoint.com node solana-batch-transfer.js
```

### CSV形式

最もシンプルなCSV形式：

```
wallet_address
7KkMnQMz41jFS7xi5L2p8g43BCjHY11SSZZnAEANPS2e
3zXeqNcyoFPdAyTEXnBTtvKxn4y9zh3c8jsFPM3DgXLs
...
```

ヘッダーがある場合は、`wallet_address` または `address` という列名を使用してください。列名がない場合は、最初の列がウォレットアドレスとして使用されます。

## 設定

スクリプト内の `CONFIG` オブジェクトで以下のパラメータを変更できます：

- `keyPath`: 送信元のキーファイルのパス（デフォルト: './xxx.json'）
- `csvPath`: 送金先アドレスのCSVファイルパス（デフォルト: './wallets.csv'）
- `outputPath`: 結果を保存するCSVファイルパス（デフォルト: './distribution_results.csv'）
- `solPerWallet`: 1ウォレットあたりの送金額（SOL）（デフォルト: 0.1）
- `batchSize`: 1トランザクションあたりの最大送金数（デフォルト: 20）
- `rpcUrl`: デフォルトのRPC URL（環境変数またはコマンドラインで上書き可能）
- `confirmationLevel`: トランザクション確認レベル（'confirmed' または 'finalized'）

## 結果ファイル

スクリプトは処理結果を `distribution_results.csv` ファイルに出力します。各行には以下の情報が含まれます：

- `wallet_address`: 送金先のウォレットアドレス
- `status`: 送金状態（'success' または 'failed'）
- `transaction_signature`: 成功したトランザクションの署名（失敗の場合は 'N/A'）
- `timestamp`: 処理が行われた日時
- `batch_number`: どのバッチで処理されたか

## 注意事項

- スクリプト実行前に十分なSOL残高があることを確認してください。
- Solanaネットワークの混雑状況によっては、バッチサイズを小さくする必要がある場合があります。
- デフォルトでは1トランザクションあたり最大20アドレスに送金します。トランザクションサイズの制限により、これ以上増やすと失敗する可能性があります。
