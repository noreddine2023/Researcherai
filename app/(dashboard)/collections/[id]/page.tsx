'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, FileText, Trash2, Plus, Folder } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Link from 'next/link'

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [collection, setCollection] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingPaperId, setUploadingPaperId] = useState<string | null>(null)
  const [isSubcollectionDialogOpen, setIsSubcollectionDialogOpen] = useState(false)
  const [newSubcollection, setNewSubcollection] = useState({ name: '', description: '' })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchCollection()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchCollection = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/collections/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCollection(data)
      } else {
        alert('Collection not found')
        router.push('/collections')
      }
    } catch (error) {
      console.error('Failed to fetch collection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePaper = async (paperId: string) => {
    if (!confirm('Remove this paper from the collection?')) return

    try {
      const response = await fetch(
        `/api/collections/${params.id}/papers?paperId=${paperId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        fetchCollection()
      } else {
        alert('Failed to remove paper')
      }
    } catch (error) {
      console.error('Remove paper error:', error)
      alert('Failed to remove paper')
    }
  }

  const handleUploadPdf = async (paperId: string, file: File) => {
    setUploadingPaperId(paperId)
    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch(`/api/papers/${paperId}/upload-pdf`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        alert('PDF uploaded successfully!')
        fetchCollection()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload PDF')
      }
    } catch (error) {
      console.error('Upload PDF error:', error)
      alert('Failed to upload PDF')
    } finally {
      setUploadingPaperId(null)
    }
  }

  const handleFileSelect = (paperId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleUploadPdf(paperId, file)
    }
  }

  const handleCreateSubcollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubcollection.name.trim()) return

    setIsCreating(true)
    try {
      const payload = {
        name: newSubcollection.name,
        description: newSubcollection.description || undefined,
        parentId: params.id,
      }

      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setNewSubcollection({ name: '', description: '' })
        setIsSubcollectionDialogOpen(false)
        alert('Subcollection created successfully!')
        // Optionally navigate to collections page to see the tree
      } else {
        alert('Failed to create subcollection')
      }
    } catch (error) {
      console.error('Create subcollection error:', error)
      alert('Failed to create subcollection')
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading collection...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!collection) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/collections">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <Dialog open={isSubcollectionDialogOpen} onOpenChange={setIsSubcollectionDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Subcollection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Subcollection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubcollection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subname">Name</Label>
                <Input
                  id="subname"
                  value={newSubcollection.name}
                  onChange={(e) => setNewSubcollection({ ...newSubcollection, name: e.target.value })}
                  placeholder="Subcollection name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdescription">Description (optional)</Label>
                <Input
                  id="subdescription"
                  value={newSubcollection.description}
                  onChange={(e) => setNewSubcollection({ ...newSubcollection, description: e.target.value })}
                  placeholder="Description..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSubcollectionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">{collection.name}</h2>
        {collection.description && (
          <p className="text-muted-foreground mt-2">{collection.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {collection.papers?.length || 0} papers
        </p>
      </div>

      {/* Show subcollections if any */}
      {collection.children && collection.children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subcollections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {collection.children.map((child: any) => (
                <Link key={child.id} href={`/collections/${child.id}`}>
                  <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition cursor-pointer">
                    <Folder className="w-5 h-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{child.name}</p>
                      {child.description && (
                        <p className="text-xs text-muted-foreground truncate">{child.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {collection.papers && collection.papers.length > 0 ? (
        <div className="space-y-4">
          {collection.papers.map((cp: any) => (
            <Card key={cp.id} className="hover:shadow-lg transition">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/papers/${cp.paper.id}`}>
                      <CardTitle className="text-lg hover:text-blue-600 cursor-pointer">
                        {cp.paper.title}
                      </CardTitle>
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1">
                      {cp.paper.authors?.slice(0, 3).join(', ')}
                      {cp.paper.authors && cp.paper.authors.length > 3 && ' et al.'}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemovePaper(cp.paper.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {cp.paper.venue && <span>{cp.paper.venue}</span>}
                    {cp.paper.publicationDate && (
                      <span>
                        {new Date(cp.paper.publicationDate).getFullYear()}
                      </span>
                    )}
                    {cp.paper.citationCount !== undefined && (
                      <span>{cp.paper.citationCount} citations</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {cp.paper.uploadedPdfPath ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/papers/${cp.paper.id}/pdf`}>
                          <FileText className="w-4 h-4 mr-2" />
                          View PDF
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Input
                          id={`pdf-${cp.paper.id}`}
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => handleFileSelect(cp.paper.id, e)}
                          disabled={uploadingPaperId === cp.paper.id}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            document.getElementById(`pdf-${cp.paper.id}`)?.click()
                          }
                          disabled={uploadingPaperId === cp.paper.id}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingPaperId === cp.paper.id ? 'Uploading...' : 'Upload PDF'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No papers in this collection yet. Add papers from your saved papers or search results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
