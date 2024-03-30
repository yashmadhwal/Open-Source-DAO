pragma solidity ^0.8.20;

interface IVestingWallet {
    function reclaimBank() external payable;
    function votingPeriod() external view returns (bool active, uint256 periodNo);
}