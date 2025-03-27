// Solana Batch Transfer Script
// 複数のウォレットに同時に送金するスクリプト

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const {
	Connection,
	Keypair,
	PublicKey,
	Transaction,
	SystemProgram,
	sendAndConfirmTransaction,
} = require("@solana/web3.js");
const bs58 = require("bs58");

// 設定
const CONFIG = {
	keyPath: "./test-wallet.json", // 送信元のキーファイル
	csvPath: "./data/20250312.csv", // 送信先アドレスのCSVファイル
	outputPath: `./logs/distribution_results_${new Date()
		.toISOString()
		.replace(/[:.]/g, "-")}.csv`, // 結果を保存するCSVファイル（日時付き）
	solPerWallet: 0.001, // 1ウォレットあたりの送金額 (SOL)
	batchSize: 20, // 1トランザクションあたりの最大送金数
	network: process.argv[2] || "mainnet", // ネットワーク選択 (mainnet/testnet/devnet)
	rpcUrl: getNetworkRpcUrl(process.argv[2] || "mainnet"), // ネットワークに応じたRPC URL
	confirmationLevel: "confirmed", // トランザクション確認レベル ('confirmed' or 'finalized')
};

// ネットワークに応じたRPC URLを取得
function getNetworkRpcUrl(network) {
	switch (network.toLowerCase()) {
		case "testnet":
			return "https://api.testnet.solana.com";
		case "devnet":
			return "https://api.devnet.solana.com";
		case "mainnet":
		default:
			return "https://api.mainnet-beta.solana.com";
	}
}

// 送信元のキーペアを読み込む
function loadKeypair(keyPath) {
	try {
		const keypairData = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
		return Keypair.fromSecretKey(new Uint8Array(keypairData));
	} catch (error) {
		console.error(`キーファイル読み込みエラー: ${error.message}`);
		process.exit(1);
	}
}

// CSVを読み込み、ウォレットアドレスのリストを取得
async function loadWallets(csvPath) {
	return new Promise((resolve, reject) => {
		const wallets = [];

		fs.createReadStream(csvPath)
			.pipe(csv())
			.on("data", (row) => {
				// CSV形式に応じて適切なキーを使用
				const address =
					row.wallet_address || row.address || Object.values(row)[0];
				if (address && address.trim() !== "") {
					wallets.push(address.trim());
				}
			})
			.on("end", () => {
				console.log(`${wallets.length}個のウォレットアドレスを読み込みました`);
				resolve(wallets);
			})
			.on("error", (error) => {
				reject(`CSVファイル読み込みエラー: ${error.message}`);
			});
	});
}

// バッチに分割する
function createBatches(wallets, batchSize) {
	const batches = [];
	for (let i = 0; i < wallets.length; i += batchSize) {
		batches.push(wallets.slice(i, i + batchSize));
	}
	return batches;
}

// 結果を保存するためのCSVファイルを作成
function initializeResultsFile(filePath) {
	const csvWriter = createCsvWriter({
		path: filePath,
		header: [
			{ id: "wallet", title: "wallet_address" },
			{ id: "status", title: "status" },
			{ id: "signature", title: "transaction_signature" },
			{ id: "timestamp", title: "timestamp" },
			{ id: "batch", title: "batch_number" },
		],
	});

	return csvWriter;
}

// 残高を表示
async function displayBalance(connection, keypair) {
	try {
		const balance = await connection.getBalance(keypair.publicKey);
		console.log(`送信元の残高: ${balance / 1e9} SOL`);
		return balance / 1e9;
	} catch (error) {
		console.error(`残高確認エラー: ${error.message}`);
		return 0;
	}
}

// バッチ送金を実行
async function processBatch(
	connection,
	keypair,
	batch,
	batchNumber,
	solPerWallet,
	resultsWriter
) {
	console.log(`\nバッチ ${batchNumber} 処理中... (${batch.length} ウォレット)`);

	try {
		// トランザクションを作成
		const transaction = new Transaction();
		const destinationAddresses = [];

		for (const address of batch) {
			try {
				const destinationPubkey = new PublicKey(address);
				destinationAddresses.push(address);

				// SOL送金インストラクションを追加
				transaction.add(
					SystemProgram.transfer({
						fromPubkey: keypair.publicKey,
						toPubkey: destinationPubkey,
						lamports: Math.floor(solPerWallet * 1e9), // SOL to lamports
					})
				);
			} catch (error) {
				console.error(
					`アドレス "${address}" はスキップされました: ${error.message}`
				);

				// 失敗した結果を記録
				await resultsWriter.writeRecords([
					{
						wallet: address,
						status: "failed",
						signature: "N/A",
						timestamp: new Date().toISOString(),
						batch: batchNumber,
					},
				]);
			}
		}

		if (transaction.instructions.length === 0) {
			console.error(
				"有効なインストラクションがありません。このバッチはスキップされます。"
			);
			return { success: false, signature: null };
		}

		// トランザクションの最近のブロックハッシュを設定
		transaction.recentBlockhash = (
			await connection.getRecentBlockhash()
		).blockhash;
		transaction.feePayer = keypair.publicKey;

		// トランザクションに署名して送信
		console.log(
			`${destinationAddresses.length}アドレスへの送金トランザクションを送信中...`
		);
		const startTime = Date.now();
		const signature = await sendAndConfirmTransaction(
			connection,
			transaction,
			[keypair],
			{
				commitment: CONFIG.confirmationLevel,
				skipPreflight: false,
				preflightCommitment: CONFIG.confirmationLevel,
			}
		);

		const endTime = Date.now();
		console.log(
			`✅ バッチ ${batchNumber} 成功! 所要時間: ${
				(endTime - startTime) / 1000
			}秒`
		);
		console.log(`トランザクション署名: ${signature}`);

		// 成功した結果を記録
		const records = destinationAddresses.map((address) => ({
			wallet: address,
			status: "success",
			signature: signature,
			timestamp: new Date().toISOString(),
			batch: batchNumber,
		}));

		await resultsWriter.writeRecords(records);

		return { success: true, signature };
	} catch (error) {
		console.error(`❌ バッチ ${batchNumber} エラー: ${error.message}`);

		// エラーのためバッチ全体が失敗した場合
		const records = batch.map((address) => ({
			wallet: address,
			status: "failed",
			signature: "N/A",
			timestamp: new Date().toISOString(),
			batch: batchNumber,
		}));

		await resultsWriter.writeRecords(records);

		return { success: false, signature: null, error };
	}
}

