const { ethers } = require("hardhat");

const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("EqualDistributeWallet", function () {
    function getEOAs(count = 0) {
        var wallets = [];
        for (i = 0; i < count; i++) {
            wallets.push(hre.ethers.Wallet.createRandom())
        }
        return wallets;
    }

    async function setBalance(address, balance) {
        await ethers.provider.send("hardhat_setBalance", [
            address,
            balance.toString(16)
        ]);
    }

    async function sendEth(to, amount) {
        const [owner, otherAccount] = await ethers.getSigners();
        setBalance(otherAccount.address, 3);
        hash = await otherAccount.sendTransaction({
            to: to,
            value: amount
        });
    }

    async function deployContract() {
        let recipients = getEOAs(3);
        const walletFactory = await hre.ethers.getContractFactory("EqualDistributeWallet");
        const wallet = await walletFactory.deploy(
            recipients.map((x) => x.address)
        );

        return { recipients, wallet };
    }

    describe("Balance", function () {
        it("Should show zero balance initially", async function () {
            const { recipients, wallet } = await loadFixture(deployContract);

            expect(await wallet.balance(recipients[0].address)).to.be.equal(0);
            expect(await wallet.balance(recipients[1].address)).to.be.equal(0);
            expect(await wallet.balance(recipients[2].address)).to.be.equal(0);
        });

        it("Splits donations equally", async function () {
            const { recipients, wallet } = await loadFixture(deployContract);
            await sendEth(wallet, 3);

            expect(await wallet.balance(recipients[0].address)).to.be.equal(1);
            expect(await wallet.balance(recipients[1].address)).to.be.equal(1);
            expect(await wallet.balance(recipients[2].address)).to.be.equal(1);
        });

        it("Adjusts balance when sequentially sent donations", async function () {
            const { recipients, wallet } = await loadFixture(deployContract);
            await sendEth(wallet, 3);

            expect(await wallet.balance(recipients[0].address)).to.be.equal(1);
            expect(await wallet.balance(recipients[1].address)).to.be.equal(1);
            expect(await wallet.balance(recipients[2].address)).to.be.equal(1);

            await sendEth(wallet, 6);

            expect(await wallet.balance(recipients[0].address)).to.be.equal(3);
            expect(await wallet.balance(recipients[1].address)).to.be.equal(3);
            expect(await wallet.balance(recipients[2].address)).to.be.equal(3);
        });
    });

    describe("Withdraw", function() {
        it("Changes balance after withdrawal and sends ether", async function () {
            const { recipients, wallet } = await loadFixture(deployContract);
            await sendEth(wallet, 9);

            expect(await wallet.balance(recipients[0].address)).to.be.equal(3);
            expect(await wallet.balance(recipients[1].address)).to.be.equal(3);
            expect(await wallet.balance(recipients[2].address)).to.be.equal(3);

            await wallet.withdraw(recipients[0].address, 2);

            expect(ethers.provider.getBalance(recipients[0].address), 2);

            expect(await wallet.balance(recipients[0].address)).to.be.equal(1);
            expect(await wallet.balance(recipients[1].address)).to.be.equal(3);
            expect(await wallet.balance(recipients[2].address)).to.be.equal(3);
        })
    });
});
