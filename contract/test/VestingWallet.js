const { ethers } = require("hardhat");

const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ONE_MONTH_IN_SECS = 3600 * 24 * 30
const ONE_WEEK_IN_SECS = 3600 * 24 * 7
const ETH_WEI = 1000000000000000000n
const GWEI = 1000000000n

describe("VestingWallet", function () {
    async function deployContractClean() {
        const factory = await ethers.getContractFactory("VestingWallet")
        const [ owner, receiver ] = await ethers.getSigners()
        const startTimestamp = (await time.latest()) + ONE_MONTH_IN_SECS
        const durationInMonths = 12

        const contract = await factory.deploy(startTimestamp, durationInMonths, receiver, owner)
        return { contract, startTimestamp, durationInMonths, owner, receiver }
    }

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

    async function deployContractWithAcceptedBank() {
        let { contract, startTimestamp, durationInMonths, owner, receiver } = await loadFixture(deployContractClean)

        await sendEth(owner, contract, 1n * ETH_WEI)

        return { contract, startTimestamp, durationInMonths, owner, receiver }
    }

    describe("Deployment", function () {
        it("Deploys correctly", async function() {
            let { contract, startTimestamp, durationInMonths, owner, receiver } = await loadFixture(deployContractClean)

            expect(await contract.sourceAddress()).equals(owner)
            
            const { voteActive, periodNo } = await contract.votingPeriod()
            expect(voteActive).equals(false)
            expect(periodNo).equals(0)

            expect(await contract.start()).equals(startTimestamp)
            expect(await contract.end()).equals(startTimestamp + ONE_MONTH_IN_SECS * durationInMonths)
            expect(await contract.durationMonths()).equals(durationInMonths)
            expect(await contract.month()).equals(0)
            expect(await contract.releaseable()).equals(0)
            expect(await contract.wallet()).equals(receiver);
        })
    })

    describe("After start", function() {
        // For demo purposes, void this requirement
        // it("First month no vote", async function() {
        //     let { contract, startTimestamp, durationInMonths, owner, receiver } = await loadFixture(deployContractWithAcceptedBank)

        //     await time.increaseTo(startTimestamp + 1);
        //     expect(await contract.isActive()).equals(true)
        //     expect(await contract.month()).equals(1)

        //     const { voteActive, periodNo } = await contract.votingPeriod()
        //     expect(voteActive).equals(false)
        //     expect(periodNo).equals(1)
        // })

        it("Vote indication", async function() {
            let { contract, startTimestamp, durationInMonths, owner, receiver } = await loadFixture(deployContractWithAcceptedBank)

            await time.increaseTo(startTimestamp + ONE_MONTH_IN_SECS + 1);
            expect(await contract.isActive()).equals(true)
            expect(await contract.month()).equals(2)

            const { voteActive, periodNo } = await contract.votingPeriod()
            expect(voteActive).equals(true)
            expect(periodNo).equals(2)
        })
    })

    describe("Transfers", function () {
        it("Activates after transfer", async function () {
            let { contract, startTimestamp, durationInMonths, owner, receiver } = await loadFixture(deployContractClean)
            const bank = 1n * ETH_WEI

            expect(await contract.isActive()).equals(false)
            await sendEth(owner, contract, bank)
            expect(await contract.isActive()).equals(true)
            expect(await contract.monthlyAllocation()).equals(bank / BigInt(durationInMonths))
        });

        it("Allows owner to reclaim", async function () {
            let { contract, startTimestamp, durationInMonths, owner, receiver } = await loadFixture(deployContractClean)
            const bank = 1n * ETH_WEI

            await sendEth(owner, contract, bank)
            const initOwnerBalance = await ethers.provider.getBalance(owner.address)

            expect(await ethers.provider.getBalance(contract.target)).equals(bank)

            await contract.connect(owner).reclaimBank()
            const newOwnerBalance = await ethers.provider.getBalance(owner.address)

            expect(newOwnerBalance - initOwnerBalance - bank).lessThanOrEqual(100n * GWEI)
            expect(await ethers.provider.getBalance(contract.target)).equals(0)
        });
    });

    describe("Vesting", function () {
        it("Allows to release monthly allocations", async function () {
            let { contract, startTimestamp, durationInMonths, owner, receiver } = await loadFixture(deployContractClean)
            const monthlyAllocation = await contract.monthlyAllocation()
            
            await time.increaseTo(startTimestamp + ONE_MONTH_IN_SECS + 1)
            expect(await contract.releaseable()).equals(monthlyAllocation)
            await setBalance(receiver.address, 0)
            await contract.release()
            expect(await contract.releaseable()).equals(0)
            expect(await ethers.provider.getBalance(await contract.wallet())).equals(monthlyAllocation)
        });
    });
});
