require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  try {
    // Get the contract factory
    const HashStorage = await ethers.getContractFactory("HashStorage");

    console.log("Deploying HashStorage contract...");

    // Deploy the contract
    const hashStorage = await HashStorage.deploy();

    // Wait for deployment to finish
    await hashStorage.deployed();

    console.log("HashStorage deployed to:", hashStorage.address);
    console.log("Transaction hash:", hashStorage.deployTransaction.hash);

    // Wait for few block confirmations
    console.log("Waiting for block confirmations...");
    await hashStorage.deployTransaction.wait(5);

    console.log("Contract deployment confirmed!");

    // Verify contract on Etherscan (optional)
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: hashStorage.address,
      constructorArguments: [],
    });

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });