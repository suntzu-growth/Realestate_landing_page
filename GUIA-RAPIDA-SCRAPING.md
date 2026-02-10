# 🚀 GUÍA RÁPIDA: Scraping Manual para Compartir AHORA

## ⚡ Opción 1: La Más Rápida (5 minutos)

### Paso 1: Instalar Dependencias
```bash
npm install cheerio
```

### Paso 2: Ejecutar el Script Todo-en-Uno
```bash
node scrape-ahora.js
```

### Paso 3: Esperar (2-5 minutos)
El script extraerá información de las propiedades de Vivla.com.

### Paso 4: Compartir con tus Compis
Los archivos estarán en `./data/scraping/`:
- `noticias-completas.json` - **Envía este** (contiene todo).
- `reporte-noticias.pdf` - (Si ejecutas el script de PDF).

---

## 📊 Opción 2: Formatos RAG y PDF (7 minutos)

### Paso 1: Preparar para RAG
```bash
node prepare-for-rag.js
```
Esto creará archivos en `./data/rag/` optimizados para bases de datos vectoriales.

### Paso 2: Generar Reporte PDF
```bash
npm install jspdf jspdf-autotable
node json-to-pdf.js
```
Esto creará un PDF profesional en `./data/scraping/reporte-noticias.pdf`.

---

## 📤 Cómo enviar los datos
1. **Slack/Email**: Adjunta `data/scraping/noticias-completas.json`.
2. **Drive**: Sube la carpeta `data/` completa.
3. **GitHub**: Haz push de los archivos generados.

---

## 💡 Tip
Si quieres que el Agente use estos datos en lugar de hacer scraping en tiempo real, asegúrate de que el Agente lea de `./data/scraping/noticias-completas.json`.
