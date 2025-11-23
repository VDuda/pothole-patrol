import { NextRequest, NextResponse } from 'next/server';
import { PotholeReport } from '@/types/report';

// In-memory storage (replace with database in production)
const reports: PotholeReport[] = [
  {
    id: 'mock-1',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    location: { latitude: -34.590706, longitude: -58.395948 },
    image: { dataUrl: '/dashresult.jpeg' },
    detection: { confidence: 0.92, boundingBox: { x: 100, y: 100, width: 200, height: 200 } },
    status: 'published',
    worldId: { nullifier_hash: '0x1234...mock...hash' },
    filecoin: { cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi', uploadDate: new Date().toISOString() }
  },
  {
    id: 'mock-2',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    location: { latitude: -34.591200, longitude: -58.395500 },
    image: { dataUrl: '/dashresult.jpeg' },
    detection: { confidence: 0.88, boundingBox: { x: 150, y: 150, width: 180, height: 180 } },
    status: 'published',
    worldId: { nullifier_hash: '0xabcd...mock...hash' },
    filecoin: { cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi', uploadDate: new Date().toISOString() }
  },
  {
    id: 'mock-3',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    location: { latitude: -34.590200, longitude: -58.396500 },
    image: { dataUrl: '/dashresult.jpeg' },
    detection: { confidence: 0.75, boundingBox: { x: 50, y: 50, width: 100, height: 100 } },
    status: 'verified',
    worldId: { nullifier_hash: '0x9876...mock...hash' }
  },
  {
    id: 'mock-4',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
    location: { latitude: -34.590500, longitude: -58.395200 },
    image: { dataUrl: '/dashresult.jpeg' },
    detection: { confidence: 0.65, boundingBox: { x: 300, y: 300, width: 120, height: 120 } },
    status: 'pending',
  }
];

export async function GET(request: NextRequest) {
  try {
    // Return all reports sorted by timestamp (newest first)
    const sortedReports = [...reports].sort((a, b) => b.timestamp - a.timestamp);
    
    return NextResponse.json({
      success: true,
      reports: sortedReports,
      count: sortedReports.length,
    });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const reportJson = formData.get('report') as string;
    const imageFile = formData.get('image') as File;

    if (!reportJson) {
      return NextResponse.json(
        { success: false, error: 'Missing report data' },
        { status: 400 }
      );
    }

    const report: PotholeReport = JSON.parse(reportJson);

    // Validate required fields
    if (!report.id || !report.timestamp || !report.location || !report.detection) {
      return NextResponse.json(
        { success: false, error: 'Invalid report data' },
        { status: 400 }
      );
    }

    // Store report
    reports.push(report);

    console.log(`New report received: ${report.id}`);
    console.log(`Total reports: ${reports.length}`);

    return NextResponse.json({
      success: true,
      report: report,
      message: 'Report submitted successfully',
    });
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, updates } = body;

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'Missing report ID' },
        { status: 400 }
      );
    }

    const reportIndex = reports.findIndex((r) => r.id === reportId);
    
    if (reportIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Update report
    reports[reportIndex] = {
      ...reports[reportIndex],
      ...updates,
    };

    return NextResponse.json({
      success: true,
      report: reports[reportIndex],
      message: 'Report updated successfully',
    });
  } catch (error) {
    console.error('PATCH /api/reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
