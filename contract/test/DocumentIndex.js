const { ethers } = require("hardhat");

const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const projDocHash = "0xabcd0123ef456789abcd0123ef456789abcd0123ef456789abcd0123ef456789"
const projectReportHex = "0xabcd0123ef456789abcd0123ef456789abcd0123ef456789abcd0123ef456788"
  
describe("DocumentIndex", function () {
    async function deployDocumentIndexFixtureWithSigners(signercnt = 3, threshold = 2) {
        signers = (await ethers.getSigners()).slice(0, signercnt)
        expect(signers.length).to.be.equal(signercnt)

        const bigIntComp = (a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0)
        const addrComp = (a, b) => bigIntComp(BigInt(a.address), BigInt(b.address))
        signers.sort(addrComp)

        for (let i = 0; i < signers.length - 1; i++) {
            expect(addrComp(signers[i], signers[i+1])).lessThanOrEqual(0)
        }

        addrs = signers.map((s) => s.address)

        const factory = await ethers.getContractFactory("DocumentIndex")
        const contract = await factory.deploy(projDocHash, addrs, threshold)

        let nonce = await contract.reportNonce() + 1n
        const { projectReportHash, digest } = sampleProjectReport(nonce)

        // Signers are already sorted
        let signatures = await Promise.all(signers.map((a) => a.signMessage(digest)))

        return { contract, signers, projDocHash, threshold, nonce, projectReportHash, signatures }
    }

    function sampleProjectReport(nonce) {
        const projectReportHash = projectReportHex
        let hash = ethers.solidityPackedKeccak256(["bytes32", "uint256"], [projectReportHash, nonce]);
        let digest = ethers.getBytes(hash)
        // let message = ethers.getBytes(hash)
        return { projectReportHash, digest }
    }

    async function deployDocumentIndexFixtureSingleSigner() {
        return deployDocumentIndexFixtureWithSigners(1, 1)
    }

    async function deployDocumentIndexFixture() {
        return deployDocumentIndexFixtureWithSigners(3, 2)
    }

    describe("Deployment", () => {
        it("Deploys correctly", async () => {
            const { contract, signers, projDocHash, threshold, projectReportHash, signatures } = await loadFixture(deployDocumentIndexFixture)
            expect(await contract.reports().then((x) => x.length)).equals(0)
            expect(await contract.proposal()).equals(projDocHash)
            expect(await contract.reportNonce()).equals(0)

            signers.forEach(async (i) => {
                expect(await contract.isSigner(i.address)).equals(true)
            })
        })
    })

    describe("Multisig", () => {
        it("Verifies signed reports", async function () {
            const { contract, nonce, projectReportHash, signatures } = await loadFixture(deployDocumentIndexFixture)

            await contract.submitReport(projectReportHash, nonce, signatures)
        });

        it("Honors signature threshold", async function () {
            const { contract, nonce, projectReportHash, signatures } = await loadFixture(deployDocumentIndexFixture)
            const badSig = signatures.slice(0, 1)

            expect(contract.submitReport(projectReportHash, nonce, badSig)).to.be.revertedWith("not enough signers")
        });

        it("Accepts valid reports with above threshold signatures", async function() {
            const { contract, nonce, projectReportHash, signatures } = await loadFixture(deployDocumentIndexFixture)
            const goodSig = signatures.slice(0, 2)

            await contract.submitReport(projectReportHash, nonce, goodSig)
        })

        it("Displays dev reports", async function() {
            const { contract, nonce, projectReportHash, signatures } = await loadFixture(deployDocumentIndexFixture)

            await contract.submitReport(projectReportHash, nonce, signatures)
            
            let reports = await contract.reports()
            expect(reports.length).equals(1)
            expect(reports[0]).equals(projectReportHash)
        })

        it("Does not allow replay", async function () {
            const { contract, nonce, projectReportHash, signatures } = await loadFixture(deployDocumentIndexFixture)

            expect(contract.submitReport(projectReportHash, nonce, signatures)).to.be.revertedWith("do not allow replay")
        })
    });
});
