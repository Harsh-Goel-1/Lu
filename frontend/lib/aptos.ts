// lib/aptos.ts
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS, MODULE_NAME, REGISTRY_ADDRESS } from "./constants";

const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);

export interface CampaignInfo {
  creator: string;
  goal: string;
  totalRaised: string;
  deadlineTimestamp: string;
  metadataId: string;
  fundsClaimed: boolean;
  totalRefunded: string;
  escrowBalance: string;
}

export interface BackerPledge {
  amount: string;
  refunded: boolean;
}

export const viewFunctions = {
  // Registry functions
  getAllCampaigns: async (): Promise<string[]> => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_all_campaigns`,
          functionArguments: [REGISTRY_ADDRESS],
        },
      });
      return result[0] as string[];
    } catch (error) {
      console.error("Error fetching all campaigns:", error);
      return [];
    }
  },

  getTotalCampaigns: async (): Promise<number> => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_total_campaigns`,
          functionArguments: [REGISTRY_ADDRESS],
        },
      });
      return Number(result[0]);
    } catch (error) {
      console.error("Error fetching total campaigns:", error);
      return 0;
    }
  },

  getCampaignsPaginated: async (startIndex: number, limit: number): Promise<string[]> => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_campaigns_paginated`,
          functionArguments: [REGISTRY_ADDRESS, startIndex, limit],
        },
      });
      return result[0] as string[];
    } catch (error) {
      console.error("Error fetching paginated campaigns:", error);
      return [];
    }
  },

  getCampaignInfo: async (campaignAddr: string): Promise<CampaignInfo | null> => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_campaign_info`,
          functionArguments: [campaignAddr],
        },
      });

      return {
        creator: result[0] as string,
        goal: result[1] as string,
        totalRaised: result[2] as string,
        deadlineTimestamp: result[3] as string,
        metadataId: result[4] as string,
        fundsClaimed: result[5] as boolean,
        totalRefunded: result[6] as string,
        escrowBalance: result[7] as string,
      };
    } catch (error) {
      console.error("Error fetching campaign:", error);
      return null;
    }
  },

  getBackerPledge: async (
    campaignAddr: string,
    backerAddr: string
  ): Promise<BackerPledge | null> => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_backer_pledge`,
          functionArguments: [campaignAddr, backerAddr],
        },
      });

      return {
        amount: result[0] as string,
        refunded: result[1] as boolean,
      };
    } catch (error) {
      console.error("Error fetching backer pledge:", error);
      return null;
    }
  },

  campaignExists: async (campaignAddr: string): Promise<boolean> => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::campaign_exists`,
          functionArguments: [campaignAddr],
        },
      });
      return result[0] as boolean;
    } catch (error) {
      return false;
    }
  },

  isCampaignActive: async (campaignAddr: string): Promise<boolean> => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::is_campaign_active`,
          functionArguments: [campaignAddr],
        },
      });
      return result[0] as boolean;
    } catch (error) {
      return false;
    }
  },

  isCampaignSuccessful: async (campaignAddr: string): Promise<boolean> => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::is_campaign_successful`,
          functionArguments: [campaignAddr],
        },
      });
      return result[0] as boolean;
    } catch (error) {
      return false;
    }
  },

  getProgressPercentage: async (campaignAddr: string): Promise<number> => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_progress_percentage`,
          functionArguments: [campaignAddr],
        },
      });
      return Number(result[0]) / 100; // Convert from basis points to percentage
    } catch (error) {
      return 0;
    }
  },
};

export const convertOctasToApt = (octas: string): number => {
  return Number(octas) / 100000000;
};

export const convertAptToOctas = (apt: number): number => {
  return Math.floor(apt * 100000000);
};