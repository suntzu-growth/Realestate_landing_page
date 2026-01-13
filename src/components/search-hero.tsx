export function SearchHero() {
    return (
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto py-12 md:pb-8 md:pt-20 space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-serif font-black text-gray-900 tracking-tight leading-tight">
                Tu guía de EITB.
                <br />
                Pregunta lo que quieras.
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-sans max-w-xl mx-auto leading-relaxed px-4">
                Esto es un <span className="font-bold text-gray-700">experimento</span> de EITB para usar IA y responder tus dudas sobre nuestra programación y contenidos. Las respuestas se basan en información pública de EITB. Verifica siempre la información en eitb.eus.
            </p>
        </div>
    );
}
