import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { documentsApi } from '../lib/api'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

const MAX_SIZE = 50 * 1024 * 1024 // 50MB
const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
}

export default function DocumentUpload({ module = 'ma', onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const { addDocument } = useStore()

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return
    const file = acceptedFiles[0]

    setUploading(true)
    setUploadError(null)
    setUploadedFile(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('module', module)

      const { data } = await documentsApi.upload(formData)
      addDocument(data)
      setUploadedFile(data)
      onUploaded?.(data)

      // Poll until processing is complete
      const poll = setInterval(async () => {
        try {
          const { data: updated } = await documentsApi.get(data.id)
          if (updated.status !== 'processing') {
            clearInterval(poll)
            setUploadedFile(updated)
          }
        } catch {
          clearInterval(poll)
        }
      }, 2000)

    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Upload failed. Please ensure file is valid.')
    } finally {
      setUploading(false)
    }
  }, [module, addDocument, onUploaded])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: uploading,
  })

  return (
    <div className="space-y-3 font-sans">
      <div
        {...getRootProps()}
        className={clsx(
          'border border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-harvey-ivory bg-harvey-surface/80'
            : 'border-harvey-border hover:border-harvey-muted/80 bg-harvey-charcoal/50 hover:bg-harvey-surface/50',
          uploading && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2.5">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-harvey-ivory animate-spin" />
          ) : (
            <div className="w-8 h-8 rounded border border-harvey-border flex items-center justify-center bg-harvey-surface text-harvey-muted">
              <Upload className="w-4 h-4" />
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-harvey-ivory">
              {uploading ? 'Parsing & Indexing Contract...' : isDragActive ? 'Release to upload' : 'Upload Agreement or Schedule'}
            </p>
            <p className="text-[11px] text-harvey-muted mt-0.5">
              PDF or DOCX · Legal vector indexing up to 50MB
            </p>
          </div>
          {!uploading && (
            <span className="btn-secondary text-[11px] py-1 px-3 mt-1">
              <FileText className="w-3 h-3 text-harvey-muted" />
              Select File
            </span>
          )}
        </div>
      </div>

      {/* Upload error */}
      {(uploadError || fileRejections.length > 0) && (
        <div className="flex items-start gap-2 bg-harvey-coral/10 border border-harvey-coral/30 rounded p-2.5">
          <AlertCircle className="w-4 h-4 text-harvey-coral mt-0.5 flex-shrink-0" />
          <p className="text-xs text-harvey-coral leading-tight">
            {uploadError || 'File rejected. Must be a valid PDF or DOCX file under 50MB.'}
          </p>
        </div>
      )}

      {/* Upload Status Card */}
      {uploadedFile && (
        <div className="flex items-center gap-3 bg-harvey-surface border border-harvey-border rounded p-3">
          {uploadedFile.status === 'processing' ? (
            <Loader2 className="w-4 h-4 text-harvey-ivory animate-spin flex-shrink-0" />
          ) : uploadedFile.status === 'ready' ? (
            <CheckCircle2 className="w-4 h-4 text-harvey-emerald flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-harvey-coral flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-harvey-ivory truncate">{uploadedFile.original_name}</p>
            <p className="text-[10px] text-harvey-muted">
              {uploadedFile.status === 'processing' && 'Chunking clauses & generating local embeddings...'}
              {uploadedFile.status === 'ready' && `${uploadedFile.page_count} Pages · ${uploadedFile.chunk_count} Chunks Indexed`}
              {uploadedFile.status === 'error' && 'Failed to parse document text.'}
            </p>
          </div>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-harvey-muted hover:text-harvey-ivory transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