// メイン関数
async function main() {
	console.log("=== Solana バッチ送金スクリプト ===");

	// 起動パラメータを確認
	const network = CONFIG.network;
	const rpcUrl = CONFIG.rpcUrl;

	console.log(`ネットワーク: ${network}`);
	console.log(`RPC URL: ${rpcUrl}`);
	console.log(`キーファイル: ${CONFIG.keyPath}`);
	console.log(`CSVファイル: ${CONFIG.csvPath}`);
	console.log(`バッチサイズ: ${CONFIG.batchSize} アドレス/トランザクション`);
	console.log(`送金額: ${CONFIG.solPerWallet} SOL/ウォレット`);

	// 接続を確立
	console.log("\n接続中...");
	const connection = new Connection(rpcUrl, "confirmed");

	// キーペアをロード
	const keypair = loadKeypair(CONFIG.keyPath);
	console.log(`送信元アドレス: ${keypair.publicKey.toString()}`);

	// 残高を確認
	const balance = await displayBalance(connection, keypair);

	// ウォレットリストを読み込む
	const wallets = await loadWallets(CONFIG.csvPath);

	// 総送金額を計算
	const totalAmount = wallets.length * CONFIG.solPerWallet;
	console.log(`\n送金先ウォレット数: ${wallets.length}`);
	console.log(`総送金額: ${totalAmount} SOL`);

	// 残高が十分かチェック
	if (balance < totalAmount + 0.01) {
		// 手数料のために0.01 SOL追加
		console.error(
			`エラー: 残高不足。必要: ${totalAmount + 0.01} SOL, 残高: ${balance} SOL`
		);
		process.exit(1);
	}

	// 確認
	const readline = require("readline").createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const answer = await new Promise((resolve) => {
		readline.question("\n続行しますか？ (y/n): ", resolve);
	});

	if (answer.toLowerCase() !== "y") {
		console.log("中止しました。");
		readline.close();
		process.exit(0);
	}

	readline.close();

	// バッチに分割
	const batches = createBatches(wallets, CONFIG.batchSize);
	console.log(`\n${batches.length}バッチに分割されました`);

	// 結果ファイルを初期化
	const resultsWriter = initializeResultsFile(CONFIG.outputPath);

	// バッチ処理を実行
	let successCount = 0;
	let failureCount = 0;

	console.log("\n処理開始...");
	for (let i = 0; i < batches.length; i++) {
		const batch = batches[i];
		console.log(`\nバッチ ${i + 1}/${batches.length} 処理中...`);

		// 5バッチごとに残高を確認
		if (i % 5 === 0 && i > 0) {
			await displayBalance(connection, keypair);
		}

		const result = await processBatch(
			connection,
			keypair,
			batch,
			i + 1,
			CONFIG.solPerWallet,
			resultsWriter
		);

		if (result.success) {
			successCount += batch.length;
		} else {
			failureCount += batch.length;

			// エラーが発生したら再試行するか尋ねる
			if (i < batches.length - 1) {
				const retryReadline = require("readline").createInterface({
					input: process.stdin,
					output: process.stdout,
				});

				const retryAnswer = await new Promise((resolve) => {
					retryReadline.question(
						"エラーが発生しました。続行しますか？ (y/n): ",
						resolve
					);
				});

				retryReadline.close();

				if (retryAnswer.toLowerCase() !== "y") {
					console.log("中止しました。");
					break;
				}
			}
		}

		// バッチ間に少し待機（レート制限を避けるため）
		if (i < batches.length - 1) {
			console.log("次のバッチを処理する前に5秒待機中...");
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	}

	// 最終結果を表示
	console.log("\n=== 処理完了 ===");
	console.log(`成功: ${successCount} ウォレット`);
	console.log(`失敗: ${failureCount} ウォレット`);
	console.log(`結果は ${CONFIG.outputPath} に保存されました`);

	// 最終残高を表示
	await displayBalance(connection, keypair);
}

// スクリプト実行
main().catch((error) => {
	console.error(`致命的なエラー: ${error.message}`);
	process.exit(1);
});
