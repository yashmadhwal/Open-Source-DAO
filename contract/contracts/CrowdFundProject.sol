// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IVestingWallet} from "./IVestingWallet.sol";
import {DocumentIndex} from "./DocumentIndex.sol";

contract CrowdFundProject {
    enum FundingState {
        COLLECTING,
        VESTING,
        ABORTED
    }
    
    address public immutable vestingContract;
    address public immutable documentsContract;
    uint256 public immutable votingAbortPercent;

    mapping(uint256 => uint256) voting_abortTotal;
    mapping(uint256 => uint256) voting_continueTotal;
    mapping(uint256 => mapping(address => bool)) voting_acceptedVotes;
    uint256 private voting_index;

    FundingState private state;
    bool private reclaimed;
    mapping(address => uint256) sponsorTokenBalanceOf;
    uint256 sponsorTokenTotalSupply;
    uint256 collectThreshold;
    uint256 donatedTotal;

    uint256 private immutable depositLowCap;
    uint256 private immutable icoStartTs;
    uint256 private immutable icoEndTs;

    constructor(
        uint256 _depositLowCap,
        uint256 _votingAbortPercent,
        uint256 _startTimestamp,
        uint256 _endTimestamp,
        uint256 _successLowerThreshold,

        address _vestingContract,
        address _documentsContract
    ) {
        depositLowCap = _depositLowCap;
        votingAbortPercent = _votingAbortPercent;
        icoStartTs = _startTimestamp;
        icoEndTs = _endTimestamp;
        collectThreshold = _successLowerThreshold;
        vestingContract = _vestingContract;
        documentsContract = _documentsContract;
    }

    receive() external payable {
        deposit();
    }

    function documentIndexContract() public view returns (address) {
        return documentsContract;
    }

    function vestingWalletContract() public view returns (address) {
        return vestingContract;
    }

    function donationsNeeded() public view returns (uint256) {
        return collectThreshold;
    }

    function donationsTotal() public view returns (uint256) {
        return sponsorTokenTotalSupply;
    }

    function deposit() public payable {
        uint256 _amount = msg.value;
        address _sponsor = msg.sender;
        require(_amount >= depositLowCap, "deposit must be not less than the minimum cap");
        sponsorTokenBalanceOf[_sponsor] += _amount;
        sponsorTokenTotalSupply += _amount;
    }
    
    function start() public view returns (uint256) {
        return icoStartTs;
    }

    function end() public view returns (uint256) {
        return icoEndTs;
    }

    function success() public view returns (bool) {
        return sponsorTokenTotalSupply >= collectThreshold;
    }

    function icoOver() public view returns (bool) {
        return state != FundingState.COLLECTING;
    }

    function finalize() public payable {
        require(state == FundingState.COLLECTING, "not allowed in this state");
        require(sponsorTokenTotalSupply >= collectThreshold, "not enough funds collected");
        state = FundingState.VESTING;
        Address.sendValue(payable(vestingContract), sponsorTokenTotalSupply);
    }

    function balance(address owner) public view returns (uint256) {
        return sponsorTokenBalanceOf[owner];
    }

    function withdrawAll() onlyAborted external payable {
        if (!reclaimed) {
            IVestingWallet(vestingContract).reclaimBank();
            reclaimed = true;
        }

        uint256 toRefund = (address(this).balance * voteShareOf(msg.sender)) / sponsorTokenTotalSupply;
        sponsorTokenBalanceOf[msg.sender] = 0;
        Address.sendValue(payable(msg.sender), toRefund);
    }
    
    function voteShareOf(address owner) public view returns (uint256) {
        return sponsorTokenBalanceOf[owner];
    }

    function voteAbortTotal(uint256 voteIndex) public view returns (uint256) {
        return voting_abortTotal[voteIndex];
    }

    function voteContinueTotal(uint256 voteIndex) public view returns (uint256) {
        return voting_continueTotal[voteIndex];
    }

    function votedToAbort() public view returns (bool) {
        (,uint256 periodNo) = IVestingWallet(vestingContract).votingPeriod();
        require(voting_index == periodNo, "voting outdated");

        return (100 * voting_abortTotal[voting_index]) / sponsorTokenTotalSupply >= votingAbortPercent;
    }

    function hasVoted(uint256 voteIndex, address voter) public view returns (bool) {
        return voting_acceptedVotes[voteIndex][voter];
    }

    function vote(bool abort) public {
        address _voter = msg.sender;
        require(sponsorTokenBalanceOf[_voter] > 0, "no voting power");

        (bool votingActive, uint256 periodNo) = IVestingWallet(vestingContract).votingPeriod();
        require(votingActive, "voting ended");
        if (periodNo > voting_index) {
            voting_index = periodNo;
        }

        require(!hasVoted(voting_index, _voter), "already voted");
        voting_acceptedVotes[voting_index][_voter] = true;

        if (abort) {
            voting_abortTotal[voting_index] += sponsorTokenBalanceOf[_voter];
        } else {
            voting_continueTotal[voting_index] += sponsorTokenBalanceOf[_voter];
        }
    }

    function checkAborted() public {
        if (state == FundingState.COLLECTING && block.timestamp > end() && sponsorTokenTotalSupply < collectThreshold) {
            state = FundingState.ABORTED;
        }

        if (state == FundingState.VESTING && votedToAbort()) {
            state = FundingState.ABORTED;
        }
    }

    modifier onlyAborted() {
        if (state != FundingState.ABORTED) {
            checkAborted(); 
        }

        require(state == FundingState.ABORTED, "only in aborted state");
        _;
    }
}