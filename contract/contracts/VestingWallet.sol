// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IVestingWallet} from "./IVestingWallet.sol";

contract VestingWallet is IVestingWallet, Ownable {
    event EtherReleased(uint256 amount);

    uint256 public constant DECIMALS = 18;
    uint256 public constant MONTH_SECONDS = 2592000;
    uint256 public constant WEEK_SECONDS = 604800;

    address private immutable receivingAddress;

    uint256 private immutable startTs;
    uint256 private immutable monthsDuration;

    bool private active;
    uint256 private releasedTotal;
    uint256 private initialBank;
    uint256 private currentBank;

    constructor(
        uint256 _vestingStartTs,
        uint256 _monthsDuration,
        address _receivingAddress,
        address _initialOwner
    ) Ownable(_initialOwner) {
        startTs = _vestingStartTs;
        monthsDuration = _monthsDuration;
        receivingAddress = _receivingAddress;
    }

    function votingPeriod() public view returns (bool voteActive, uint256 periodNo) {
        if (month() <= 1 || month() > monthsDuration) {
            return (false, month());
        }

        uint256 votingEndTs = startTs + (month() - 1) * MONTH_SECONDS + WEEK_SECONDS;
        return (block.timestamp <= votingEndTs, month());
    }

    function sourceAddress() public view returns (address) {
        return owner();
    }

    receive() external payable {
        if (msg.sender == sourceAddress()) {
            acceptDonationBank();
        }
    }

    function acceptDonationBank() internal onlyOwner {
        require(!active, "already accepted donation bank");
        active = true;
        initialBank = address(this).balance;
        currentBank = initialBank;
    }

    function reclaimBank() public payable onlyOwner {
        require(active, "vesting must be active");
        Address.sendValue(payable(sourceAddress()), address(this).balance);
    }

    function isActive() public view returns (bool) {
        return active;
    }

    function start() public view returns (uint256) {
        return startTs;
    }

    function end() public view returns (uint256) {
        return startTs + durationMonths() * MONTH_SECONDS;
    }

    function durationMonths() public view returns (uint256) {
        return monthsDuration;
    }

    function monthlyAllocation() public view returns (uint256) {
        return initialBank / monthsDuration;
    }

    function month() public view returns (uint256) {
        if (!active || block.timestamp < start()) {
            return 0;
        }

        (bool success, uint256 secondsElapsed) = Math.trySub(block.timestamp, start());
        assert(success);

        return Math.ceilDiv(secondsElapsed, MONTH_SECONDS);
    }

    function released() public view returns (uint256) {
        return releasedTotal;
    }

    function vestingSchedule(uint256 paidMonthly, uint256 monthNo) public view returns (uint256) {
        monthNo = Math.min(monthNo, durationMonths());
        return monthNo * paidMonthly;
    }

    function releaseable() public view returns (uint256) {
        return vestingSchedule(monthlyAllocation(), month()) - released();
    }

    function release() public payable {
        uint256 amount = releaseable();
        releasedTotal += amount;
        emit EtherReleased(amount);
        Address.sendValue(payable(receivingAddress), amount);
    }
}
