import {
  Asset,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  Horizon,
} from "@stellar/stellar-sdk";


import { getOperationalAsset } from "./stellar-assets.service";

const issuerSecret = import.meta.env.VITE_STELLAR_ISSUER_SECRET;
const issuerPublic = import.meta.env.VITE_STELLAR_ISSUER_PUBLIC;

const issuer = Keypair.fromSecret(issuerSecret);

const server = new Horizon.Server(
  "https://horizon-testnet.stellar.org",
);

/** Mapeamento moeda fiduciária → asset operacional interno (backend-only). */
export const OPERATIONAL_ASSET_MAP: Record<string, string> = {
  USD: "USDTX",
  EUR: "EURTX",
  BRL: "BRLTX",
  GBP: "GBPTX",
  CNY: "CNYTX",
};


async function fundWithFriendbot(publicKey: string) {
  await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
  );
}

export async function createTestnetWallet() {
  const pair = Keypair.random();
  await fundWithFriendbot(pair.publicKey());
  return { publicKey: pair.publicKey(), secret: pair.secret() };
}

/**
 * Executa transferência real na Stellar Testnet entre duas wallets recém-criadas
 * (custodial source → settlement destination). On-chain usa XLM nativo (asset
 * operacional é referência interna). Retorna hash + ledger reais.
 */
export async function executeStellarSettlement(
  opts: {
    amount?: string;
    currency?: string;
  } = {},
) {
  console.log("ONLINE ISSUER DEBUG");
  console.log(import.meta.env.VITE_STELLAR_ISSUER_PUBLIC);
  console.log(typeof import.meta.env.VITE_STELLAR_ISSUER_PUBLIC);


  const amount = opts.amount ?? "10";
  const currency = opts.currency ?? "USD";

  const asset = getOperationalAsset(currency);
  console.log("ONLINE ASSET DEBUG");
  console.log(asset);
  console.log(asset.code);
  console.log(asset.issuer);
  console.log(asset instanceof Asset); 

  // Wallet operacional (escrow)
  const source = Keypair.random();

  // Wallet liquidação
  const destination = Keypair.random();

  // Fundeia wallets
  await Promise.all([
    fundWithFriendbot(source.publicKey()),
    fundWithFriendbot(destination.publicKey()),
  ]);

  /**
   * TRUSTLINE SOURCE
   */
  const sourceAccount = await server.loadAccount(source.publicKey());
  console.log("ASSET DEBUG");
  console.log(asset);
  console.log(typeof asset);
  console.log(asset instanceof Asset);


  let tx = new TransactionBuilder(sourceAccount, {
    fee: String(await server.fetchBaseFee()),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset,
      }),
    )
    .setTimeout(30)
    .build();

  tx.sign(source);

  await server.submitTransaction(tx);

  /**
   * TRUSTLINE DESTINATION
   */
  const destinationAccount = await server.loadAccount(destination.publicKey());

  tx = new TransactionBuilder(destinationAccount, {
    fee: String(await server.fetchBaseFee()),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset,
      }),
    )
    .setTimeout(30)
    .build();

  tx.sign(destination);

  await server.submitTransaction(tx);

  /**
   * ISSUER ENVIA ASSET PARA ESCROW
   */
  const issuerAccount = await server.loadAccount(issuer.publicKey());

  tx = new TransactionBuilder(issuerAccount, {
    fee: String(await server.fetchBaseFee()),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: source.publicKey(),
        asset,
        amount,
      }),
    )
    .setTimeout(30)
    .build();

  tx.sign(issuer);

  await server.submitTransaction(tx);

  /**
   * ESCROW → SETTLEMENT
   */
  const refreshedSource = await server.loadAccount(source.publicKey());

  tx = new TransactionBuilder(refreshedSource, {
    fee: String(await server.fetchBaseFee()),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: destination.publicKey(),
        asset,
        amount,
      }),
    )
    .setTimeout(30)
    .build();

  tx.sign(source);

  const result = await server.submitTransaction(tx);

  return {
    hash: result.hash,
    ledger: result.ledger,
    successful: result.successful,
    sourceWallet: source.publicKey(),
    destinationWallet: destination.publicKey(),
    assetCode: asset.code,
    issuer: issuer.publicKey(),
  };
}
