import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadPdf, getSignedPdfUrl } from '@/lib/supabase'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate paper ID format (should be a cuid)
    if (!/^[a-z0-9]{25}$/i.test(params.id)) {
      return NextResponse.json({ error: 'Invalid paper ID' }, { status: 400 })
    }

    // Verify ownership
    const paper = await prisma.paper.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('pdf') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    // Limit file size to 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 })
    }

    // Convert file to buffer for Supabase upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
    const { path, error } = await uploadPdf(
      session.user.id,
      params.id,
      buffer,
      file.type
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    // Update paper with uploaded PDF path
    const updatedPaper = await prisma.paper.update({
      where: { id: params.id },
      data: { uploadedPdfPath: path },
    })

    return NextResponse.json({ 
      success: true, 
      uploadedPdfPath: path,
      paper: updatedPaper 
    })
  } catch (error) {
    console.error('PDF upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload PDF' },
      { status: 500 }
    )
  }
}
