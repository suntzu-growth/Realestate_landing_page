export function SearchHero() {
    return (
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto py-8 md:pb-4 md:pt-12 space-y-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <img
                src="/suntzu_logo_centro.svg"
                alt="SunTzu"
                className="h-20 md:h-28 w-auto"
            />
            <p
                className="text-xl md:text-2xl max-w-xl mx-auto px-4"
                style={{
                    fontFamily: '"Inter", "Host Grotesk", sans-serif',
                    fontWeight: 300,
                    letterSpacing: '-0.01em',
                    lineHeight: '120%',
                    color: 'rgb(17, 89, 122)'
                }}
            >
                Bienvenido a la forma moderna de vivir. Sea dueño de su segunda residencia sin las complicaciones de la propiedad total y acceda a nuestra red de viviendas para elevar su experiencia vacacional.
            </p>
        </div>
    );
}

