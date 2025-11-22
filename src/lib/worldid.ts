import { MiniKit } from '@worldcoin/minikit-js';
import { ethers } from 'ethers';

/**
 * Initialize World MiniKit
 * @param appId - World App ID from developer portal
 */
export function initializeMiniKit(appId: string) {
  if (typeof window === 'undefined') return;
  
  MiniKit.install(appId);
}

/**
 * Generate a signal for World ID verification
 * @param latitude - GPS latitude
 * @param longitude - GPS longitude
 * @param timestamp - Unix timestamp
 * @returns Hashed signal
 */
export function generateSignal(
  latitude: number,
  longitude: number,
  timestamp: number
): string {
  const data = `${latitude.toFixed(6)}-${longitude.toFixed(6)}-${timestamp}`;
  return ethers.id(data);
}

/**
 * Verify a pothole report with World ID
 * @param latitude - GPS latitude
 * @param longitude - GPS longitude
 * @param timestamp - Unix timestamp
 * @returns World ID verification response
 */
export async function verifyWithWorldID(
  latitude: number,
  longitude: number,
  timestamp: number
) {
  try {
    const signal = generateSignal(latitude, longitude, timestamp);
    
    const verifyResponse = await MiniKit.commands.verify({
      action: 'report-pothole',
      signal: signal,
    });

    if (!verifyResponse) {
      throw new Error('Verification failed: No response');
    }

    return verifyResponse;
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
