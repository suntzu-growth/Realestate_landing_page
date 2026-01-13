"use client";

import { cn } from "@/lib/utils";

const TOPICS = [
    { id: "cultura", label: "🏛️ Cultura Vasca", query: "Cultura y eventos en Euskadi" },
    { id: "deportes", label: "⚽ Deportes", query: "Resultados deportivos EITB" },
    { id: "noticias", label: "📰 Noticias", query: "Últimas noticias EITB" },
    { id: "euskera", label: "🗣️ Euskera", query: "Aprender y practicar Euskera" },
    { id: "planes", label: "📅 Planes", query: "Planes para el fin de semana" },
];

interface TopicSelectorProps {
    onSelect: (topic: string) => void;
    className?: string;
}

export function TopicSelector({ onSelect, className }: TopicSelectorProps) {
    return (
        <div className={cn("flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200", className)}>
            {TOPICS.map((topic) => (
                <button
                    key={topic.id}
                    onClick={() => onSelect(topic.query)}
                    className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-eitb-blue hover:text-eitb-blue hover:bg-blue-50 transition-all shadow-sm"
                >
                    {topic.label}
                </button>
            ))}
        </div>
    );
}
