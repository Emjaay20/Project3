require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying HashStorage contract...");

  // Get the contract factory
  const HashStorage = await ethers.getContractFactory("HashStorage");

  // Deploy the contract
  const hashStorage = await HashStorage.deploy();

  // Wait for deployment to finish
  await hashStorage.waitForDeployment();

  // Get the deployed contract address
  const address = await hashStorage.getAddress();

  console.log("HashStorage deployed to:", address);

  console.log("Verifying contract on Etherscan...");
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: [],
  });
}
// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });