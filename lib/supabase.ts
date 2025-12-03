import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase configuration is missing. PDF storage features will not work.')
}

// Create a Supabase client with service role for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to get a signed URL for a PDF
export async function getSignedPdfUrl(path: string, expiresIn = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('papers')
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error getting signed URL:', error)
    return null
  }
}

// Helper function to upload a PDF
export async function uploadPdf(
  userId: string,
  paperId: string,
  file: Buffer,
  contentType = 'application/pdf'
): Promise<{ path: string; error: null } | { path: null; error: string }> {
  try {
    const path = `papers/${userId}/${paperId}/document.pdf`
    
    const { error } = await supabase.storage
      .from('papers')
      .upload(path, file, {
        contentType,
        upsert: true, // Allow overwriting existing files
      })

    if (error) {
      console.error('Error uploading PDF:', error)
      return { path: null, error: error.message }
    }

    return { path, error: null }
  } catch (error) {
    console.error('Error uploading PDF:', error)
    return { path: null, error: 'Failed to upload PDF' }
  }
}

// Helper function to delete a PDF
export async function deletePdf(path: string): Promise<{ error: null } | { error: string }> {
  try {
    const { error } = await supabase.storage
      .from('papers')
      .remove([path])

    if (error) {
      console.error('Error deleting PDF:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Error deleting PDF:', error)
    return { error: 'Failed to delete PDF' }
  }
}
