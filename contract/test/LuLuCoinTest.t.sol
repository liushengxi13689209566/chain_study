//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {LuLuCoin} from "../src/LuLuCoin.sol";

contract LuLuCoinTest is Test {
    LuLuCoin public luluCoin;

    address public owner = address(0x1);
    address public user = address(0x2);

    address public Luca = address(0x3);

    function setUp() public {
        luluCoin = new LuLuCoin(owner);
        vm.deal(Luca, 1000 ether);
    }

    function testMint() public {
        vm.prank(owner);
        luluCoin.mint(user, 100);
        assertEq(luluCoin.balanceOf(user), 100);
    }

    function testBurn() public {
        vm.prank(owner);
        luluCoin.mint(owner, 100);
        vm.prank(owner);
        luluCoin.burn(50);
        assertEq(luluCoin.balanceOf(owner), 50);
    }

    function testRevertWhenNonOwnerMints() public {
        vm.startPrank(user);
        vm.expectRevert();
        luluCoin.mint(user, 100);
        vm.stopPrank();
    }
}
