// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IVestingWallet} from "./IVestingWallet.sol";

contract VestingWalletStub is IVestingWallet {
    event BankReclaimed();

    constructor() {}

    receive() external payable {}

    function reclaimBank() public payable {
        Address.sendValue(payable(msg.sender), address(this).balance);
    }

    function votingPeriod() external pure returns (bool active, uint256 periodNo) {
        return (true, 0);
    }
}
