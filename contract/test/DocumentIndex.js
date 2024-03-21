const { ethers } = require("hardhat");

const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("DocumentIndex", function () {
    async function deployContract() {
        
    }

    describe("Documents", function () {
        it("Verifies signed reports", async function () {
            
        });

        it("Displays dev reports", async function () {
            
        });
    });

    describe("Digital signature", function() {
        it("Declines duplicated signatures", async function () {
            
        });

        it("Does not allow replay", async function () {

        });

        it("Honors signature threshold", async function () {

        });
    });
});
