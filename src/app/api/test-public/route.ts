// Simple test API to verify basic functionality
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test API called');
    
    return NextResponse.json({
      success: true,
      message: 'Test API is working',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Test API failed' },
      { status: 500 }
    );
  }
} 