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
          'border border-dashed rounded-xl p-7 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-black bg-neutral-100'
            : 'border-neutral-300 hover:border-black bg-white hover:bg-neutral-50/70 shadow-xs',
          uploading && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2.5">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-black animate-spin" />
          ) : (
            <div className="w-9 h-9 rounded-full border border-canvas-border flex items-center justify-center bg-neutral-50 text-neutral-600">
              <Upload className="w-4 h-4" />
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-canvas-text">
              {uploading ? 'Parsing & Indexing Contract...' : isDragActive ? 'Release to upload' : 'Upload Agreement or Schedule'}
            </p>
            <p className="text-[11px] text-canvas-text-muted mt-0.5">
              PDF or DOCX · Local vector embeddings up to 50MB
            </p>
          </div>
          {!uploading && (
            <span className="btn-secondary text-[11px] py-1 px-3 mt-1 shadow-xs">
              <FileText className="w-3 h-3 text-neutral-500" />
              Select File
            </span>
          )}
        </div>
      </div>

      {/* Upload error */}
      {(uploadError || fileRejections.length > 0) && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700 leading-tight">
            {uploadError || 'File rejected. Must be a valid PDF or DOCX file under 50MB.'}
          </p>
        </div>
      )}

      {/* Upload Status Card */}
      {uploadedFile && (
        <div className="flex items-center gap-3 bg-white border border-canvas-border rounded-lg p-3 shadow-sm">
          {uploadedFile.status === 'processing' ? (
            <Loader2 className="w-4 h-4 text-black animate-spin flex-shrink-0" />
          ) : uploadedFile.status === 'ready' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-canvas-text truncate">{uploadedFile.original_name}</p>
            <p className="text-[10px] text-canvas-text-muted">
              {uploadedFile.status === 'processing' && 'Chunking clauses & generating local embeddings...'}
              {uploadedFile.status === 'ready' && `${uploadedFile.page_count} Pages · ${uploadedFile.chunk_count} Chunks Indexed`}
              {uploadedFile.status === 'error' && 'Failed to parse document text.'}
            </p>
          </div>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-neutral-400 hover:text-black transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
