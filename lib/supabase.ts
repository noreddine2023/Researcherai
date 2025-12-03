import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create a Supabase client only if credentials are provided
export const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceKey)

// Helper function to get a signed URL for a PDF
export async function getSignedPdfUrl(path: string, expiresIn = 3600): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase is not configured')
    return null
  }

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
  if (!supabase) {
    return { path: null, error: 'Supabase is not configured' }
  }

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
  if (!supabase) {
    return { error: 'Supabase is not configured' }
  }

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
