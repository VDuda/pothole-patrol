import lighthouse from '@lighthouse-web3/sdk';

/**
 * Upload a file to Filecoin via Lighthouse storage onramp
 * @param file - File or Blob to upload
 * @param apiKey - Lighthouse API key
 * @returns IPFS CID of the uploaded file
 */
export async function uploadToFilecoin(
  file: File | Blob,
  apiKey: string
): Promise<string> {
  try {
    // Convert Blob to File if needed
    const fileToUpload = file instanceof File 
      ? file 
      : new File([file], `pothole-${Date.now()}.jpg`, { type: 'image/jpeg' });

    // Upload to Lighthouse
    const uploadResponse = await lighthouse.upload(
      [fileToUpload],
      apiKey
    );

    if (!uploadResponse?.data?.Hash) {
      throw new Error('Upload failed: No CID returned');
    }

    return uploadResponse.data.Hash;
  } catch (error) {
    console.error('Filecoin upload error:', error);
    throw new Error(`Failed to upload to Filecoin: ${error}`);
  }
}

/**
 * Upload JSON metadata to Filecoin
 * @param metadata - JSON object to upload
 * @param apiKey - Lighthouse API key
 * @returns IPFS CID of the uploaded metadata
 */
export async function uploadMetadataToFilecoin(
  metadata: object,
  apiKey: string
): Promise<string> {
  try {
    const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json',
    });
    
    const file = new File([jsonBlob], `metadata-${Date.now()}.json`, {
      type: 'application/json',
    });

    const uploadResponse = await lighthouse.upload([file], apiKey);

    if (!uploadResponse?.data?.Hash) {
      throw new Error('Metadata upload failed: No CID returned');
    }

    return uploadResponse.data.Hash;
  } catch (error) {
    console.error('Metadata upload error:', error);
    throw new Error(`Failed to upload metadata: ${error}`);
  }
}

/**
 * Get the IPFS gateway URL for a CID
 * @param cid - IPFS CID
 * @returns Full IPFS gateway URL
 */
export function getIPFSUrl(cid: string): string {
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
}
