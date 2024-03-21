pragma solidity ^0.8.20;

import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

using MessageHashUtils for DocumentIndex;

contract DocumentIndex {
    event DocumentSubmitted(bytes32 dochash);

    bytes32 private immutable projectDocHash;
    bytes32[] private projectReports;
    address[] private signers;
    uint256 private threshold;
    uint256 private nonce = 0;
    mapping(address => bool) isValidSigner;

    constructor(
        bytes32   _projectDocHash,
        address[] memory _signers,
        uint256 _signersThreshold
    ) {
        projectDocHash = _projectDocHash;
        signers = _signers;
        threshold = _signersThreshold;
        for (uint i = 0; i < threshold; i++) {
            isValidSigner[_signers[i]] = true;
        }
    }

    function proposal() public view returns (bytes32) {
        return projectDocHash;
    }

    function reports() public view returns (bytes32[] memory) {
        return projectReports;
    }

    function _processDocumentInfo(
        bytes32 _docHash,
        uint256 _nonce
    ) private pure returns (bytes32) {
        bytes32 _digest = keccak256(abi.encodePacked(_docHash, _nonce));
        return MessageHashUtils.toEthSignedMessageHash(_digest);
    }

    function _verifyMultiSignature(
        bytes32 _docHash, 
        uint256 _nonce, 
        bytes[] calldata _multiSignature
    ) private {
        require(_nonce > nonce, "do not allow replay");
        uint256 count = _multiSignature.length;
        require(count >= threshold, "not enough signers");
        bytes32 digest = _processDocumentInfo(_docHash, _nonce);

        address initSignerAddress;
        for (uint i = 0; i < count; i++) {
            bytes memory sig = _multiSignature[i];
            address signer = ECDSA.recover(digest, sig);
            require(signer > initSignerAddress, "duplicate?");
            require(isValidSigner[signer], "allow only valid signers");
            initSignerAddress = signer;
        }

        nonce = _nonce;
    }

    function submitReport(
        bytes32 _docHash, 
        uint256 _nonce, 
        bytes[] calldata _multiSignature
    ) public {
        _verifyMultiSignature(_docHash, _nonce, _multiSignature);
        emit DocumentSubmitted(_docHash);
        projectReports.push(_docHash);
    }
}