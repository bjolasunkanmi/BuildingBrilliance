// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BuildingBrilliance Token (BBT)
 * @dev ERC20 token with staking, rewards, and governance features
 */
contract BuildingBrillianceToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant REWARDS_ROLE = keccak256("REWARDS_ROLE");

    // Token Economics
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million tokens

    // Staking
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardDebt;
        uint256 lockPeriod; // in seconds
    }

    mapping(address => Stake) public stakes;
    mapping(address => uint256) public rewards;
    
    uint256 public totalStaked;
    uint256 public rewardRate = 100; // 1% per year (100 basis points)
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // Reward Distribution
    uint256 public rewardPool;
    uint256 public lastRewardDistribution;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardDistributed(uint256 amount);
    event RewardRateUpdated(uint256 newRate);

    constructor(
        address admin,
        address minter,
        address rewardsManager
    ) ERC20("BuildingBrilliance Token", "BBT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(REWARDS_ROLE, rewardsManager);
        
        // Mint initial supply to admin
        _mint(admin, INITIAL_SUPPLY);
        lastRewardDistribution = block.timestamp;
    }

    /**
     * @dev Mint tokens (only by minter role)
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Pause token transfers (only by pauser role)
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers (only by pauser role)
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Stake tokens with lock period
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(lockPeriod >= 30 days, "Minimum lock period is 30 days");
        require(lockPeriod <= 365 days, "Maximum lock period is 365 days");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        // Calculate pending rewards before updating stake
        _updateRewards(msg.sender);

        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);

        // Update stake
        Stake storage userStake = stakes[msg.sender];
        userStake.amount += amount;
        userStake.timestamp = block.timestamp;
        userStake.lockPeriod = lockPeriod;
        
        totalStaked += amount;

        emit Staked(msg.sender, amount, lockPeriod);
    }

    /**
     * @dev Unstake tokens (only after lock period)
     */
    function unstake(uint256 amount) external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient staked amount");
        require(
            block.timestamp >= userStake.timestamp + userStake.lockPeriod,
            "Lock period not expired"
        );

        // Calculate and distribute rewards
        _updateRewards(msg.sender);
        _claimRewards();

        // Update stake
        userStake.amount -= amount;
        totalStaked -= amount;

        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() external nonReentrant {
        _updateRewards(msg.sender);
        _claimRewards();
    }

    /**
     * @dev Internal function to update user rewards
     */
    function _updateRewards(address user) internal {
        Stake storage userStake = stakes[user];
        if (userStake.amount > 0) {
            uint256 timeStaked = block.timestamp - userStake.timestamp;
            uint256 reward = (userStake.amount * rewardRate * timeStaked) / 
                           (SECONDS_PER_YEAR * 10000);
            rewards[user] += reward;
            userStake.timestamp = block.timestamp;
        }
    }

    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards() internal {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            require(rewardPool >= reward, "Insufficient reward pool");
            rewardPool -= reward;
            _transfer(address(this), msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
    }

    /**
     * @dev Distribute rewards to pool (only by rewards role)
     */
    function distributeRewards(uint256 amount) external onlyRole(REWARDS_ROLE) {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _transfer(msg.sender, address(this), amount);
        rewardPool += amount;
        lastRewardDistribution = block.timestamp;
        emit RewardDistributed(amount);
    }

    /**
     * @dev Update reward rate (only by admin)
     */
    function updateRewardRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRate <= 2000, "Reward rate cannot exceed 20%");
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    /**
     * @dev Get user's pending rewards
     */
    function pendingRewards(address user) external view returns (uint256) {
        Stake memory userStake = stakes[user];
        if (userStake.amount == 0) return rewards[user];
        
        uint256 timeStaked = block.timestamp - userStake.timestamp;
        uint256 pendingReward = (userStake.amount * rewardRate * timeStaked) / 
                              (SECONDS_PER_YEAR * 10000);
        return rewards[user] + pendingReward;
    }

    /**
     * @dev Get user's stake info
     */
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 lockPeriod,
        uint256 unlockTime,
        bool canUnstake
    ) {
        Stake memory userStake = stakes[user];
        amount = userStake.amount;
        timestamp = userStake.timestamp;
        lockPeriod = userStake.lockPeriod;
        unlockTime = userStake.timestamp + userStake.lockPeriod;
        canUnstake = block.timestamp >= unlockTime;
    }

    /**
     * @dev Calculate staking APR based on lock period
     */
    function getStakingAPR(uint256 lockPeriod) external view returns (uint256) {
        uint256 baseAPR = rewardRate; // Base APR in basis points
        
        // Bonus for longer lock periods
        if (lockPeriod >= 365 days) {
            return baseAPR + 500; // +5% bonus for 1 year lock
        } else if (lockPeriod >= 180 days) {
            return baseAPR + 300; // +3% bonus for 6 months lock
        } else if (lockPeriod >= 90 days) {
            return baseAPR + 100; // +1% bonus for 3 months lock
        }
        
        return baseAPR;
    }

    // Override required by Solidity
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Emergency withdrawal (only admin, pauses contract)
     */
    function emergencyWithdraw() external onlyRole(DEFAULT_ADMIN_ROLE) whenPaused {
        uint256 balance = balanceOf(address(this));
        if (balance > 0) {
            _transfer(address(this), msg.sender, balance);
        }
    }
}