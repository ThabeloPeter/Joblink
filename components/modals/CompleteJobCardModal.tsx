'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Upload, XCircle, CheckCircle } from 'lucide-react'
import { useNotify } from '@/components/ui/NotificationProvider'
import { getAuthToken } from '@/lib/auth'

interface CompleteJobCardModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: { notes: string; images: string[] }) => Promise<void>
  jobCardTitle: string
  jobCardId: string
  isLoading?: boolean
}

interface ImagePreview {
  url: string
  file: File
  uploading: boolean
}

export default function CompleteJobCardModal({
  isOpen,
  onClose,
  onComplete,
  jobCardTitle,
  jobCardId,
  isLoading = false,
}: CompleteJobCardModalProps) {
  const notify = useNotify()
  const [notes, setNotes] = useState('')
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    const token = getAuthToken()
    
    if (!token) {
      notify.showError('Authentication required', 'Error')
      setUploading(false)
      return
    }

    const filesArray = Array.from(files)
    
    for (const file of filesArray) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        notify.showError(`${file.name} is too large. Maximum size is 5MB.`, 'Error')
        continue
      }

      if (!file.type.startsWith('image/')) {
        notify.showError(`${file.name} is not an image file.`, 'Error')
        continue
      }

      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file)
      const newPreview: ImagePreview = {
        url: previewUrl,
        file,
        uploading: true,
      }
      setImagePreviews((prev) => [...prev, newPreview])

      try {
        // Upload via API route (uses service role key to bypass RLS)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('jobCardId', jobCardId)

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed')
        }

        // Update preview with public URL
        setImagePreviews((prev) =>
          prev.map((p) =>
            p.url === previewUrl
              ? { url: data.publicUrl, file, uploading: false }
              : p
          )
        )
      } catch (error) {
        console.error('Error uploading image:', error)
        notify.showError(
          `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'Error'
        )
        setImagePreviews((prev) => prev.filter((p) => p.url !== previewUrl))
        URL.revokeObjectURL(previewUrl)
      }
    }

    setUploading(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const preview = imagePreviews[index]
    // Revoke object URL if it's a preview URL
    if (preview.url.startsWith('blob:')) {
      URL.revokeObjectURL(preview.url)
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!notes.trim()) {
      notify.showError('Please add completion notes', 'Error')
      return
    }

    // Check if any images are still uploading
    if (imagePreviews.some((img) => img.uploading)) {
      notify.showError('Please wait for images to finish uploading', 'Error')
      return
    }

    try {
      // Extract URLs from previews (only completed uploads)
      const imageUrls = imagePreviews
        .filter((img) => !img.uploading)
        .map((img) => img.url)
      
      await onComplete({ notes: notes.trim(), images: imageUrls })
      // Reset form
      setNotes('')
      // Revoke all object URLs
      imagePreviews.forEach((preview) => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url)
        }
      })
      setImagePreviews([])
      onClose()
    } catch {
      // Error handling is done in parent component
    }
  }

  const handleClose = () => {
    if (!isLoading && !uploading) {
      setNotes('')
      // Revoke all object URLs
      imagePreviews.forEach((preview) => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url)
        }
      })
      setImagePreviews([])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Complete Job Card
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {jobCardTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading || uploading}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Completion Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Completion Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading || uploading}
                placeholder="Describe what was completed, any issues encountered, or additional information..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {notes.length} characters
              </p>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Images (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isLoading || uploading}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || uploading}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                <span>{uploading ? 'Uploading...' : 'Click to upload images'}</span>
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum 5MB per image. Supported formats: JPG, PNG, GIF
              </p>

              {/* Image Preview */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative">
                        <Image
                          src={preview.url}
                          alt={`Upload ${index + 1}`}
                          width={128}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                          unoptimized
                        />
                        {preview.uploading && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        disabled={isLoading || uploading || preview.uploading}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading || uploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || uploading || !notes.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete Job
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

