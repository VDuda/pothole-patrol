/**
 * Additional MiniKit Commands for Pothole Patrol
 * Showcases full MiniKit SDK integration
 */

import { MiniKit, PayCommandInput, Tokens, SignMessageInput, WalletAuthInput } from '@worldcoin/minikit-js';

/**
 * Pay command - Reward users for verified reports
 * @param recipientAddress - Wallet address to send reward to
 * @param amount - Amount of WLD tokens to send
 * @param reportId - Report ID for reference
 */
export async function sendReward(
  recipientAddress: string,
  amount: number,
  reportId: string
) {
  if (!MiniKit.isInstalled()) {
    throw new Error('MiniKit is not installed');
  }

  try {
    const paymentPayload: PayCommandInput = {
      reference: `reward-${reportId}`,
      to: recipientAddress,
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: amount.toString(),
        }
      ],
      description: `Reward for verified pothole report #${reportId}`,
    };

    const { finalPayload } = await MiniKit.commandsAsync.pay(paymentPayload);

    if (finalPayload.status === 'error') {
      throw new Error(finalPayload.error_code || 'Payment failed');
    }

    return finalPayload;
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
}

/**
 * Sign message command - Sign report data for integrity verification
 * @param reportId - Report ID
 * @param data - Report data to sign
 */
export async function signReportData(reportId: string, data: string) {
  if (!MiniKit.isInstalled()) {
    throw new Error('MiniKit is not installed');
  }

  try {
    const message = `Pothole Patrol Report ${reportId}\nData: ${data}\nTimestamp: ${Date.now()}`;
    
    const signPayload: SignMessageInput = {
      message: message,
    };

    const { finalPayload } = await MiniKit.commandsAsync.signMessage(signPayload);

    if (finalPayload.status === 'error') {
      throw new Error(finalPayload.error_code || 'Signing failed');
    }

    return {
      signature: finalPayload.signature,
      message: message,
      address: finalPayload.address,
    };
  } catch (error) {
    console.error('Signing error:', error);
    throw error;
  }
}

/**
 * Wallet auth command - Authenticate user's wallet
 * Used for linking reports to user identity
 */
export async function authenticateWallet() {
  if (!MiniKit.isInstalled()) {
    throw new Error('MiniKit is not installed');
  }

  try {
    const nonce = crypto.randomUUID();
    const expirationTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const notBefore = new Date();

    const walletAuthPayload: WalletAuthInput = {
      nonce: nonce,
      expirationTime: expirationTime,
      notBefore: notBefore,
      statement: 'Sign in to Pothole Patrol to submit verified reports',
    };

    const { finalPayload } = await MiniKit.commandsAsync.walletAuth(walletAuthPayload);

    if (finalPayload.status === 'error') {
      throw new Error(finalPayload.error_code || 'Wallet auth failed');
    }

    return {
      address: finalPayload.address,
      nonce: nonce,
      signature: finalPayload.signature,
    };
  } catch (error) {
    console.error('Wallet auth error:', error);
    throw error;
  }
}

/**
 * Check if user has sufficient balance for rewards
 * @param address - Wallet address to check
 */
export async function checkWalletBalance(address: string): Promise<number> {
  // This would typically call a blockchain RPC
  // For now, return mock data
  // In production, use ethers.js or viem to check balance
  try {
    // Example: const provider = new ethers.JsonRpcProvider('https://worldchain-mainnet.g.alchemy.com/v2/YOUR_KEY');
    // const balance = await provider.getBalance(address);
    // return parseFloat(ethers.formatEther(balance));
    
    return 0; // Placeholder
  } catch (error) {
    console.error('Balance check error:', error);
    return 0;
  }
}

/**
 * Send transaction command - For on-chain report registration
 * @param to - Contract address
 * @param value - Value to send (in wei)
 * @param data - Transaction data
 */
export async function sendTransaction(
  to: string,
  value: string,
  data: string
) {
  if (!MiniKit.isInstalled()) {
    throw new Error('MiniKit is not installed');
  }

  try {
    const txPayload = {
      transaction: [{
        address: to,
        abi: [], // ABI is required for some implementations, passing empty for raw data transaction
        functionName: '',
        args: [],
        value: value,
        data: data, // raw data if supported, otherwise this might need ABI encoding
      }],
    };

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction(txPayload);

    if (finalPayload.status === 'error') {
      throw new Error(finalPayload.error_code || 'Transaction failed');
    }

    return {
      transactionId: finalPayload.transaction_id,
      status: finalPayload.status,
    };
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

/**
 * Get user's World ID nullifier hash
 * Useful for tracking unique users without revealing identity
 */
export function getNullifierHash(verificationPayload: any): string {
  return verificationPayload.nullifier_hash;
}

/**
 * Check if user is verified at Orb level
 */
export function isOrbVerified(verificationPayload: any): boolean {
  return verificationPayload.verification_level === 'orb';
}
