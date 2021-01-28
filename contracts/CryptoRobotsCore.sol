// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./tokens/nf-token-metadata.sol";
import "./tokens/nf-token-enumerable.sol";
import "./ownership/ownable.sol";


/**
 * @dev This is an example contract implementation of NFToken with enumerable and metadata
 * extensions.
 */
contract CryptoRobotsCore is
  NFTokenEnumerable,
  NFTokenMetadata,
  Ownable
{

  struct Robot {
    uint id;
    uint generation;
    bytes gene;
    bool active;
  }

  mapping(uint256 => Robot) internal robots;
  uint internal nextId;

  /**
   * @dev Contract constructor.
   * @param _name A descriptive name for a collection of NFTs.
   * @param _symbol An abbreviated name for NFTokens.
   * @param _baseURI base uri
   */
  constructor(
    string memory _name,
    string memory _symbol,
    string memory _baseURI
  )
  {
    nftName = _name;
    nftSymbol = _symbol;
    baseURI = _baseURI;
  }

  /**
   * @dev Mints a new NFT. Modified
   */
  function mint() external onlyOwner
  {
    _mint(owner, nextId);
    robots[nextId] = Robot(nextId, 1, _randomByte(1000000000), true);
    nextId++;
  }

  function getAllRobots() external view returns(Robot[] memory) {
    Robot[] memory _robots = new Robot[](tokens.length);
    for(uint i = 0; i < tokens.length; i++) {
      _robots[i] = robots[i];
    }
    return _robots;
  }

  function getRobotByIndex(uint _robotId) external view returns(Robot memory) {
    return robots[_robotId];
  }

  function getAllRobotsOf(address owner) external view returns(Robot[] memory) {
    uint256[] memory ownerTokens = ownerToIds[owner];
    Robot[] memory _robots = new Robot[](ownerTokens.length);
    for(uint i = 0; i < ownerTokens.length; i++) {
      uint _tokenId = ownerTokens[i];
      _robots[i] = robots[_tokenId];
    }
    return _robots;
  }

  function breed(uint robot1Id, uint robot2Id)
    external
    validNFToken(robot1Id)
    validNFToken(robot2Id)
  {
    address tokenOwner = idToOwner[robot1Id];
    address tokenOwner2 = idToOwner[robot2Id];
    require(tokenOwner == msg.sender && tokenOwner2 == msg.sender, NOT_OWNER);
    Robot storage robot1 = robots[robot1Id];
    Robot storage robot2 = robots[robot1Id];
    uint baseGen = robot1.generation > robot2.generation ? robot1.generation : robot2.generation;
    // bytes gene = robot1.gene;
    _mint(msg.sender, nextId);
    robots[nextId] = Robot(nextId, baseGen + 1, _randomByte(1000000000), true);
    nextId++;
  }



  /**
   * @dev Removes a NFT from owner.
   * @param _tokenId Which NFT we want to remove.
   */
  function burn(
    uint256 _tokenId
  )
    external
    onlyOwner
  {
    _burn(_tokenId);
  }

  /**
   * @dev Mints a new NFT.
   * @notice This is an internal function which should be called from user-implemented external
   * mint function. Its purpose is to show and properly initialize data structures when using this
   * implementation.
   * @param _to The address that will own the minted NFT.
   * @param _tokenId of the NFT to be minted by the msg.sender.
   */
  function _mint(
    address _to,
    uint256 _tokenId
  )
    internal
    override(NFToken, NFTokenEnumerable)
    virtual
  {
    NFTokenEnumerable._mint(_to, _tokenId);
  }

  /**
   * @dev Burns a NFT.
   * @notice This is an internal function which should be called from user-implemented external
   * burn function. Its purpose is to show and properly initialize data structures when using this
   * implementation. Also, note that this burn implementation allows the minter to re-mint a burned
   * NFT.
   * @param _tokenId ID of the NFT to be burned.
   */
  function _burn(
    uint256 _tokenId
  )
    internal
    override(NFTokenMetadata, NFTokenEnumerable)
    virtual
  {
    robots[_tokenId].active = false;
    NFTokenEnumerable._burn(_tokenId);
  }

  /**
   * @dev Removes a NFT from an address.
   * @notice Use and override this function with caution. Wrong usage can have serious consequences.
   * @param _from Address from wich we want to remove the NFT.
   * @param _tokenId Which NFT we want to remove.
   */
  function _removeNFToken(
    address _from,
    uint256 _tokenId
  )
    internal
    override(NFToken, NFTokenEnumerable)
  {
    NFTokenEnumerable._removeNFToken(_from, _tokenId);
  }

  /**
   * @dev Assignes a new NFT to an address.
   * @notice Use and override this function with caution. Wrong usage can have serious consequences.
   * @param _to Address to wich we want to add the NFT.
   * @param _tokenId Which NFT we want to add.
   */
  function _addNFToken(
    address _to,
    uint256 _tokenId
  )
    internal
    override(NFToken, NFTokenEnumerable)
  {
    NFTokenEnumerable._addNFToken(_to, _tokenId);
  }

   /**
   * @dev Helper function that gets NFT count of owner. This is needed for overriding in enumerable
   * extension to remove double storage(gas optimization) of owner nft count.
   * @param _owner Address for whom to query the count.
   * @return Number of _owner NFTs.
   */
  function _getOwnerNFTCount(
    address _owner
  )
    internal
    override(NFToken, NFTokenEnumerable)
    view
    returns (uint256)
  {
    return NFTokenEnumerable._getOwnerNFTCount(_owner);
  }

  function _randomByte(uint max) internal view returns(bytes memory) {
    uint gene = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % max;
    return abi.encodePacked(gene);
  }

}
