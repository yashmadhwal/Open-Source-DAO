const { ethers } = require("hardhat");

const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ONE_MONTH_IN_SECS = 3600 * 24 * 30
const ETH_WEI = 1000000000000000000n
const GWEI = 1000000000n
  
describe("CrowdFund", function () {
    async function setBalance(address, balance) {
        await ethers.provider.send("hardhat_setBalance", [
            address,
            balance == 0 ? "0x0" : balance.toString(16)
        ]);
    }

    async function sendEth(from, to, amount) {
        setBalance(from.address, amount);
        await from.sendTransaction({
            to: to,
            value: amount
        });
    }

    async function deployContractClean() {
        const depositLowCap = 1000000000n
        const voteAbortRatio = 50 // 67%
        const startTimestamp = (await time.latest()) + ONE_MONTH_IN_SECS
        const endTimestamp = startTimestamp + ONE_MONTH_IN_SECS
        const successLowerThreshold = ETH_WEI

        vestingWalletStubFactory = await ethers.getContractFactory("VestingWalletStub")
        stub = await vestingWalletStubFactory.deploy()
        
        crowdfundFactory = await ethers.getContractFactory("CrowdFund")
        contract = await crowdfundFactory.deploy(depositLowCap, voteAbortRatio, startTimestamp, endTimestamp, successLowerThreshold, stub)
        let signers = (await ethers.getSigners()).slice(0, 4)
        await sendEth(signers[3], stub, GWEI)

        return { contract, stub, signers, depositLowCap, voteAbortRatio, startTimestamp, endTimestamp, successLowerThreshold }
    }

    async function contractInVesting() {
        let { contract, stub, signers, depositLowCap, voteAbortRatio, startTimestamp, endTimestamp, successLowerThreshold } = await deployContractClean()
        const donationEach = successLowerThreshold / 3n + GWEI;

        await sendEth(signers[0], contract.target, donationEach)
        await sendEth(signers[1], contract.target, donationEach)
        await sendEth(signers[2], contract.target, donationEach)

        await contract.finalize()
        await time.increaseTo(endTimestamp)

        return { contract, stub, signers, depositLowCap, voteAbortRatio, startTimestamp, endTimestamp, successLowerThreshold }
    }

    describe("ICO", function () {
        it("Allows to donate", async function () {
            let { contract, stub, signers, depositLowCap, voteAbortRatio, startTimestamp, endTimestamp, successLowerThreshold } = await loadFixture(deployContractClean)

            let user = signers[0]
            await sendEth(user, contract.target, depositLowCap)
            expect(await contract.balance(user.address)).equals(depositLowCap)
        });

        it("Doesn't allow to withdraw until unsuccessfull or aborted state", async function () {
            let { contract, stub, signers, depositLowCap, voteAbortRatio, startTimestamp, endTimestamp, successLowerThreshold } = await loadFixture(deployContractClean)

            let user = signers[0]
            await sendEth(user, contract.target, depositLowCap)
            expect(await contract.balance(user.address)).equals(depositLowCap)

            expect(contract.withdrawAll()).to.be.revertedWith("only in aborted state")
            await time.increaseTo(endTimestamp)

            await contract.connect(user).withdrawAll()
        });

        it("Passes the donation bank to distribution contract", async function () {
            let { contract, stub, signers, depositLowCap, voteAbortRatio, startTimestamp, endTimestamp, successLowerThreshold } = await loadFixture(deployContractClean)
            let user = signers[0]

            await sendEth(user, contract.target, successLowerThreshold)
            expect(await ethers.provider.getBalance(contract.target)).equals(successLowerThreshold)
            await contract.finalize()
            expect(await ethers.provider.getBalance(contract.target)).equals(0)
            expect(await ethers.provider.getBalance(stub.target)).greaterThanOrEqual(successLowerThreshold)
        });
    });

    describe("Voting", function() {
        it("Allows to vote", async function () {
            let { contract, stub, signers, depositLowCap, voteAbortRatio, startTimestamp, endTimestamp, successLowerThreshold } = await loadFixture(contractInVesting)
            const toAbort = true;

            expect(await contract.votedToAbort()).equals(false)
            await contract.connect(signers[0]).vote(toAbort)
            expect(await contract.votedToAbort()).equals(false)
            await contract.connect(signers[1]).vote(toAbort)
            expect(await contract.votedToAbort()).equals(true)
            await contract.connect(signers[2]).vote(toAbort)
            expect(await contract.votedToAbort()).equals(true)
        });

        it("Declines voting to non-donors", async function() {
            let { contract, stub, signers, depositLowCap, voteAbortRatio, startTimestamp, endTimestamp, successLowerThreshold } = await loadFixture(contractInVesting)

            expect(contract.connect(signers[3]).vote(true)).to.be.revertedWith("no voting power")
        })
    });

    describe("Abortion", function() {
        it("Reclaims the remaining donation bank", async function () {
            let { contract, stub, signers, depositLowCap, voteAbortRatio, startTimestamp, endTimestamp, successLowerThreshold } = await loadFixture(contractInVesting)
            const toAbort = true;

            await contract.connect(signers[0]).vote(toAbort)
            await contract.connect(signers[1]).vote(toAbort)
            await contract.connect(signers[2]).vote(toAbort)
            expect(await contract.votedToAbort()).equals(true)
            expect(contract.withdrawAll()).to.emit(stub, "BankReclaimed")
        });

        it("TODO: Distributes the donation bank back in ratio to initial offering", async function () {
        });
    });
});
