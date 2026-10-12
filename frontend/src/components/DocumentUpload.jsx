import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, FilePlus, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { documentsApi } from '../lib/api'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

const MAX_SIZE = 50 * 1024 * 1024 // 50MB
const ACCEPTED = { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }

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

      // Poll until processing is done
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
      setUploadError(err.response?.data?.detail || 'Upload failed. Please try again.')
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
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-axiom-accent bg-axiom-accent/5 scale-[1.01]'
            : 'border-axiom-border hover:border-axiom-accent/50 hover:bg-axiom-card',
          uploading && 'opacity-60 cursor-not-allowed',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <Loader2 className="w-10 h-10 text-axiom-accent animate-spin" />
          ) : isDragActive ? (
            <FilePlus className="w-10 h-10 text-axiom-accent" />
          ) : (
            <Upload className="w-10 h-10 text-axiom-muted" />
          )}
          <div>
            <p className="text-sm font-medium text-axiom-text">
              {uploading ? 'Uploading & Indexing...' : isDragActive ? 'Drop your document here' : 'Upload M&A Document'}
            </p>
            <p className="text-xs text-axiom-muted mt-1">
              Drag & drop or click to browse · PDF, DOCX · Max 50MB
            </p>
          </div>
          {!uploading && (
            <span className="btn-secondary text-xs py-1.5">
              <FileText className="w-3.5 h-3.5" />
              Choose File
            </span>
          )}
        </div>
      </div>

      {/* Upload error */}
      {(uploadError || fileRejections.length > 0) && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-400">
            {uploadError || 'Invalid file. Please upload a PDF or DOCX file under 50MB.'}
          </p>
        </div>
      )}

      {/* Success state */}
      {uploadedFile && (
        <div className="flex items-center gap-3 bg-axiom-card border border-axiom-border rounded-lg px-3 py-2.5">
          {uploadedFile.status === 'processing' ? (
            <Loader2 className="w-4 h-4 text-axiom-accent animate-spin flex-shrink-0" />
          ) : uploadedFile.status === 'ready' ? (
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-axiom-text truncate">{uploadedFile.original_name}</p>
            <p className="text-xs text-axiom-muted">
              {uploadedFile.status === 'processing' && 'Extracting text & indexing document...'}
              {uploadedFile.status === 'ready' && `Ready · ${uploadedFile.page_count} pages · ${uploadedFile.chunk_count} chunks indexed`}
              {uploadedFile.status === 'error' && 'Processing failed. Please re-upload.'}
            </p>
          </div>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-axiom-muted hover:text-axiom-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
