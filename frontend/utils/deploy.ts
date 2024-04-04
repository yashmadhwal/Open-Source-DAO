import { ethers, providers } from 'ethers'

import CrowdFundProjectCode from '../../contract/artifacts/contracts/CrowdFundProject.sol/CrowdFundProject.json';
import VestingWalletCode from '../../contract/artifacts/contracts/VestingWallet.sol/VestingWallet.json';
import DocumentIndexCode from '../../contract/artifacts/contracts/DocumentIndex.sol/DocumentIndex.json';
import EqualDistributeWalletCode from '../../contract/artifacts/contracts/EqualDistributeWallet.sol/EqualDistributeWallet.json';

import { CrowdFundProject } from '../../contract/typechain-types';
import { DocumentIndex } from '../../contract/typechain-types';
import { VestingWallet } from '../../contract/typechain-types';
import { EqualDistributeWallet } from '../../contract/typechain-types';

type DeployParams = {
    depositLowCap: BigInt,
    votingAbortPercent: Number,
    startTimestamp: Number,
    endTimestamp: Number,
    vestingMonthsDuration: Number,
    successLowerThreshold: BigInt,
    signersThres: Number,
    signers: Array<String>,
    projectDocHash: String
}

async function deployContract(
    signer: providers.JsonRpcSigner,
    contract: any,
    args: any[],
) {
    console.log("deploying " + contract.contractName)

    let factory = new ethers.ContractFactory(contract.abi, contract.bytecode, signer)
    let contractInstance = await factory.deploy(args)

    await contractInstance.deployTransaction.wait()
    return contractInstance
}

export async function deployProject(
    signer: providers.JsonRpcSigner,
    params: DeployParams
) {
    const docIndexArgs = [
        params.projectDocHash,
        params.signers,
        params.signersThres
    ]

    const docIndex = await deployContract(
        signer, 
        DocumentIndexCode,
        docIndexArgs
    )

    const devWalletArgs = [
        params.signers
    ]

    const devWallet = await deployContract(
        signer,
        EqualDistributeWalletCode,
        devWalletArgs
    )

    const vestingWalletArgs = [
        params.endTimestamp,
        params.vestingMonthsDuration,
        devWallet.address,
        await signer.getAddress()
    ]

    const vestingWallet = await deployContract(
        signer,
        VestingWalletCode,
        vestingWalletArgs
    )

    const crowdFundContractArgs = [
        params.depositLowCap,
        params.votingAbortPercent,
        params.startTimestamp,
        params.endTimestamp,
        params.successLowerThreshold,
        vestingWallet.address,
        docIndex.address
    ]

    const crowdFundContract = await deployContract(
        signer,
        CrowdFundProjectCode,
        crowdFundContractArgs
    )

    const target = (vestingWallet.connect(signer) as unknown) as VestingWallet
    const txn = await target.transferOwnership(crowdFundContract.address)
    await txn.getTransaction()

    return crowdFundContract.address
}

