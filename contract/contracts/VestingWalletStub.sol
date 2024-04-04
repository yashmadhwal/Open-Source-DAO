// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IVestingWallet} from "./IVestingWallet.sol";

contract VestingWalletStub is IVestingWallet {
    event BankReclaimed(uint256 amount);
    event BankAccepted(uint256 amount);

    constructor() {}

    receive() external payable {
        emit BankAccepted(msg.value);
    }

    function reclaimBank() public payable {
        emit BankReclaimed(address(this).balance);
        Address.sendValue(payable(msg.sender), address(this).balance);
    }

    function votingPeriod() external pure returns (bool active, uint256 periodNo) {
        return (true, 0);
    }
}
