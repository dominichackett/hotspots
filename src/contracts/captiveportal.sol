// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";

contract CaptivePortal is Ownable {

  event NewPortal(address indexed owner,uint256 portalId,string name,string logo,uint256 fee,bool wcRequired);
  event PortalVerified(uint portalId,string uid); 
  event ApprovedToken(address contractAddress,bytes32 priceFeedId,string symbol,string name,uint256 decimals);
  event PortalSubscription(address subscriber,uint256 amount,address token,string symbol,uint256 datepaid,uint256 indexed portalId);
  event Donation(address subscriber,uint256 amount,address token,string symbol,uint256 datepaid,uint256 indexed portalId);

    struct Token {
      address contractAddress;
      bytes32 priceFeedId;
      string symbol;
      string name;
      uint256 decimals;

    }   

    struct Portal{
        address owner;
        string name;
        string logo;
        bool wcRequired;
        bool verified;
        bool isValue;
        uint256 fee;

        
    }

IPyth pyth;

Portal[] private portals;
mapping (address => Token) private approvedTokens;
mapping(uint256 => mapping(address => uint256)) private subscriptions;
address  verifier;
/**
  * @dev Modifier to check if portal Id exist .
  * @param portalId The portalId.
  */

modifier portalExist(uint256 portalId) {
    require(portals[portalId].isValue,"Portal doesn't exist.");
    _;
}



/**
  * @dev Modifier to check if token is approved token.
  * @param tokenId The tokenId.
  */

modifier isApprovedToken(address tokenId) {
    require(approvedTokens[tokenId].contractAddress != address(0) || tokenId == address(0),"Token not approved for payment.");
    _;
}

/**
  * @dev Modifier to check if address is verifier .
  * @param _verifier The portalId.
  */

modifier isVerifier(address _verifier) {
    require(verifier == _verifier,"Unauthorized not the verifier.");
    _;
}

constructor(address _pyth,address _verifier) Ownable(msg.sender){
       pyth = IPyth(_pyth);
       verifier = _verifier;

}

function createPortal(string memory name,string memory logo, bool wcRequired, uint256 fee) public {
   Portal memory newPortal =  Portal({owner:msg.sender,name:name,logo:logo,wcRequired:wcRequired,verified:false,fee:fee,isValue:true});
   portals.push(newPortal);
   emit NewPortal(msg.sender,portals.length-1,name,logo,fee,wcRequired);
  
  
}

function verifyPortal(uint256 portalId,string memory uid) public portalExist(portalId) isVerifier(msg.sender) {
  portals[portalId].verified = true;
  emit PortalVerified(portalId,uid);    
 
}

function getPortal(uint256 portalId) public  view portalExist(portalId) returns (Portal memory){
   return portals[portalId];
}
 
function approveToken(address contractAddress, bytes32 priceFeedId,string memory name, string memory symbol,uint256 decimals) public
{
   
   Token memory newToken = Token({contractAddress:contractAddress,priceFeedId:priceFeedId,name:name,symbol:symbol,decimals:decimals});
   approvedTokens[contractAddress] = newToken;
   emit ApprovedToken( contractAddress, priceFeedId,symbol,name,decimals);
  
}

function calculateTokenAmount(uint256 portalId,address token,bytes[] calldata pythPriceUpdate) internal returns(uint256)
{
     uint updateFee = pyth.getUpdateFee(pythPriceUpdate);
     pyth.updatePriceFeeds{ value: updateFee }(pythPriceUpdate);
     PythStructs.Price memory price = pyth.getPrice(approvedTokens[token].priceFeedId);
     uint256  decimals = approvedTokens[token].decimals;

    uint256 _price = (uint(uint64(price.price)) * (10 ** decimals)) /(10 ** uint8(uint32(-1 * price.expo)));
   
    uint oneDollarInWei = ((10 ** decimals) * (10 ** decimals)) / _price;
    uint256 amount = oneDollarInWei*portals[portalId].fee;
   return amount;
}

function paySubscription(uint256 portalId,address token,bytes[] calldata pythPriceUpdate) public payable portalExist(portalId) isApprovedToken(token) {
     uint256 amount = calculateTokenAmount(portalId,token,pythPriceUpdate);
      if(token== address(0)) //Native token
      {
          require(msg.value >= amount,"Insufficent amount");
          (bool success, ) = payable(portals[portalId].owner).call{value: amount}("");
          require(success, "Transfer failed");

      }else //IERC20 Token
      {

          require(IERC20(token).balanceOf(msg.sender)>= amount,"Insufficent amount");
          IERC20(token).transferFrom(msg.sender,portals[portalId].owner ,amount);


      }

      subscriptions[portalId][msg.sender] = block.timestamp;
     emit PortalSubscription(msg.sender,amount, token,approvedTokens[token].symbol,block.timestamp,portalId);


   
}

 // Function to check if a subscription is active
    function isSubscriptionActive(uint256 portalId, address user) public portalExist(portalId) view returns (bool) {
        
        uint256 thirtyDaysInSeconds = 30 * 24 * 60 * 60;//Subscription is 30 days
        return block.timestamp <= (subscriptions[portalId][user] + thirtyDaysInSeconds);   
     }


 function donate(uint256 portalId,address token,uint256 amount) public payable portalExist(portalId) isApprovedToken(token) {
    
      if(token== address(0)) //Native token
      {
          require(msg.value == amount,"Insufficent amount");
          (bool success, ) = payable(portals[portalId].owner).call{value: amount}("");
          require(success, "Transfer failed");

      }else //IERC20 Token
      {

          require(IERC20(token).balanceOf(msg.sender)>= amount,"Insufficent amount");
          IERC20(token).transferFrom(msg.sender,portals[portalId].owner ,amount);

         
      }

      emit Donation(msg.sender,amount, token,approvedTokens[token].symbol,block.timestamp,portalId);


   
}

function getApprovedToken(address token) public view returns(Token memory){
  return approvedTokens[token];
}

 function tokenIsApproved(address token) public view returns (bool){
    return approvedTokens[token].contractAddress != address(0);
 }   

function setVerifier(address _verifier) public onlyOwner{
  verifier =_verifier;
}


function getVerifier() public view returns (address){
  return verifier ;
}

}