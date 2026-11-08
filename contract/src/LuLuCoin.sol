// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.7.0
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LuLuCoin is ERC20, Ownable {
    event Mint(address indexed to, uint256 amount);
    event Burn(uint256 amount);

    string public _name = "LuLuCoin";
    string public _symbol = "LLC";

    constructor(address initialOwner) ERC20(_name, _symbol) Ownable(initialOwner) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);

        emit Mint(to, amount);
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
        emit Burn(amount);
    }
}
