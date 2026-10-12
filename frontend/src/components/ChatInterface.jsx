import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Trash2, ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { chatApi } from '../lib/api'
import clsx from 'clsx'

const SUGGESTED_QUESTIONS = [
  "Who are the parties in this agreement?",
  "What is the deal value and payment structure?",
  "What are the conditions precedent for closing?",
  "Summarize the representations and warranties.",
  "What are the indemnification obligations?",
  "Are there any MAC clauses? What triggers them?",
  "What are the termination rights of each party?",
  "What non-compete obligations apply post-closing?",
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
        content: `⚠️ Error: ${err.response?.data?.detail || 'Failed to get response. Please try again.'}`,
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
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-axiom-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-axiom-accent" />
          <span className="text-sm font-semibold text-axiom-text">Ask Axiom AI</span>
          {documentName && (
            <span className="text-xs text-axiom-muted truncate max-w-48">· {documentName}</span>
          )}
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-danger py-1 px-2 text-xs">
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center py-6">
              <Bot className="w-10 h-10 text-axiom-accent mx-auto mb-3" />
              <p className="text-sm font-medium text-axiom-text">Ask anything about this document</p>
              <p className="text-xs text-axiom-muted mt-1">Powered by RAG — answers are grounded in the document</p>
            </div>
            <div>
              <p className="section-title mb-3">Suggested Questions</p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-left text-xs text-axiom-textDim bg-axiom-card hover:bg-axiom-border 
                              border border-axiom-border hover:border-axiom-accent/30 
                              px-3 py-2 rounded-lg transition-all duration-200 hover:text-axiom-text"
                  >
                    {q}
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
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                msg.role === 'user'
                  ? 'bg-axiom-accent/20 text-axiom-accent'
                  : msg.isError
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-axiom-card border border-axiom-border text-axiom-accent'
              )}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Bubble */}
              <div className={clsx(
                'max-w-[85%] rounded-xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-axiom-accent text-white rounded-tr-sm'
                  : msg.isError
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm'
                    : 'bg-axiom-card border border-axiom-border text-axiom-text rounded-tl-sm'
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-axiom-card border border-axiom-border text-axiom-accent flex-shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-axiom-card border border-axiom-border rounded-xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-axiom-muted">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs">Analyzing document...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Source excerpts */}
      {sources.length > 0 && (
        <div className="px-4 py-2 border-t border-axiom-border">
          <details className="group">
            <summary className="text-xs text-axiom-muted cursor-pointer hover:text-axiom-text flex items-center gap-1">
              <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
              {sources.length} source excerpts used
            </summary>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {sources.map((src, i) => (
                <div key={i} className="text-[10px] text-axiom-muted bg-axiom-card border border-axiom-border rounded px-2 py-1.5 leading-relaxed">
                  {src}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-axiom-border flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this M&A document..."
            rows={1}
            disabled={loading}
            className="input resize-none min-h-[40px] max-h-32 py-2.5 text-sm leading-relaxed"
            style={{ height: 'auto' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-primary px-3 self-end flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-axiom-muted mt-1.5">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
