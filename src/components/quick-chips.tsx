import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
    "¿Qué echan hoy en ETB1?",
    "Recomiéndame una serie de humor",
    "¿Dónde ver Irabazi Arte?",
    "Resultados del Athletic",
    "El tiempo en Bilbao",
];

export function QuickChips() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-200">
            {SUGGESTIONS.map((suggestion, index) => (
                <Button
                    key={index}
                    variant="secondary"
                    className="rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-1 h-auto text-sm transition-transform hover:scale-105"
                >
                    {suggestion}
                </Button>
            ))}
        </div>
    );
}
