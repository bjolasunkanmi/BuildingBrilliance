// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ValueNFT
 * @dev NFT contract for tokenizing content with dynamic value calculation
 */
contract ValueNFT is ERC721, ERC721URIStorage, ERC721Burnable, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant MARKETPLACE_ROLE = keccak256("MARKETPLACE_ROLE");

    Counters.Counter private _tokenIdCounter;

    // Value NFT Structure
    struct ValueData {
        string contentId;           // Reference to off-chain content
        address creator;            // Original creator
        uint256 initialValue;       // Initial minting value
        uint256 currentValue;       // Current calculated value
        uint256 impactScore;        // Impact score (0-10000)
        uint256 engagementScore;    // Engagement score (0-10000)
        uint256 qualityScore;       // Quality score (0-10000)
        uint256 viewCount;          // Total views
        uint256 actionCount;        // Actions taken based on content
        uint256 mintTimestamp;      // When NFT was minted
        uint256 lastValueUpdate;    // Last value calculation update
        bool isListed;              // Whether NFT is listed for sale
        uint256 listPrice;          // Current listing price
    }

    mapping(uint256 => ValueData) public valueData;
    mapping(string => uint256) public contentToToken; // contentId => tokenId
    mapping(address => uint256[]) public creatorTokens;
    
    // Value calculation parameters
    uint256 public constant BASE_VALUE = 1 ether; // 1 ETH base value
    uint256 public constant MAX_MULTIPLIER = 10000; // 100x max multiplier
    uint256 public constant VALUE_DECAY_RATE = 9950; // 0.5% decay per update (basis points)
    
    // Marketplace
    mapping(uint256 => address) public tokenListings;
    uint256 public marketplaceFee = 250; // 2.5% fee (basis points)
    address public feeRecipient;
    
    // Events
    event ValueNFTMinted(
        uint256 indexed tokenId,
        string contentId,
        address indexed creator,
        uint256 initialValue
    );
    event ValueUpdated(
        uint256 indexed tokenId,
        uint256 oldValue,
        uint256 newValue,
        uint256 impactScore,
        uint256 engagementScore
    );
    event NFTListed(uint256 indexed tokenId, uint256 price);
    event NFTUnlisted(uint256 indexed tokenId);
    event NFTSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    constructor(
        address admin,
        address minter,
        address oracle,
        address _feeRecipient
    ) ERC721("BuildingBrilliance ValueNFT", "BBNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(ORACLE_ROLE, oracle);
        _grantRole(MARKETPLACE_ROLE, admin);
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Mint a new ValueNFT for content
     */
    function mintValueNFT(
        address to,
        string memory contentId,
        string memory tokenURI,
        uint256 initialValue
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(contentToToken[contentId] == 0, "Content already tokenized");
        require(initialValue >= BASE_VALUE / 10, "Initial value too low");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Initialize value data
        valueData[tokenId] = ValueData({
            contentId: contentId,
            creator: to,
            initialValue: initialValue,
            currentValue: initialValue,
            impactScore: 5000, // Start with 50% impact score
            engagementScore: 5000, // Start with 50% engagement score
            qualityScore: 7500, // Start with 75% quality score
            viewCount: 0,
            actionCount: 0,
            mintTimestamp: block.timestamp,
            lastValueUpdate: block.timestamp,
            isListed: false,
            listPrice: 0
        });

        contentToToken[contentId] = tokenId;
        creatorTokens[to].push(tokenId);

        emit ValueNFTMinted(tokenId, contentId, to, initialValue);
        return tokenId;
    }

    /**
     * @dev Update NFT value based on metrics (only oracle)
     */
    function updateValue(
        uint256 tokenId,
        uint256 newImpactScore,
        uint256 newEngagementScore,
        uint256 newQualityScore,
        uint256 viewCount,
        uint256 actionCount
    ) external onlyRole(ORACLE_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        
        ValueData storage data = valueData[tokenId];
        uint256 oldValue = data.currentValue;
        
        // Update metrics
        data.impactScore = newImpactScore;
        data.engagementScore = newEngagementScore;
        data.qualityScore = newQualityScore;
        data.viewCount = viewCount;
        data.actionCount = actionCount;
        
        // Calculate new value using Proof of Value algorithm
        uint256 newValue = _calculateValue(tokenId);
        data.currentValue = newValue;
        data.lastValueUpdate = block.timestamp;
        
        emit ValueUpdated(tokenId, oldValue, newValue, newImpactScore, newEngagementScore);
    }

    /**
     * @dev Calculate NFT value based on Proof of Value algorithm
     */
    function _calculateValue(uint256 tokenId) internal view returns (uint256) {
        ValueData memory data = valueData[tokenId];
        
        // Base calculation: initial value * composite score
        uint256 compositeScore = (
            data.impactScore * 40 +      // 40% weight on impact
            data.engagementScore * 35 +  // 35% weight on engagement
            data.qualityScore * 25       // 25% weight on quality
        ) / 100;
        
        // Apply time decay (content value decreases over time without engagement)
        uint256 timeSinceUpdate = block.timestamp - data.lastValueUpdate;
        uint256 decayPeriods = timeSinceUpdate / 1 days; // Daily decay
        uint256 decayMultiplier = VALUE_DECAY_RATE ** decayPeriods / (10000 ** decayPeriods);
        
        // Calculate multiplier from actions (actions increase value significantly)
        uint256 actionMultiplier = 10000; // Base 100%
        if (data.actionCount > 0) {
            actionMultiplier += (data.actionCount * 100); // +1% per action
            if (actionMultiplier > MAX_MULTIPLIER) {
                actionMultiplier = MAX_MULTIPLIER;
            }
        }
        
        // Final value calculation
        uint256 newValue = (data.initialValue * compositeScore * actionMultiplier * decayMultiplier) / 
                          (10000 * 10000 * 10000);
        
        // Ensure minimum value
        if (newValue < data.initialValue / 10) {
            newValue = data.initialValue / 10;
        }
        
        return newValue;
    }

    /**
     * @dev List NFT for sale
     */
    function listNFT(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(price > 0, "Price must be greater than 0");
        require(!valueData[tokenId].isListed, "Already listed");

        valueData[tokenId].isListed = true;
        valueData[tokenId].listPrice = price;
        tokenListings[tokenId] = msg.sender;

        emit NFTListed(tokenId, price);
    }

    /**
     * @dev Unlist NFT from sale
     */
    function unlistNFT(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(valueData[tokenId].isListed, "Not listed");

        valueData[tokenId].isListed = false;
        valueData[tokenId].listPrice = 0;
        delete tokenListings[tokenId];

        emit NFTUnlisted(tokenId);
    }

    /**
     * @dev Buy listed NFT
     */
    function buyNFT(uint256 tokenId) external payable nonReentrant {
        require(valueData[tokenId].isListed, "NFT not listed");
        require(msg.value == valueData[tokenId].listPrice, "Incorrect payment amount");

        address seller = ownerOf(tokenId);
        uint256 price = msg.value;
        uint256 fee = (price * marketplaceFee) / 10000;
        uint256 sellerAmount = price - fee;

        // Update listing status
        valueData[tokenId].isListed = false;
        valueData[tokenId].listPrice = 0;
        delete tokenListings[tokenId];

        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);

        // Transfer payments
        payable(seller).transfer(sellerAmount);
        payable(feeRecipient).transfer(fee);

        emit NFTSold(tokenId, seller, msg.sender, price);
    }

    /**
     * @dev Get NFT value data
     */
    function getValueData(uint256 tokenId) external view returns (ValueData memory) {
        require(_exists(tokenId), "Token does not exist");
        return valueData[tokenId];
    }

    /**
     * @dev Get current calculated value (without updating storage)
     */
    function getCurrentValue(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _calculateValue(tokenId);
    }

    /**
     * @dev Get tokens created by a specific creator
     */
    function getCreatorTokens(address creator) external view returns (uint256[] memory) {
        return creatorTokens[creator];
    }

    /**
     * @dev Get all listed NFTs (pagination)
     */
    function getListedNFTs(uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory tokenIds, uint256[] memory prices) 
    {
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory tempTokenIds = new uint256[](limit);
        uint256[] memory tempPrices = new uint256[](limit);
        uint256 count = 0;
        uint256 skipped = 0;

        for (uint256 i = 0; i < totalSupply && count < limit; i++) {
            if (_exists(i) && valueData[i].isListed) {
                if (skipped >= offset) {
                    tempTokenIds[count] = i;
                    tempPrices[count] = valueData[i].listPrice;
                    count++;
                } else {
                    skipped++;
                }
            }
        }

        // Resize arrays to actual count
        tokenIds = new uint256[](count);
        prices = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = tempTokenIds[i];
            prices[i] = tempPrices[i];
        }
    }

    /**
     * @dev Update marketplace fee (only admin)
     */
    function updateMarketplaceFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = newFee;
    }

    /**
     * @dev Update fee recipient (only admin)
     */
    function updateFeeRecipient(address newRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        
        // Clean up value data
        string memory contentId = valueData[tokenId].contentId;
        delete valueData[tokenId];
        delete contentToToken[contentId];
        if (tokenListings[tokenId] != address(0)) {
            delete tokenListings[tokenId];
        }
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}