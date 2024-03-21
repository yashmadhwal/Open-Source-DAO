pragma solidity ^0.8.20;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract EqualDistributeWallet {
    mapping(address => bool) private isRecipient;
    address[] private recipients;
    mapping(address => uint256) private released;
    uint256 private totalReceived;

    constructor(
        address[] memory _recipients
    ) {
        if (_recipients.length == 0) {
            revert("must be at least one recipient");
        }

        recipients = _recipients;
        for (uint i = 0; i < _recipients.length; i++) {
            isRecipient[_recipients[i]] = true;
        }
    }

    function balance(address owner) public view returns (uint256) {
        if (!isRecipient[owner]) {
            return 0;
        }
        (bool success, uint256 piece) = Math.tryDiv(totalReceived, recipients.length);
        assert(success);
        return Math.max(piece - released[owner], 0);
    }

    function withdraw(address owner, uint256 amount) public payable {
        require(balance(owner) >= amount, "not enough balance or zero");
        released[owner] += amount;
        Address.sendValue(payable(owner), amount);
    }

    receive() external payable {
        totalReceived += msg.value;
    }
}