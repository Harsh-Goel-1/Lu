// lib/constants.ts
export const MODULE_ADDRESS = "0xff005f02f214a71afb867ada60e499beab644bcbe66fbd57115bb5cbac38c0b6"; // Update after deployment
export const MODULE_NAME = "crowdfund";

export const NETWORK = "testnet"; // or "mainnet"

export const APTOS_NODE_URL = 
  NETWORK === "testnet" 
    ? "https://fullnode.testnet.aptoslabs.com/v1"
    : "https://fullnode.mainnet.aptoslabs.com/v1";