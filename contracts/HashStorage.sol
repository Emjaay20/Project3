// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HashStorage {
    // Structure to store hash details
    struct HashData {
        bytes32 dataHash;
        uint256 timestamp;
        address owner;
        bool exists;
    }

    // Mapping from hash ID to HashData
    mapping(uint256 => HashData) public hashes;

    // Counter for generating unique hash IDs
    uint256 private hashCounter;

    // Mapping to track hashes owned by each address
    mapping(address => uint256[]) private userHashes;

    // Events
    event HashStored(
        uint256 indexed hashId,
        bytes32 dataHash,
        address indexed owner
    );
    event HashDeleted(uint256 indexed hashId, address indexed owner);

    // Store a new hash
    function storeHash(bytes32 _dataHash) public returns (uint256) {
        hashCounter++;

        hashes[hashCounter] = HashData({
            dataHash: _dataHash,
            timestamp: block.timestamp,
            owner: msg.sender,
            exists: true
        });

        userHashes[msg.sender].push(hashCounter);

        emit HashStored(hashCounter, _dataHash, msg.sender);
        return hashCounter;
    }

    // Get hash data by ID
    function getHash(
        uint256 _hashId
    ) public view returns (bytes32 dataHash, uint256 timestamp, address owner) {
        require(hashes[_hashId].exists, "Hash does not exist");
        HashData storage hashData = hashes[_hashId];
        return (hashData.dataHash, hashData.timestamp, hashData.owner);
    }

    // Delete a hash (only owner can delete)
    function deleteHash(uint256 _hashId) public {
        require(hashes[_hashId].exists, "Hash does not exist");
        require(
            hashes[_hashId].owner == msg.sender,
            "Only owner can delete hash"
        );

        delete hashes[_hashId];
        emit HashDeleted(_hashId, msg.sender);

        // Remove hash ID from user's array
        uint256[] storage userHashIds = userHashes[msg.sender];
        for (uint256 i = 0; i < userHashIds.length; i++) {
            if (userHashIds[i] == _hashId) {
                userHashIds[i] = userHashIds[userHashIds.length - 1];
                userHashIds.pop();
                break;
            }
        }
    }

    // Get all hashes owned by the caller
    function getUserHashes() public view returns (uint256[] memory) {
        return userHashes[msg.sender];
    }

    // Verify if a hash exists and matches stored data
    function verifyHash(
        uint256 _hashId,
        bytes32 _dataHash
    ) public view returns (bool) {
        if (!hashes[_hashId].exists) {
            return false;
        }
        return hashes[_hashId].dataHash == _dataHash;
    }

    // Get total number of hashes stored
    function getTotalHashes() public view returns (uint256) {
        return hashCounter;
    }
}
