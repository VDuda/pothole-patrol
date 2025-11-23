import lighthouse from '@lighthouse-web3/sdk';
import fs from 'fs';
import path from 'path';

const apiKey = '1af32f10.36e36d56116d49c9812e6c864c00a906';

// The mock images we want to upload
// Since they are just reusing 'dashresult.jpeg' in the app, we will upload that one file.
const imagePath = 'public/dashresult.jpeg';

async function uploadMockImage() {
  try {
    console.log('Uploading mock dashcam image to Filecoin...');
    
    if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found: ${imagePath}`);
    }

    const response = await lighthouse.upload(imagePath, apiKey);
    
    console.log('Upload Response:', response);
    
    if (response.data.Hash) {
      console.log('✅ SUCCESS!');
      console.log(`CID: ${response.data.Hash}`);
      console.log(`View file at: https://gateway.lighthouse.storage/ipfs/${response.data.Hash}`);
    } else {
      console.error('❌ Upload failed: No hash returned');
    }
  } catch (error) {
    console.error('❌ Failed with error:', error);
  }
}

uploadMockImage();
