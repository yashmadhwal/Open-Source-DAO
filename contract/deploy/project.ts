import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import * as fs from "fs/promises"

const ONE_MONTH_IN_SECS = 3600 * 24 * 30
const ETH_IN_WEI = 1000000000000000000n
const GWEI = 1000000000n

const deployFn: DeployFunction = async function(
    hre: HardhatRuntimeEnvironment
) {
    const {getNamedAccounts, deployments, network} = hre;
    const {execute, deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();

    let wallets = await fs.readFile("wallets.json").then((x) => JSON.parse(x))
    let signers = wallets.map((x) => x.address)
    
    const nowTs = 1713209331;

    let params = {
        depositLowCap: GWEI,
        votingAbortPercent: 51,
        startTimestamp: nowTs + ONE_MONTH_IN_SECS,
        endTimestamp: nowTs + 2 * ONE_MONTH_IN_SECS,
        vestingMonthsDuration: 3,
        successLowerThreshold: 100n * GWEI,
        signersThres: 2,
        signers: signers,
        projectDocHash: "0xf4bd6903160a45cc634cd36d6a9807ccb5ce26ddc4cc14faec2e720ba23ff246",
    }

    const docIndexArgs = [
        params.projectDocHash,
        params.signers,
        params.signersThres
    ]

    const docIndex = await deploy("DocumentIndex", {
        from: deployer,
        args: docIndexArgs,
        log: true
    })

    await hre.run("verify:verify", {
        address: docIndex.address,
        constructorArguments: docIndexArgs,
        chain: "bsc_testnet"
    });

    const devWalletArgs = [
        params.signers
    ]

    const devWallet = await deploy("EqualDistributeWallet", {
        from: deployer,
        args: devWalletArgs,
        log: true
    })

    await hre.run("verify:verify", {
        address: devWallet.address,
        constructorArguments: devWalletArgs,
        chain: "bsc_testnet"
    });

    const vestingWalletArgs = [
        params.endTimestamp,
        params.vestingMonthsDuration,
        devWallet.address,
        deployer
    ]

    const vestingWallet = await deploy("VestingWallet", {
        from: deployer,
        args: vestingWalletArgs,
        log: true
    })

    await hre.run("verify:verify", {
        address: vestingWallet.address,
        constructorArguments: vestingWalletArgs,
        chain: "bsc_testnet"
    });

    const crowdFundContractArgs = [
        params.depositLowCap,
        params.votingAbortPercent,
        params.startTimestamp,
        params.endTimestamp,
        params.successLowerThreshold,
        vestingWallet.address,
        docIndex.address
    ]

    const crowdFundContract = await deploy("CrowdFundProject", {
        from: deployer,
        args: crowdFundContractArgs,
        log: true
    })

    await hre.run("verify:verify", {
        address: crowdFundContract.address,
        constructorArguments: crowdFundContractArgs,
        chain: "bsc_testnet"
    });

    await execute(
        'VestingWallet',
        {from: deployer, log: true},
        "transferOwnership",
        crowdFundContract.address
    );
}

export default deployFn;
