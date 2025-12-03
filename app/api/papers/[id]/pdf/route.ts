import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { deletePdf } from '@/lib/supabase'

export async function DELETE(
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
      return NextResponse.json({ error: 'No PDF to delete' }, { status: 404 })
    }

    // Delete from Supabase Storage
    const { error } = await deletePdf(paper.uploadedPdfPath)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    // Update paper to remove PDF path
    await prisma.paper.update({
      where: { id: params.id },
      data: { uploadedPdfPath: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PDF delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete PDF' },
      { status: 500 }
    )
  }
}
