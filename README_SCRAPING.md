# EITB Answers - Daily Scraping & RAG System

Este proyecto incluye ahora un sistema avanzado de scraping diario y preparación de datos para RAG (Retrieval-Augmented Generation).

## 🚀 Inicio Rápido

### Scraping Manual
Para obtener todas las noticias actuales inmediatamente:
```bash
node scrape-ahora.js
```

### Preparación para RAG
Para transformar los datos en formatos listos para IA:
```bash
node prepare-for-rag.js
```

## 📁 Estructura de Archivos del Sistema

| Archivo | Descripción |
|---------|-------------|
| `run-scraper.js` | Script principal de scraping (Vivla) |
| `scrape-ahora.js` | Script de ejecución rápida |
| `prepare-for-rag.js` | Conversor de datos a formatos LangChain, CSV, etc. |
| `json-to-pdf.js` | Generador de reportes en PDF |
| `scraper-completo.ts` | Clase TypeScript reutilizable para el API |
| `src/app/api/scraping/daily/route.ts` | Endpoint para automatización diaria |

## 📊 Datos Generados
Los datos se guardan en la carpeta `./data/`:
- `data/scraping/noticias-completas.json`: La base de conocimiento principal.
- `data/rag/`: Archivos formateados para bases de datos vectoriales.

## 🛠 Instalación de Dependencias
Asegúrate de tener instaladas las librerías necesarias:
```bash
npm install cheerio jspdf jspdf-autotable
```

## 🤖 Integración con el Agente
Consulta el archivo `INTEGRACION.md` para ver cómo conectar esta base de datos con tus herramientas de ElevenLabs.
