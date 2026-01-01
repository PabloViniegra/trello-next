import { type NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const tokenConfigured = !!process.env.BLOB_READ_WRITE_TOKEN
    const tokenLength = process.env.BLOB_READ_WRITE_TOKEN?.length || 0

    return NextResponse.json({
      blobConfigured: tokenConfigured,
      tokenLength: tokenLength,
      nodeEnv: process.env.NODE_ENV,
    })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Debug endpoint failed' },
      { status: 500 },
    )
  }
}
