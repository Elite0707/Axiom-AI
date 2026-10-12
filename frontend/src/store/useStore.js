import { create } from 'zustand'
import { documentsApi, analysisApi } from '../lib/api'

export const useStore = create((set, get) => ({
  // Documents
  documents: [],
  selectedDocument: null,
  documentsLoading: false,

  fetchDocuments: async () => {
    set({ documentsLoading: true })
    try {
      const { data } = await documentsApi.list('ma')
      set({ documents: data, documentsLoading: false })
    } catch (e) {
      set({ documentsLoading: false })
    }
  },

  setSelectedDocument: (doc) => set({ selectedDocument: doc }),

  addDocument: (doc) => set((state) => ({
    documents: [doc, ...state.documents]
  })),

  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map(d => d.id === id ? { ...d, ...updates } : d),
    selectedDocument: state.selectedDocument?.id === id
      ? { ...state.selectedDocument, ...updates }
      : state.selectedDocument
  })),

  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter(d => d.id !== id),
    selectedDocument: state.selectedDocument?.id === id ? null : state.selectedDocument
  })),

  // Analysis
  analyses: {},  // keyed by document_id
  currentAnalysis: null,
  analysisPolling: null,

  startAnalysis: async (documentId) => {
    try {
      const { data } = await analysisApi.startMA(documentId)
      set({ currentAnalysis: data })

      // Poll for completion
      const intervalId = setInterval(async () => {
        try {
          const { data: updated } = await analysisApi.get(data.id)
          set({ currentAnalysis: updated })
          if (updated.status === 'done' || updated.status === 'error') {
            clearInterval(intervalId)
            set({ analysisPolling: null })
          }
        } catch (e) {
          clearInterval(intervalId)
        }
      }, 3000)

      set({ analysisPolling: intervalId })
      return data
    } catch (e) {
      throw e
    }
  },

  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

  // UI State
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
