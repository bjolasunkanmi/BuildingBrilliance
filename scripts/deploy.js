const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy BuildingBrilliance Token
  console.log("\n🚀 Deploying BuildingBrilliance Token...");
  const BuildingBrillianceToken = await ethers.getContractFactory("BuildingBrillianceToken");
  const bbtToken = await BuildingBrillianceToken.deploy(
    deployer.address, // admin
    deployer.address, // minter
    deployer.address  // rewards manager
  );
  await bbtToken.deployed();
  
  console.log("✅ BuildingBrilliance Token deployed to:", bbtToken.address);

  // Deploy ValueNFT Contract
  console.log("\n🚀 Deploying ValueNFT Contract...");
  const ValueNFT = await ethers.getContractFactory("ValueNFT");
  const valueNFT = await ValueNFT.deploy(
    deployer.address, // admin
    deployer.address, // minter
    deployer.address, // oracle
    deployer.address  // fee recipient
  );
  await valueNFT.deployed();
  
  console.log("✅ ValueNFT Contract deployed to:", valueNFT.address);

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      BuildingBrillianceToken: {
        address: bbtToken.address,
        txHash: bbtToken.deployTransaction.hash
      },
      ValueNFT: {
        address: valueNFT.address,
        txHash: valueNFT.deployTransaction.hash
      }
    },
    deployedAt: new Date().toISOString()
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📄 Deployment info saved to:", deploymentFile);

  // Verify contracts on Etherscan (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Waiting for block confirmations...");
    await bbtToken.deployTransaction.wait(6);
    await valueNFT.deployTransaction.wait(6);

    console.log("\n🔍 Verifying contracts on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: bbtToken.address,
        constructorArguments: [
          deployer.address,
          deployer.address,
          deployer.address
        ],
      });
      console.log("✅ BuildingBrilliance Token verified");
    } catch (error) {
      console.log("❌ Error verifying BuildingBrilliance Token:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: valueNFT.address,
        constructorArguments: [
          deployer.address,
          deployer.address,
          deployer.address,
          deployer.address
        ],
      });
      console.log("✅ ValueNFT Contract verified");
    } catch (error) {
      console.log("❌ Error verifying ValueNFT Contract:", error.message);
    }
  }

  // Display summary
  console.log("\n🎉 Deployment Summary:");
  console.log("========================");
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${deploymentInfo.chainId}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`BBT Token: ${bbtToken.address}`);
  console.log(`ValueNFT: ${valueNFT.address}`);
  console.log("========================");

  // Setup initial configuration
  console.log("\n⚙️ Setting up initial configuration...");
  
  // Distribute initial reward pool (10% of initial supply)
  const initialRewardPool = ethers.utils.parseEther("10000000"); // 10M tokens
  await bbtToken.transfer(bbtToken.address, initialRewardPool);
  await bbtToken.distributeRewards(initialRewardPool);
  console.log("✅ Initial reward pool distributed");

  // Grant roles if needed
  const MINTER_ROLE = await valueNFT.MINTER_ROLE();
  const ORACLE_ROLE = await valueNFT.ORACLE_ROLE();
  
  // These are already granted to deployer in constructor, but showing how to grant to other addresses
  // await valueNFT.grantRole(MINTER_ROLE, "0x..."); // Grant to backend service
  // await valueNFT.grantRole(ORACLE_ROLE, "0x..."); // Grant to oracle service
  
  console.log("✅ Roles configured");
  console.log("\n🚀 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });