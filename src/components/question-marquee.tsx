import { cn } from "@/lib/utils";

// ✅ HABILITADAS: Solo noticias y deportes
const QUESTIONS_ROW_1 = [
    "Últimas noticias de EITB Media", // ✅ Noticias
    "Resultados del Athletic Club ayer", // ✅ Deportes
    "¿Qué pasa en el País Vasco?", // ✅ Noticias
    "¿Cómo va la Real Sociedad?", // ✅ Deportes
    "Noticias de actualidad", // ✅ Noticias
];

const QUESTIONS_ROW_2 = [
    "Dame las últimas noticias", // ✅ Noticias
    "Resultados de pelota mano", // ✅ Deportes
    "¿Cuándo juega el Alavés?", // ✅ Deportes
    "Actualidad del País Vasco", // ✅ Noticias
    "Noticias del Baskonia", // ✅ Deportes
];

// ❌ DESHABILITADAS (comentadas):
// "¿Cuándo empieza El Conquis 2025?" - TV
// "Ver Go!azen temporada 10 online" - TV
// "¿Qué tiempo hace mañana en Donostia?" - Fuera de scope
// "Programación ETB2 para esta noche" - TV
// "Escuchar Radio Euskadi en directo" - Radio
// "Receta de merluza de Karlos Arguiñano" - Fuera de scope
// "¿Dónde ver la serie Itxaso?" - TV
// "Ver teleberri a la carta" - TV
// "Estrenos de Primeran" - TV

export function QuestionMarquee({ onQuestionClick }: { onQuestionClick?: (question: string) => void }) {
    return (
        <div className="w-full overflow-hidden space-y-4 py-8 pointer-events-none select-none relative z-0">
            {/* Masks for fade effect at edges */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>

            {/* Row 1 */}
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] space-x-4">
                {[...QUESTIONS_ROW_1, ...QUESTIONS_ROW_1].map((q, i) => (
                    <div
                        key={i}
                        onClick={() => onQuestionClick?.(q)}
                        className="flex items-center px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm text-gray-600 font-medium whitespace-nowrap text-sm md:text-base cursor-pointer hover:bg-white hover:shadow-md hover:text-eitb-blue transition-all pointer-events-auto active:scale-95"
                    >
                        {q}
                    </div>
                ))}
            </div>

            {/* Row 2 */}
            <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused] space-x-4">
                {[...QUESTIONS_ROW_2, ...QUESTIONS_ROW_2].map((q, i) => (
                    <div
                        key={i}
                        onClick={() => onQuestionClick?.(q)}
                        className="flex items-center px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm text-gray-600 font-medium whitespace-nowrap text-sm md:text-base cursor-pointer hover:bg-white hover:shadow-md hover:text-eitb-blue transition-all pointer-events-auto active:scale-95"
                    >
                        {q}
                    </div>
                ))}
            </div>
        </div>
    );
}