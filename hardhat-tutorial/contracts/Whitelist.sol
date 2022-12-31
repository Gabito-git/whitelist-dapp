//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Whitelist{

  uint8 public maxWhitelistedAddresses;

  uint8 public numAddressesWhitelisted;

  mapping(address => bool) public whitelistedAddresses;

  constructor(uint8 _maxWhitelistedAddresses){
    maxWhitelistedAddresses = _maxWhitelistedAddresses;
  }

  function addAddressToWhitelist () public {
    require( !whitelistedAddresses[msg.sender], "Sender already in the whitelist");
    require( numAddressesWhitelisted < maxWhitelistedAddresses, "Max limit reached" );

    whitelistedAddresses[ msg.sender ] =  true;
    numAddressesWhitelisted++;
  }

}

