import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSignedPdfUrl } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const paper = await prisma.paper.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    if (!paper.uploadedPdfPath) {
      return NextResponse.json({ error: 'No PDF available' }, { status: 404 })
    }

    // Get signed URL for PDF
    const signedUrl = await getSignedPdfUrl(paper.uploadedPdfPath)

    if (!signedUrl) {
      return NextResponse.json({ error: 'Failed to generate PDF URL' }, { status: 500 })
    }

    return NextResponse.json({ url: signedUrl })
  } catch (error) {
    console.error('PDF URL error:', error)
    return NextResponse.json(
      { error: 'Failed to get PDF URL' },
      { status: 500 }
    )
  }
}
