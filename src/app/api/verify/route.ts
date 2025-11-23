import { NextRequest, NextResponse } from 'next/server';
import { verifyCloudProof, IVerifyResponse, ISuccessResult } from '@worldcoin/minikit-js';

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string | undefined;
}

/**
 * POST /api/verify
 * Verify World ID proof on the server
 * 
 * This endpoint MUST be called from the server to prevent client-side manipulation
 */
export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = (await req.json()) as IRequestPayload;

    // Get App ID from environment variable
    // Fallback to NEXT_PUBLIC_WLD_APP_ID if APP_ID is not set (common in hackathons)
    const app_id = (process.env.APP_ID || process.env.NEXT_PUBLIC_WLD_APP_ID) as `app_${string}`;

    if (!app_id) {
      return NextResponse.json(
        { success: false, error: 'APP_ID not configured' },
        { status: 500 }
      );
    }

    // Verify the proof using World ID Cloud API
    const verifyRes = (await verifyCloudProof(
      payload,
      app_id,
      action,
      signal
    )) as IVerifyResponse;

    if (verifyRes.success) {
      // Verification successful
      // This is where you should perform backend actions
      // Such as marking a user as "verified" in a database
      
      return NextResponse.json({
        success: true,
        verifyRes,
        status: 200,
      });
    } else {
      // Verification failed
      // Usually these errors are due to:
      // - User already verified for this action
      // - Invalid proof
      // - Replay attack detected
      
      console.error('Verification failed:', verifyRes);
      
      return NextResponse.json(
        {
          success: false,
          verifyRes,
          error: 'Verification failed',
          status: 400,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      },
      { status: 500 }
    );
  }
}
