import { NextRequest, NextResponse } from 'next/server';
import { PotholeReport } from '@/types/report';

// In-memory storage (replace with database in production)
const reports: PotholeReport[] = [];

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
