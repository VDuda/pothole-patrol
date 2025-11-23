import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js';
import { ethers } from 'ethers';

/**
 * Generate a signal for World ID verification
 * Creates a unique hash based on location and timestamp to prevent replay attacks
 * @param latitude - GPS latitude
 * @param longitude - GPS longitude
 * @param timestamp - Unix timestamp
 * @returns Keccak256 hash of the data
 */
export function generateSignal(
  latitude: number,
  longitude: number,
  timestamp: number
): string {
  const data = `${latitude.toFixed(6)}-${longitude.toFixed(6)}-${timestamp}`;
  return ethers.id(data); // Keccak256 hash
}

/**
 * Verify a pothole report with World ID using async command
 * @param latitude - GPS latitude (optional if custom signal provided)
 * @param longitude - GPS longitude (optional if custom signal provided)
 * @param timestamp - Unix timestamp (optional if custom signal provided)
 * @param customSignal - Custom signal string (e.g. for batch verification)
 * @returns World ID verification payload
 */
export async function verifyWithWorldID(
  latitude?: number,
  longitude?: number,
  timestamp?: number,
  customSignal?: string
) {
  if (!MiniKit.isInstalled()) {
    throw new Error('MiniKit is not installed. Please open in World App.');
  }

  try {
    let signal: string;
    
    if (customSignal) {
      signal = customSignal;
    } else if (latitude !== undefined && longitude !== undefined && timestamp !== undefined) {
      signal = generateSignal(latitude, longitude, timestamp);
    } else {
      throw new Error('Insufficient data for signal generation');
    }
    
    const verifyPayload: VerifyCommandInput = {
      action: process.env.NEXT_PUBLIC_WLD_ACTION || 'report-pothole', 
      signal: signal,
      verification_level: VerificationLevel.Orb, // Require Orb verification for highest security
    };

    // Use async command - World App will open a drawer for user confirmation
    const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

    if (finalPayload.status === 'error') {
      console.error('Verification error:', finalPayload);
      throw new Error(finalPayload.error_code || 'Verification failed');
    }

    // Return the success payload for backend verification
    return {
      payload: finalPayload as ISuccessResult,
      action: 'report-pothole',
      signal: signal,
    };
  } catch (error) {
    console.error('World ID verification error:', error);
    throw error;
  }
}

/**
 * Check if running inside World App
 * @returns true if inside World App MiniKit environment
 */
export function isWorldApp(): boolean {
  if (typeof window === 'undefined') return false;
  return MiniKit.isInstalled();
}
