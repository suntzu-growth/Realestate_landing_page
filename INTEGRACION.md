# GUÍA DE INTEGRACIÓN RAG

Esta guía explica cómo integrar los datos escrapeados diariamente en tu agente de ElevenLabs o cualquier sistema de IA.

## 1. Flujo de Trabajo
1. **Scraping Diario**: El cron job ejecuta `run-scraper.js`.
2. **Actualización de Conocimiento**: Los archivos JSON en `./data/scraping/` se actualizan.
3. **Consulta del Agente**: El agente, en lugar de navegar por la web en cada pregunta, consulta primero estos archivos locales.

## 2. Modificación de los Endpoints Actuales
En tus herramientas (`get-news`, `get-sports-news`), puedes añadir una lógica de "Local First":

```typescript
// Ejemplo de lógica "Local First"
const localDataPath = path.join(process.cwd(), 'data', 'scraping', 'noticias-completas.json');

if (fs.existsSync(localDataPath)) {
  const localData = JSON.parse(fs.readFileSync(localDataPath, 'utf8'));
  // Buscar en localData antes de hacer fetch externo
  const relevantItems = buscarEnLocal(localData, category);
  if (relevantItems.length > 0) return NextResponse.json({ news: relevantItems });
}

// Si no hay en local o es antiguo, hacer el scraping original...
```

## 3. Uso con Bases de Datos Vectoriales
Si decides usar una base de datos vectorial (como Pinecone, Weaviate o Supabase Vector):

1. Utiliza `prepare-for-rag.js` para obtener los documentos particionados (chunks).
2. Sube estos chunks a tu base de datos vectorial generando embeddings.
3. En la herramienta del agente, realiza una "Similarity Search" en la DB vectorial en lugar de un scraping web.

## 4. Ventajas
- **Velocidad**: Respuesta instantánea (ms vs segundos de scraping).
- **Consistencia**: Todos los agentes tienen la misma base de datos.
- **Ahorro**: Menos peticiones a los servidores de EITB (menos riesgo de bloqueo).
