import "@nomicfoundation/hardhat-ethers";
import { HardhatUserConfig } from "hardhat/config";
import 'hardhat-deploy';
import "@nomicfoundation/hardhat-chai-matchers";
import '@typechain/hardhat';

// Ensure your configuration variables are set before executing the script
const { vars } = require("hardhat/config");

// Needed for deployment, but we deploy via frontend, currently
// const BSC_TESTNET_PRIVATE_KEY = vars.get("BSC_TESTNET_PRIVATE_KEY");
// const BSC_TESTNET_API_KEY = vars.get("BSC_TESTNET_API_KEY");
// const BSCSCAN_API_KEY = vars.get("BSCSCAN_API_KEY")

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  // networks: {
  //   bsc_testnet: {
  //     url: `https://data-seed-prebsc-1-s2.binance.org:8545/`,
  //     accounts: [BSC_TESTNET_PRIVATE_KEY],
  //   },
  // },
  // etherscan: {
  //   apiKey: {
  //     bscTestnet: BSCSCAN_API_KEY
  //   }
  // },
  // bscscan: {
  //   "apiKey": BSC_TESTNET_API_KEY
  // },
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
    },
},
};

export default config;