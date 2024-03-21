pragma solidity ^0.8.20;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IVestingWallet} from "./IVestingWallet.sol";

contract CrowdFund {
    enum FundingState {
        COLLECTING,
        VESTING,
        ABORTED
    }
    
    enum VoteType {
        ABSTAIN,
        ABORT,
        CONTINUE
    }

    mapping(uint256 => uint256) voting_abortTotal;
    mapping(uint256 => uint256) voting_continueTotal;
    mapping(uint256 => mapping(address => bool)) voting_acceptedVotes;
    uint256 private voting_index;

    FundingState private state;
    bool private reclaimed;
    address private vestingContract;
    mapping(address => uint256) sponsorTokenBalanceOf;
    uint256 sponsorTokenTotalSupply;
    uint256 collectThreshold;

    uint256 private immutable depositLowCap;
    uint256 private immutable votingAbortRatio;
    uint256 private immutable icoStartTs;
    uint256 private immutable icoEndTs;

    constructor(
        uint256 _depositLowCap,
        uint256 _votingAbortRatio,
        uint256 _startTimestamp,
        uint256 _endTimestamp,
        uint256 _successLowerThreshold,
        address _vestingContract
    ) {
        depositLowCap = _depositLowCap;
        votingAbortRatio = _votingAbortRatio;
        icoStartTs = _startTimestamp;
        icoEndTs = _endTimestamp;
        collectThreshold = _successLowerThreshold;
        vestingContract = _vestingContract;
    }

    function deposit() external payable {
        uint256 _amount = msg.value;
        address _sponsor = msg.sender;
        require(_amount > depositLowCap, "deposit must be not less than the minimum cap");
        sponsorTokenBalanceOf[_sponsor] += _amount;
        sponsorTokenTotalSupply += _amount;
    }
    
    function start() public view returns (uint256) {
        return icoStartTs;
    }

    function end() public view returns (uint256) {
        return icoEndTs;
    }

    function finalize() public payable {
        require(state == FundingState.COLLECTING, "not allowed in this state");
        require(sponsorTokenTotalSupply >= collectThreshold, "not enough funds collected");
        state = FundingState.VESTING;
        Address.sendValue(payable(vestingContract), sponsorTokenTotalSupply);
    }

    function withdrawAll() onlyAborted external payable {
        if (!reclaimed) {
            IVestingWallet(vestingContract).reclaimBank();
            reclaimed = true;
        }

        uint256 balance = (address(this).balance * sponsorTokenBalanceOf[msg.sender]) / sponsorTokenTotalSupply;
        sponsorTokenBalanceOf[msg.sender] = 0;
        Address.sendValue(payable(msg.sender), balance);
    }

    function votedToAbort() public view returns (bool) {
        (,uint256 periodNo) = IVestingWallet(vestingContract).votingPeriod();
        require(voting_index == periodNo, "voting outdated");
        return voting_abortTotal[voting_index] / sponsorTokenTotalSupply > votingAbortRatio;
    }

    function vote(VoteType vtype) public {
        address _voter = msg.sender;
        require(sponsorTokenBalanceOf[_voter] > 0, "no voting power");

        (bool votingActive, uint256 periodNo) = IVestingWallet(vestingContract).votingPeriod();
        require(votingActive, "voting ended");
        if (periodNo > voting_index) {
            voting_index = periodNo;
        }

        require(!voting_acceptedVotes[voting_index][_voter], "already voted");
        voting_acceptedVotes[voting_index][_voter] = true;

        if (vtype == VoteType.ABORT) {
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

        require(state == FundingState.ABORTED);
        _;
    }
}