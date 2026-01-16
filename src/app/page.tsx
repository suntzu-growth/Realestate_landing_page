"use client";

import { useState, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { Header } from "@/components/header";
import { SearchHero } from "@/components/search-hero";
import { SearchInput } from "@/components/search-input";
import { QuestionMarquee } from "@/components/question-marquee";
import { TopicSelector } from "@/components/topic-selector";
import { ResultsStream } from "@/components/results-stream";
import { Footer } from "@/components/footer";

interface Message {
  role: 'user' | 'assistant';
  content?: string;
  results?: any[];
  isStreaming?: boolean;
  directAnswer?: string;
  type?: string;
}

export default function Home() {
  const [hasSearched, setHasSearched] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAgentEnabled, setIsAgentEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Client Tools - ESTOS SON LOS QUE MUESTRAN LAS RESPUESTAS EN EL UI
  const clientTools = {
    displayTextResponse: async ({ text }: { text: string }) => {
      console.log('[Client Tool] displayTextResponse:', text);
      
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].isStreaming) {
          updated.pop();
        }
        return [...updated, {
          role: 'assistant',
          content: text,
          isStreaming: false,
        }];
      });
      
      setIsStreaming(false);
      return "success";
    },

    displayNewsResults: async ({ news, summary }: { news: any[], summary?: string }) => {
      console.log('[Client Tool] displayNewsResults:', news.length, 'noticias');
      
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].isStreaming) {
          updated.pop();
        }
        return [...updated, {
          role: 'assistant',
          results: news,
          content: summary,
          isStreaming: false,
          type: 'news',
        }];
      });
      
      setIsStreaming(false);
      return news.length;
    },

    displaySportsResults: async ({ news, summary }: { news: any[], summary?: string }) => {
      console.log('[Client Tool] displaySportsResults:', news.length, 'deportes');
      
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].isStreaming) {
          updated.pop();
        }
        return [...updated, {
          role: 'assistant',
          results: news,
          content: summary,
          isStreaming: false,
          type: 'sports',
        }];
      });
      
      setIsStreaming(false);
      return news.length;
    },

    displaySchedule: async ({ schedule, summary, type }: { schedule: any[], summary?: string, type?: string }) => {
      console.log('[Client Tool] displaySchedule:', schedule.length, 'programas');
      
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].isStreaming) {
          updated.pop();
        }
        return [...updated, {
          role: 'assistant',
          results: schedule,
          content: summary,
          isStreaming: false,
          type: type || 'schedule',
        }];
      });
      
      setIsStreaming(false);
      return schedule.length;
    },

    displayError: async ({ message }: { message: string }) => {
      console.log('[Client Tool] displayError:', message);
      
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].isStreaming) {
          updated.pop();
        }
        return [...updated, {
          role: 'assistant',
          content: `⚠️ ${message}`,
          isStreaming: false,
        }];
      });
      
      setIsStreaming(false);
      return message;
    },
  };

  // ElevenLabs Conversation con useConversation
  const conversation = useConversation({
    onConnect: () => {
      console.log('[Agent] Connected');
      setIsAgentEnabled(true);
    },
    onDisconnect: () => {
      console.log('[Agent] Disconnected');
      setIsAgentEnabled(false);
    },
    onMessage: (message: any) => {
      console.log('[Agent Message]:', message);
      
      // Filtrar mensajes idle
      const text = message.message || message.text || '';
      if (text) {
        const ignoredPhrases = ["estás ahí", "are you still there", "sigues ahí", "irabazi arte"];
        if (ignoredPhrases.some(phrase => text.toLowerCase().includes(phrase))) {
          console.log('[Agent] Mensaje ignorado (idle/genérico)');
          return;
        }
      }

      // Detectar fin de respuesta del agente
      if (message.type === 'agent_response_end' || message.is_final) {
        console.log('[Agent] Respuesta finalizada');
        setIsStreaming(false);
      }
    },
    onError: (error) => {
      console.error('[Agent Error]:', error);
      setIsStreaming(false);
      
      // Mostrar error al usuario
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].isStreaming) {
          updated.pop();
        }
        return [...updated, {
          role: 'assistant',
          content: '⚠️ Error conectando con el agente. Por favor intenta de nuevo.',
          isStreaming: false,
        }];
      });
    },
    clientTools, // IMPORTANTE: Registrar los client tools
  });

  // Auto-connect
  useEffect(() => {
    const connectAgent = async () => {
      try {
        const response = await fetch("/api/get-signed-url");
        if (!response.ok) throw new Error("Failed to get auth");
        const { signedUrl } = await response.json();

        await conversation.startSession({ signedUrl });
        conversation.setVolume({ volume: 0 }); // Silenciar audio
        
        console.log('[Agent] Session started (text-only)');
      } catch (err) {
        console.error("Failed to connect agent:", err);
        setIsAgentEnabled(false);
      }
    };

    const timer = setTimeout(connectAgent, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async (query?: string, isCategorySelection: boolean = false) => {
    if (!query) return;

    // Agregar mensaje del usuario
    const userMsg: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setHasSearched(true);
    setIsStreaming(true);

    // Agregar placeholder de "escribiendo..."
    setMessages(prev => [...prev, { role: 'assistant', isStreaming: true }]);

    // SOLO modo agente - SIN FALLBACK
    if (conversation.status === 'connected') {
      try {
        let prompt = query;
        
        // Si es selección de categoría, usar un prompt especial
        if (isCategorySelection) {
          prompt = `El usuario seleccionó la categoría: ${query}`;
        }

        console.log('[Enviando al agente]:', prompt);
        await conversation.sendUserMessage(prompt);
        
        // NO usar setTimeout - dejar que el agente responda cuando esté listo
        
      } catch (err) {
        console.error("Agent error:", err);
        setIsStreaming(false);
        
        // Remover placeholder en caso de error
        setMessages(prev => prev.slice(0, -1));
      }
    } else {
      // Si no está conectado, mostrar error
      console.error('[Agent] No conectado');
      setMessages(prev => {
        const updated = prev.slice(0, -1); // Remover placeholder
        return [...updated, {
          role: 'assistant',
          content: '⚠️ El agente no está conectado. Por favor recarga la página.',
          isStreaming: false,
        }];
      });
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-eitb-blue/20 selection:text-eitb-blue flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col relative pt-16">
        {/* Hero */}
        <div className={`transition-all duration-700 ease-in-out flex flex-col items-center w-full ${hasSearched ? "hidden" : "pt-12"}`}>
          <SearchHero />

          <div className="mb-4 h-6">
            {conversation.status === 'connected' && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                ● Agente Conectado
              </span>
            )}
            {conversation.status === 'connecting' && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                ○ Conectando...
              </span>
            )}
            {conversation.status === 'disconnected' && (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                ○ Desconectado
              </span>
            )}
          </div>

          <div className="w-full my-8">
            <QuestionMarquee onQuestionClick={(q) => handleSearch(q, false)} />
            <TopicSelector onSelect={(topic) => handleSearch(topic, true)} className="mt-8" />
          </div>

          <div className="w-full px-4 mb-12">
            <SearchInput onSearch={(q) => handleSearch(q, false)} />
          </div>
        </div>

        {/* Chat */}
        {hasSearched && (
          <div className="container mx-auto px-4 pb-32 flex flex-col space-y-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={`w-full ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                {msg.role === 'user' ? (
                  <div className="bg-gray-100 text-gray-800 px-6 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-lg">
                    {msg.content === 'noticias' ? 'Noticias' :
                      msg.content === 'deportes' ? 'Deportes' :
                        msg.content === 'television' ? 'Televisión' :
                          msg.content === 'radio' ? 'Radio' :
                            msg.content?.charAt(0).toUpperCase() + msg.content!.slice(1)}
                  </div>
                ) : (
                  <ResultsStream
                    isStreaming={!!msg.isStreaming}
                    results={msg.results}
                    directAnswer={msg.directAnswer || msg.content}
                    text={msg.content}
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Sticky Input */}
        {hasSearched && (
          <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 pb-8 z-50">
            <div className="container mx-auto max-w-3xl">
              <SearchInput onSearch={(q) => handleSearch(q, false)} />
            </div>
          </div>
        )}
      </main>

      {!hasSearched && <Footer />}
    </div>
  );
}