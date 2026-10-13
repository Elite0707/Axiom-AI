import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Bot, User, Loader2, Trash2, ChevronDown, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { chatApi } from '../lib/api'
import clsx from 'clsx'

const SUGGESTED_QUESTIONS = [
  "Who are the key parties and what is their role?",
  "What is the total purchase price and adjustment mechanism?",
  "Summarize all Conditions Precedent required for closing.",
  "Are there any Material Adverse Change (MAC) carve-outs?",
  "What are the indemnification caps and time limitations?",
  "What non-compete covenants bind the sellers post-closing?",
  "Under what circumstances can either party terminate?",
]

export default function ChatInterface({ documentId, documentName }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sources, setSources] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMsg = { role: 'user', content: messageText, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setSources([])

    try {
      const { data } = await chatApi.send({
        document_id: documentId,
        message: messageText,
        session_id: sessionId,
      })
      setSessionId(data.session_id)
      setSources(data.sources || [])
      const assistantMsg = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      const errMsg = {
        role: 'assistant',
        content: `Unable to process query: ${err.response?.data?.detail || 'Verify your local Ollama connection.'}`,
        timestamp: new Date().toISOString(),
        isError: true,
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = async () => {
    if (sessionId) {
      await chatApi.clear(sessionId).catch(() => {})
    }
    setMessages([])
    setSessionId(null)
    setSources([])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-harvey-charcoal font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-harvey-border flex-shrink-0 bg-harvey-surface/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-harvey-gold" />
          <span className="font-serif text-sm font-normal text-harvey-ivory">Legal Research Assistant</span>
          {documentName && (
            <span className="text-[11px] text-harvey-muted truncate max-w-64 font-mono">
              / {documentName}
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-ghost text-[11px] py-1 px-2">
            <Trash2 className="w-3 h-3" />
            Clear Canvas
          </button>
        )}
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="max-w-xl mx-auto py-8 space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h3 className="font-serif text-lg text-harvey-ivory font-normal">
                Query this Agreement with Legal Precision
              </h3>
              <p className="text-xs text-harvey-muted max-w-md mx-auto">
                Responses are strictly grounded in indexed contract clauses with direct source citations.
              </p>
            </div>

            <div className="space-y-2">
              <p className="section-title text-center mb-3">Precedent Research Prompts</p>
              <div className="grid grid-cols-1 gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-left text-xs text-harvey-textDim hover:text-harvey-ivory 
                              bg-harvey-surface hover:bg-harvey-card border border-harvey-borderSubtle 
                              hover:border-harvey-border px-3.5 py-2.5 rounded transition-all duration-150 flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <span className="text-harvey-muted group-hover:text-harvey-ivory group-hover:translate-x-0.5 transition-all text-xs">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={clsx(
                'flex gap-3 animate-slide-up',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded border border-harvey-border flex items-center justify-center bg-harvey-surface flex-shrink-0 mt-1">
                  <span className="font-serif text-[11px] text-harvey-ivory">A</span>
                </div>
              )}

              <div className={clsx(
                'max-w-[85%] rounded p-4 text-xs leading-relaxed',
                msg.role === 'user'
                  ? 'bg-harvey-surface border border-harvey-border text-harvey-ivory'
                  : msg.isError
                    ? 'bg-harvey-coral/10 border border-harvey-coral/30 text-harvey-coral'
                    : 'bg-harvey-obsidian border border-harvey-border text-harvey-cream'
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-xs max-w-none space-y-2">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded border border-harvey-border flex items-center justify-center bg-harvey-charcoal flex-shrink-0 mt-1">
                  <User className="w-3 h-3 text-harvey-muted" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading status */}
        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-6 h-6 rounded border border-harvey-border flex items-center justify-center bg-harvey-surface flex-shrink-0">
              <span className="font-serif text-[11px] text-harvey-ivory">A</span>
            </div>
            <div className="bg-harvey-obsidian border border-harvey-border rounded px-4 py-3 flex items-center gap-2 text-xs text-harvey-muted">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-harvey-ivory" />
              <span>Synthesizing legal analysis from indexed clauses...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sources Accordion */}
      {sources.length > 0 && (
        <div className="px-5 py-2 border-t border-harvey-border bg-harvey-surface/50">
          <details className="group">
            <summary className="text-[11px] text-harvey-muted cursor-pointer hover:text-harvey-ivory flex items-center gap-1.5 select-none">
              <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
              <span>{sources.length} Verified Citations & Clause Excerpts</span>
            </summary>
            <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {sources.map((src, i) => (
                <div key={i} className="text-[10px] text-harvey-muted bg-harvey-obsidian border border-harvey-borderSubtle rounded p-2 font-mono leading-relaxed">
                  {src}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Input Field */}
      <div className="p-4 border-t border-harvey-border bg-harvey-surface/30 flex-shrink-0">
        <div className="flex items-center gap-2 bg-harvey-obsidian border border-harvey-border rounded px-3 py-1.5 focus-within:border-harvey-ivory/60 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this agreement..."
            rows={1}
            disabled={loading}
            className="w-full bg-transparent text-xs text-harvey-ivory placeholder:text-harvey-muted/60 focus:outline-none resize-none py-1.5 leading-relaxed"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-primary p-1.5 h-7 w-7 rounded flex-shrink-0 disabled:opacity-20"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-[10px] text-harvey-muted/70 text-right mt-1.5">
          Enter to submit · Shift + Enter for newline
        </p>
      </div>
    </div>
  )
}
