pragma solidity 0.6.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BedTracker is ERC20 {

    struct Details{
        uint id;
        uint timestamp;
    }
    mapping (address => uint256) private record;
    mapping (address => Details[]) patientId;
    //mapping (address => uint256[]) timestamp;

    constructor() public ERC20("Beds", "BDS") {
        _mint(msg.sender, 50);
    }

    function admit(uint256 num) public {
        require(_balances[msg.sender] > 0, "All beds are full");
        record[msg.sender] += 1;
        _balances[msg.sender] -= 1;
        Details memory temp = Details({
            id: num,
            timestamp: block.timestamp
        });

        patientId[msg.sender].push(temp);
        //timestamp[msg.sender].push(block.timestamp);
    }

    function discharge(uint num) public {
        require(record[msg.sender] > 0, "All Beds are empty");
        record[msg.sender] -= 1;
        _balances[msg.sender] += 1;
        for (uint i = 0; i < patientId[msg.sender].length - 1; i++) {
            if(patientId[msg.sender][i].id == num){
                delete patientId[msg.sender][i];
                for(uint256 j = i; j < patientId[msg.sender].length - 1; j++){
                    patientId[msg.sender][j] = patientId[msg.sender][j+1];
                }
                patientId[msg.sender].pop();
            }
        }
    }

    function getRecord(address hospital) public view returns(uint256){
        return record[hospital];
    }
/*
    function setId(uint no) public {
        patientId[msg.sender].push(no);
        timestamp[msg.sender].push(block.timestamp);
    }
*/
    function getIdTimestamp(uint srNo) public view returns(uint,uint){
        return (patientId[msg.sender][srNo].id,patientId[msg.sender][srNo].timestamp);
    }


    function fetchLength() public view returns(uint){
    return (patientId[msg.sender].length);
    }
}