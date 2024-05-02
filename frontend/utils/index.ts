import { ethers, providers, Contract } from 'ethers';
import { node } from './node';
import { Chain } from '../src/stores/user';

import CrowdFundProjectCode from '../../contract/artifacts/contracts/CrowdFundProject.sol/CrowdFundProject.json';
import VestingWalletCode from '../../contract/artifacts/contracts/VestingWallet.sol/VestingWallet.json';
import DocumentIndexCode from '../../contract/artifacts/contracts/DocumentIndex.sol/DocumentIndex.json';
import EqualDistributeWalletCode from '../../contract/artifacts/contracts/EqualDistributeWallet.sol/EqualDistributeWallet.json';

import { CrowdFundProject } from '../../contract/typechain-types';
import { DocumentIndex } from '../../contract/typechain-types';
import { VestingWallet } from '../../contract/typechain-types';
import { EqualDistributeWallet } from '../../contract/typechain-types';

// import { deployProject } from './deploy';

// import {
//     CrowdFundProject
// } from "../../contract/typechain-types";

// export function useContracts(chainId: Chain) {
//     const provider = new ethers.JsonRpcProvider(getChainRpc(chainId))

//     const crowdFundProjectContract = new ethers.Contract(
//         CrowdFundProjectDeployment.address,
//         CrowdFundProjectDeployment.abi,
//         provider
//     ) as unknown

//     return {
//         crowdFundProjectContract: crowdFundProjectContract as CrowdFundProject
//     }
// }

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
    console.log("args:")
    console.log(args)

    let factory = new ethers.ContractFactory(contract.abi, contract.bytecode, signer)
    let contractInstance = await factory.deploy(...args)

    console.log("address")
    console.log(contractInstance.address)

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
    await txn.wait()

    return crowdFundContract.address
}

export async function safe(promise: Promise<any>) {
    try {
        const result = await promise
        return [result, null]
    } catch (error) {
        return [null, error]
    }
}
  
export function getChainRpc(chainId: Chain): string {
    const chainName = 'bsc_testnet'
    return node(chainName).rpc
}
  
export function getChainName(chainId: Chain): string {
    const chainName = 'bsc_testnet'
    return node(chainName).name
}

export function getChainHex(chainId: Chain): string {
    const chainName = 'bsc_testnet'
    return node(chainName).chainIdHex
}

export function getPackedHash(fullHash: string) {
    const packedHash =
        fullHash.substring(0, 5) +
        '...' +
        fullHash.substring(fullHash.length - 6, fullHash.length - 1)
    return packedHash
}

export function useProvider(chainId: Chain) {
    return new providers.JsonRpcProvider(getChainRpc(chainId))
}

export async function useContracts(address: string, chainId: Chain) {
    const provider = new providers.JsonRpcProvider(getChainRpc(chainId))

    console.log("use CrowdFundProject at " + address)
    const crowdFundProject = (new Contract(address, CrowdFundProjectCode.abi, provider) as unknown) as CrowdFundProject
    const docIndexAddr = await crowdFundProject.documentsContract()
    console.log("use DocumentIndex at " + docIndexAddr)
    const docIndexContract = new Contract(docIndexAddr, DocumentIndexCode.abi, provider) as unknown

    const vestingWalletAddr = await crowdFundProject.vestingContract()
    console.log("use VestingWallet at " + vestingWalletAddr)
    const vestingWalletContract = new Contract(vestingWalletAddr, VestingWalletCode.abi, provider) as unknown

    return {
        crowdFundProject: crowdFundProject as CrowdFundProject,
        documentIndex:    docIndexContract as DocumentIndex,
        vestingWallet:    vestingWalletContract as VestingWallet
    }
}