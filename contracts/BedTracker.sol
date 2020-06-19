pragma solidity 0.6.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BedTracker is ERC20 {
    uint256 private record;

    constructor() public ERC20("Beds", "BDS") {
        _mint(msg.sender, 50);
    }

    function admit() public {
        require(_balances[msg.sender] > 0, "All beds are full");
        record += 1;
        _balances[msg.sender] -= 1;
    }

    function discharge() public {
        require(record > 0, "All Beds are empty");
        record -= 1;
        _balances[msg.sender] += 1;
    }
}
