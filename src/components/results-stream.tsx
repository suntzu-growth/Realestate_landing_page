"use client";
import { useEffect, useState } from "react";

export function ResultsStream({ isStreaming, results, text, directAnswer }: any) {
    const [displayedText, setDisplayedText] = useState(text || "");
    const [isFinished, setIsFinished] = useState(!isStreaming);

    useEffect(() => {
        setDisplayedText(text || directAnswer || "");
        setIsFinished(!isStreaming);
    }, [isStreaming, text, directAnswer]);

    if (!isStreaming && !displayedText && (!results || results.length === 0)) return null;

    return (
        <div className="w-full max-w-2xl mx-auto mt-6 space-y-6 animate-in fade-in duration-500">
            <div className="prose prose-lg font-serif text-gray-800 leading-relaxed whitespace-pre-wrap">
                {displayedText === "Consultando..." ? <span className="text-gray-400 italic">Analizando prensa...</span> : displayedText}
                {isStreaming && <span className="inline-block w-2 h-5 ml-1 bg-blue-600 animate-pulse" />}
            </div>

            {isFinished && results && results.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    {results.map((item: any, idx: number) => (
                        <a key={idx} href={item.url} target="_blank" rel="noreferrer"
                           className="group flex flex-col md:flex-row bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                            {item.image && (
                                <div className="md:w-36 h-32 flex-shrink-0">
                                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                                </div>
                            )}
                            <div className="p-4 flex-1">
                                <span className="text-[10px] font-bold text-blue-600 uppercase">Orain.eus</span>
                                <h3 className="font-serif font-bold text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-tight mt-1">{item.title}</h3>
                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.summary}</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}