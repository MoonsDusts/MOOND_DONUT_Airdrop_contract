import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      forking: {
        url: 'https://bsc-testnet.publicnode.com'
      }
    },
    arbitrumNova: {
      chainId: 42170,
      accounts: [process.env.PRIVATE_KEY ?? ""],
      url: "https://nova.arbitrum.io/rpc",
      timeout: 600000000000,
    },
    bscTestnet: {
      chainId: 97,
      accounts: [process.env.PRIVATE_KEY ?? ""],
      url: "https://bsc-testnet.publicnode.com",
      timeout: 60000000000,
    },
  },
  etherscan: {
    apiKey: {
      arbitrumNova: process.env.ARBITRUM_NOVA_API_KEY ?? "",
      bscTestnet: process.env.BSC_API_KEY ?? ''
    },
    customChains: [
      {
        network: "arbitrumNova",
        chainId: 42170,
        urls: {
          apiURL: "https://api-nova.arbiscan.io/api",
          browserURL: "https://nova.arbiscan.io",
        },
      },
    ],
  },
};

export default config;
