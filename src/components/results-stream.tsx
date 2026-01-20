"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MediaCard } from "./media-card";
import { Program } from "@/lib/schedule-parser";

interface ResultsStreamProps {
    isStreaming: boolean;
    results?: any[]; // Cambiado a any para soportar tanto Program como News
    directAnswer?: string;
    text?: string; 
}

export function ResultsStream({ isStreaming, results, directAnswer, text }: ResultsStreamProps) {
    const [displayedText, setDisplayedText] = useState(text || "");
    const [isFinished, setIsFinished] = useState(!isStreaming);

    let fullText = text || `EITB (Euskal Irrati Telebista) es el grupo de comunicación público del País Vasco...`;

    if (!text) {
        if (directAnswer) {
            fullText = directAnswer;
        } else if (results && results.length > 0) {
            fullText = `He encontrado ${results.length} coincidencias en la programación de EITB:\n\n`;
        }
    }

    useEffect(() => {
        if (isStreaming) {
            setIsFinished(false);
            if (!text) {
                let i = 0;
                const interval = setInterval(() => {
                    setDisplayedText(fullText.slice(0, i));
                    i++;
                    if (i > fullText.length) {
                        clearInterval(interval);
                        setIsFinished(true);
                    }
                }, 10);
                return () => clearInterval(interval);
            } else {
                setDisplayedText(text);
            }
        } else {
            setDisplayedText(text || fullText);
            setIsFinished(true);
        }
    }, [isStreaming, fullText, text]);

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="prose prose-lg prose-gray max-w-none">
                <div className="font-serif text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
                    {displayedText}
                    {isStreaming && <span className="inline-block w-2 h-5 ml-1 align-middle bg-eitb-blue animate-pulse" />}
                </div>
            </div>

            {/* Listado de Resultados - Mantenemos tu diseño pero añadimos el link */}
            {isFinished && results && results.length > 0 && (
                <div className="grid gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {results.slice(0, 5).map((item, idx) => (
                        <a 
                            key={idx} 
                            href={item.url || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex justify-between items-center group"
                        >
                            <div>
                                <div className="text-sm font-bold text-eitb-blue">{item.channel || item.source || 'EITB'}</div>
                                <div className="font-serif font-medium text-gray-900 group-hover:text-eitb-blue">{item.title}</div>
                                <div className="text-xs text-gray-500 mt-1">{item.day || item.publishedAt || 'Hoy'}</div>
                            </div>
                            <div className="text-lg font-bold text-gray-700 font-mono bg-gray-50 px-3 py-1 rounded group-hover:bg-blue-50">
                                {item.time || (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                )}
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {/* Footer con Feedback original */}
            {isFinished && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-green-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" /></svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" /></svg>
                        </button>
                    </div>
                    <div className="text-right">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Iturriak / Fuentes</h4>
                        <div className="flex gap-2 justify-end">
                            <span className="text-xs text-eitb-blue bg-blue-50 px-2 py-1 rounded border border-blue-100">Orain.eus</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}