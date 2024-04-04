import { defineStore } from "pinia";

import { BigNumber, ContractTransaction, ethers, Contract } from "ethers";

import { useUser } from "../user";
import { getPackedHash } from "../../../utils";
import { safe, useContracts } from "../../../utils";
import { CrowdFundProject } from "../../../../contract/typechain-types";

export const useContract = defineStore("contract", {
    state: () => {
        return {
            address: null as null,
            minHash: "",
            hash: "",
            name: "",

            // ICO
            amountCollected: 0, // Initial amount collected
            totalAmount: 0, // Total amount to be collected
            icoEndtime: 0,
            icoSuccess: false,
            icoOver: false,

            // Voting
            voteShare: 0,
            voteNo: 0,
            voteYes: 0,
            totalVote: 0,
            voteThreshold: 0,
            voteEndtime: 0,
            voted: false,
            voteActive: false,
        };
    },
    actions: {
        async vote(vote: string) {
            const user = useUser();
            if (!user.login) {
                throw new Error("Please, connect your metamask wallet first");
            }

            if (vote !== "Yes" && vote !== "No") {
                alert("Invald vote input: " + vote)
                return
            }

            const isAbort = vote === "No"
            const { crowdFundProject } = await useContracts(this.address, user.chainId)
            let root = (crowdFundProject as unknown as Contract).connect(
                user.signer,
            ) as any;

            const txn = await root.vote(isAbort);
            await txn.wait()

            this.load()
        },

        async finishIco() {
            const user = useUser();
            if (!user.login) {
                throw new Error("Please, connect your metamask wallet first");
            }

            const { crowdFundProject } = await useContracts(
                this.address,
                user.chainId,
            );
            let root = (crowdFundProject as unknown as Contract).connect(
                user.signer,
            ) as any;

            // Check whether ICO was successful, this will throw an error otherwise
            try {
                await root.estimateGas.finalize();
            } catch (e) {
                console.error(e)
                throw new Error("error: not enough funds collected or invalid state")
            }

            const txn = await root.finalize();
            await txn.wait();

            this.load();
        },

        async load(address: string = "") {
            if (!address) {
                address = this.address;
            }

            const user = useUser();
            if (!user.login) {
                throw new Error("Please, connect your metamask wallet first");
            }

            const { crowdFundProject, documentIndex, vestingWallet } =
                await useContracts(address, user.chainId);

            this.amountCollected = await crowdFundProject.donationsTotal();
            this.totalAmount = await crowdFundProject.donationsNeeded();
            console.log("amounts received");
            this.hash = await documentIndex.proposal();
            this.minHash = this.hash.slice(0, 6) + "..." + this.hash.slice(-4);
            this.icoEndtime = parseInt(
                (await crowdFundProject.end()).toString(),
                10,
            );
            this.icoSuccess = await crowdFundProject.success();
            this.icoOver = await crowdFundProject.icoOver();

            console.log("hash " + this.hash);

            const [voteActive, periodNo] = await vestingWallet.votingPeriod();

            console.log("voting " + voteActive + " " + periodNo);
            this.voteActive = voteActive;

            if (voteActive) {
                const myAddr = await user.signer.getAddress();

                this.voteShare = 100 * Number(await crowdFundProject.voteShareOf(myAddr) / this.amountCollected)
                this.voteNo = 100 * Number(await crowdFundProject.voteAbortTotal(periodNo) / this.amountCollected)
                this.voteYes = 100 * Number(await crowdFundProject.voteContinueTotal(periodNo) / this.amountCollected)
                this.totalVote = this.voteNo + this.voteYes;
                this.voteThreshold = Number(
                    await crowdFundProject.votingAbortPercent(),
                );
                this.voteEndtime = Number(
                    await vestingWallet.votingPeriodEndTs(),
                );
                this.voted = await crowdFundProject.hasVoted(periodNo, myAddr);
            }
        },

        async persistAddress(address: string) {
            this.address = address;
        },

        async fund(amount: string) {
            const user = useUser();
            if (!user.login) {
                throw new Error("Please, connect your metamask wallet first");
            }

            const { crowdFundProject } = await useContracts(
                this.address,
                user.chainId,
            );
            let target = (crowdFundProject as unknown as Contract).connect(
                user.signer,
            ) as any;
            const txn = await target.deposit({
                value: ethers.utils.parseUnits(amount, "wei"),
            });
            await txn.wait();

            this.amountCollected = await crowdFundProject.donationsTotal()

            console.log(txn);
        },
    },
});
