const { ethers } = require("hardhat");

const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("CrowdFund", function () {
    async function deployContract() {
        
    }

    describe("ICO", function () {
        it("Allows to donate", async function () {
            
        });

        it("Doesn't allow to withdraw until unsuccessfull or aborted state", async function () {
            
        });

        it("Passes the donation bank to distribution contract", async function () {
            
        });
    });

    describe("Voting", function() {
        it("Allows to vote in special periods", async function () {
            
        });

        it("Allows to abort when voted for", async function () {

        });
    });

    describe("Abortion", function() {
        it("Reclaims the remaining donation bank", async function () {
            
        });

        it("Distributes the donation bank back in ratio to initial offering", async function () {

        });
    });
});
