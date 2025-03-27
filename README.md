# Solana バッチ送金ツール

このツールは、Solana ブロックチェーン上で複数のウォレットアドレスに効率的に SOL を送金するためのスクリプトです。1 つのトランザクションで最大 20 アドレスに同時に送金できるため、トランザクション手数料を大幅に削減できます。

## 特徴

- 1 トランザクションで最大 20 アドレスへの送金
- CSV ファイルからのウォレットアドレス一括読み込み
- トランザクション結果の自動記録
- カスタム RPC エンドポイントのサポート
- バッチ処理による大量ウォレットへの効率的な送金
- 詳細なエラーハンドリングと再試行オプション
- 送金状況のリアルタイム表示
- 送金結果のログ出力

## 前提条件

- Node.js（バージョン 14 以上推奨）
- npm または yarn
- @solana/web3.js
- @solana/spl-token

## セットアップ

1. リポジトリをクローン

```bash
git clone https://github.com/camaocande/multi-send-sol.git
cd multi-send-sol
```

2. 依存パッケージをインストール

```bash
npm install
```

または

```bash
yarn install
```

3. 設定を準備

- `xxx.json` - 送信元の Solana キーペア JSON ファイル
- `wallets.csv` - 送金先ウォレットアドレスリスト

## 使用方法

### 基本的な実行方法

```bash
node solana-batch-transfer.js
```

### カスタム RPC エンドポイントを指定する場合

```bash
node solana-batch-transfer.js https://your-custom-rpc-endpoint.com
```

または環境変数として設定：

```bash
RPC_URL=https://your-custom-rpc-endpoint.com node solana-batch-transfer.js
```

### CSV 形式

最もシンプルな CSV 形式：

```
wallet_address
7KkMnQMz41jFS7xi5L2p8g43BCjHY11SSZZnAEANPS2e
3zXeqNcyoFPdAyTEXnBTtvKxn4y9zh3c8jsFPM3DgXLs
...
```

ヘッダーがある場合は、`wallet_address` または `address` という列名を使用してください。

## 設定オプション

スクリプト内の `CONFIG` オブジェクトで以下のパラメータを変更できます：

- `keyPath`: 送信元のキーファイルのパス（デフォルト: './xxx.json'）
- `csvPath`: 送金先アドレスの CSV ファイルパス（デフォルト: './wallets.csv'）
- `outputPath`: 結果を保存する CSV ファイルパス（デフォルト: './distribution_results.csv'）
- `solPerWallet`: 1 ウォレットあたりの送金額（SOL）（デフォルト: 0.1）
- `batchSize`: 1 トランザクションあたりの最大送金数（デフォルト: 20）
- `rpcUrl`: デフォルトの RPC URL
- `confirmationLevel`: トランザクション確認レベル（'confirmed' または 'finalized'）
- `DELAY_BETWEEN_TRANSFERS`: 送金間隔（ミリ秒）
- `MAX_RETRIES`: エラー時の最大リトライ回数
- `RETRY_DELAY`: リトライ間隔（ミリ秒）

## 結果ファイル

スクリプトは処理結果を `distribution_results.csv` ファイルに出力します。各行には以下の情報が含まれます：

- `wallet_address`: 送金先のウォレットアドレス
- `status`: 送金状態（'success' または 'failed'）
- `transaction_signature`: 成功したトランザクションの署名（失敗の場合は 'N/A'）
- `timestamp`: 処理が行われた日時
- `batch_number`: どのバッチで処理されたか

## 注意事項

- スクリプト実行前に十分な SOL 残高があることを確認してください
- Solana ネットワークの混雑状況によっては、バッチサイズを小さくする必要がある場合があります
- デフォルトでは 1 トランザクションあたり最大 20 アドレスに送金します
- 送金先アドレスの形式が正しいことを確認してください
- 送金金額は SOL 単位で指定してください

## トラブルシューティング

1. 送金が失敗する場合

   - 送金元のウォレットに十分な SOL があるか確認
   - 送金先アドレスの形式が正しいか確認
   - ネットワーク接続を確認

2. プログラムが応答しない場合
   - 送金間隔を長く設定してみる
   - 送金先の数を減らしてみる
   - バッチサイズを小さくしてみる

## ライセンス

MIT

## 作者

camaocande

## 貢献

バグ報告や機能改善の提案は、GitHub の Issue でお願いします。
プルリクエストも歓迎です。
