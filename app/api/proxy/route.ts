import { NextResponse } from 'next/server'

// Video proxy - handle video streams properly
export async function GET(request: Request) {
  try {
    const url = new URL(request.url).searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 })

    // Handle video streams (m3u8, mp4, etc.)
    const isVideo = url.match(/\.(m3u8|mp4|webm|mkv|avi|mov)$/i)
    const headers: Record<string, string> = isVideo
      ? {
          'Content-Type': 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        }
      : { Accept: 'application/json' };

    const res = await fetch(url, {
      headers,
      // Stream response for large video files
      cf: { cacheTtl: 3600 }, // Cloudflare cache if using Vercel
    } as any)

    // Handle error responses
    if (!res.ok && !isVideo) {
      return NextResponse.json({ error: `HTTP ${res.status} from ${url}` }, { status: res.status })
    }

    // For video streams, pipe the response directly
    if (isVideo) {
      return new NextResponse(res.body, {
        status: res.status,
        headers: {
          'Content-Type': res.headers.get('content-type') || 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          ...Object.fromEntries(res.headers.entries())
        }
      })
    }

    const body = await res.text()
    return new NextResponse(body, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } })
  } catch (e: any) {
    console.error('Video proxy error:', e)
    return NextResponse.json({ error: e.message || 'proxy error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 })

    const isVideo = url.match(/\.(m3u8|mp4|webm|mkv|avi|mov)$/i)
    const headers: Record<string, string> = isVideo
      ? {
          'Content-Type': 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        }
      : { 'Accept': 'application/json', 'content-type': request.headers.get('content-type') || 'application/json' };

    const res = await fetch(url, {
      method: 'POST',
      body: await request.text(),
      headers,
      cf: { cacheTtl: 3600 }
    } as any)

    if (!res.ok && !isVideo) {
      return NextResponse.json({ error: `HTTP ${res.status} from ${url}` }, { status: res.status })
    }

    if (isVideo) {
      return new NextResponse(res.body, {
        status: res.status,
        headers: {
          'Content-Type': res.headers.get('content-type') || 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          ...Object.fromEntries(res.headers.entries())
        }
      })
    }

    const body = await res.text()
    return new NextResponse(body, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } })
  } catch (e: any) {
    console.error('Video proxy POST error:', e)
    return NextResponse.json({ error: e.message || 'proxy error' }, { status: 500 })
  }
}
