export interface PotholeReport {
  id: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  image: {
    dataUrl: string;
    blob?: Blob;
  };
  detection: {
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  worldId?: any; // World ID verification payload
  status: 'pending' | 'verified' | 'published';
  filecoin?: {
    cid: string;
    uploadDate: string;
    dealId?: string;
  };
}

export interface JSONLDDataset {
  '@context': string;
  '@type': string;
  name: string;
  creator: string;
  variableMeasured: string;
  distribution: JSONLDDistribution[];
}

export interface JSONLDDistribution {
  '@type': string;
  contentUrl: string;
  encodingFormat: string;
  uploadDate: string;
  verificationMethod: string;
  location?: {
    '@type': string;
    latitude: number;
    longitude: number;
  };
}
