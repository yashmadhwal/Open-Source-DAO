const { ethers } = require("hardhat");

const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("VestingWallet", function () {
    async function deployContract() {
        
    }

    describe("Voting", function () {
        it("Says if it's time to vote on continuation", async function () {
            
        });

        it("Does not allow vote in the first month", async function () {
            
        });
    });

    describe("Reclamation", function () {
        it("Sends the remaining donation bank back", async function () {
            
        });
    });

    describe("Vesting", function () {
        it("Allows to release monthly allocations", async function () {
            
        });

        it("Activates after receiving donation bank", async function () {
            
        });

        it("Shows correct releaseable amount", async function () {
            
        });
    });
});
