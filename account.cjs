const { ethers } = require('ethers');

// Function to generate a random Ethereum wallet
function generateWallet() {
  // Create a random wallet
  const wallet = ethers.Wallet.createRandom();

  // Get the private key and address
  const privateKey = wallet.privateKey;
  const address = wallet.address;

  // Log the results
  console.log('Generated Ethereum Wallet:');
  console.log('------------------------');
  console.log('Private Key:', privateKey);
  console.log('Address:', address);
}

// Generate the wallet
generateWallet();
