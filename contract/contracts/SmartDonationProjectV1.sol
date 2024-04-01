// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {CrowdFund} from "./CrowdFund.sol";
import {VestingWallet} from "./VestingWallet.sol";
import {DocumentIndex} from "./DocumentIndex.sol";
import {EqualDistributeWallet} from "./EqualDistributeWallet.sol";

using MessageHashUtils for SmartDonationProjectV1;

contract SmartDonationProjectV1 {
    DocumentIndex public immutable documentIndexContract;
    VestingWallet public immutable vestingContract;
    EqualDistributeWallet public immutable receiveDonationsWallet;
    CrowdFund public immutable crowdFundContract;

    constructor(
        bytes32   _projectDocHash,
        address[] memory _signers,
        uint256 _signersThreshold,

        uint256 _donationStartTimestamp,
        uint256 _donationDurationMonths,

        uint256 _votingAbortRatio,
        uint256 _donationMinimumSum
    ) {
        documentIndexContract = new DocumentIndex(
            _projectDocHash,
            _signers,
            _signersThreshold
        );

        receiveDonationsWallet = new EqualDistributeWallet(_signers);
        vestingContract = new VestingWallet(
            _donationStartTimestamp,
            _donationDurationMonths,
            address(receiveDonationsWallet),
            address(this)
        );

        crowdFundContract = new CrowdFund(
            0,
            _votingAbortRatio,
            block.timestamp,
            _donationStartTimestamp,
            _donationMinimumSum,
            address(vestingContract)
        );

        vestingContract.transferOwnership(address(crowdFundContract));
    }
}