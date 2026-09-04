import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ShieldCheck, HelpCircle, UploadCloud } from 'lucide-react';
import { ChatMessage, StudyDocument, NovaState } from '../../types';
import { getAIService } from '../../lib/ai/aiService';
import { RAGService } from '../../lib/services/ragService';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { NOVAOrb } from '../ai/NOVAOrb';
import { StorageService } from '../../lib/storage/db';

interface AskNOVAChatProps {
  documents: StudyDocument[];
  onNavigate: (tab: string) => void;
}

export const AskNOVAChat: React.FC<AskNOVAChatProps> = ({ documents, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => StorageService.getChatMessages());
  const [input, setInput] = useState('');
  const [novaState, setNovaState] = useState<NovaState>('IDLE');
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages when storage/demo state updates
  useEffect(() => {
    setMessages(StorageService.getChatMessages());
  }, [documents]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, novaState]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || novaState !== 'IDLE') return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    StorageService.saveChatMessage(userMsg);
    setInput('');
    setNovaState('THINKING');

    try {
      const aiService = getAIService();
      const docsToUse = selectedDocId === 'all' ? documents : documents.filter((d) => d.id === selectedDocId);

      // Perform RAG vector / chunk search across uploaded document text
      const { citations } = await RAGService.searchRelevantChunks(userText, docsToUse);

      const reply = await aiService.answerGroundedQuestion(userText, docsToUse);

      const novaMsg: ChatMessage = {
        id: `msg-nova-${Date.now()}`,
        sender: 'nova',
        text: reply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: citations.length > 0 ? citations : reply.citations,
        isFallback: reply.isFallback
      };

      setMessages((prev) => [...prev, novaMsg]);
      StorageService.saveChatMessage(novaMsg);
      setNovaState('SUCCESS');
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setNovaState('IDLE'), 1200);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            Ask NOVA — Grounded Doubt Solver
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ask any question. Answers are grounded directly in your uploaded syllabus and notes with citations.
          </p>
        </div>

        {/* Document Filter */}
        {documents.length > 0 && (
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">📚 All Uploaded Documents ({documents.length})</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                📄 {d.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* CHAT CONTAINER */}
      <GlassCard glowOnHover={false} className="border-cyan-500/30 flex-1 flex flex-col p-0 overflow-hidden bg-slate-950/80">
        {/* Top chat banner */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <NOVAOrb size="sm" state={novaState} />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                NOVA AI Agent
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {documents.length > 0 ? 'Document Grounded' : 'General Knowledge Mode'}
                </span>
              </h3>
              <p className="text-[11px] text-cyan-400 font-medium">
                {documents.length > 0 ? `${documents.length} Study Documents Connected` : 'Upload notes for page-level citations'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Zero Hallucination Guard</span>
          </div>
        </div>

        {/* Messages scroll area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <NOVAOrb size="lg" state="IDLE" />
              <h4 className="text-lg font-bold text-white mt-4">Ask NOVA anything about your studies</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                {documents.length > 0
                  ? 'NOVA is ready to search your uploaded documents and answer your doubts with exact page citations.'
                  : 'Upload your syllabus or lecture notes to enable page-level citations.'}
              </p>
              {documents.length === 0 && (
                <Button variant="primary" size="sm" icon={<UploadCloud className="w-4 h-4" />} onClick={() => onNavigate('upload')}>
                  Upload Study Material
                </Button>
              )}
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {!isUser && (
                    <div className="flex-shrink-0 mt-1">
                      <NOVAOrb size="sm" state="IDLE" />
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-none shadow-lg shadow-cyan-500/20'
                        : 'glass-card border-slate-800 text-slate-200 rounded-tl-none bg-slate-900/90'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Fallback Notice if answer wasn't in docs */}
                    {msg.isFallback && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>Notice: Could not find exact text in uploaded docs. Showing general explanation.</span>
                      </div>
                    )}

                    {/* Document Source Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
                          Verified Document Citations
                        </span>
                        {msg.citations.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs text-slate-300"
                          >
                            <div className="flex items-center justify-between font-bold text-cyan-300 mb-1">
                              <span>📄 {c.docName}</span>
                              <span>{c.page}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 italic">"{c.snippet}"</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 block text-right mt-2">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })
          )}

          {novaState === 'THINKING' && (
            <div className="flex gap-3 max-w-xl mr-auto items-center">
              <NOVAOrb size="sm" state="THINKING" />
              <div className="p-3 rounded-2xl glass-card border-cyan-500/40 text-xs font-semibold text-cyan-300 animate-pulse">
                NOVA is reading syllabus notes and formulating grounded answer...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center gap-3 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={documents.length > 0 ? "Ask anything about your uploaded study material..." : "Ask NOVA a doubt..."}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!input.trim() || novaState !== 'IDLE'}
            icon={<Send className="w-4 h-4" />}
          >
            Ask NOVA
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};
