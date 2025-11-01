// lib/constants.ts
export const MODULE_ADDRESS = "0x81810d53b183eca4645f5bc37fe2cfb3d53af83ed8a6af3b4df7b04f703c8050"; // Update after deployment
export const MODULE_NAME = "crowdfund";

// IMPORTANT: Set this to the address that deployed the contract (same as MODULE_ADDRESS usually)
export const REGISTRY_ADDRESS = "0x81810d53b183eca4645f5bc37fe2cfb3d53af83ed8a6af3b4df7b04f703c8050"; // Same as MODULE_ADDRESS

export const NETWORK = "testnet"; // or "mainnet"

export const APTOS_NODE_URL = 
  NETWORK === "testnet" 
    ? "https://fullnode.testnet.aptoslabs.com/v1"
    : "https://fullnode.mainnet.aptoslabs.com/v1";