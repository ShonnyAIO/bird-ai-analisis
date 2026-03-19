# 📄 Guía de Integración para Backend: Curaduría de Arte IA

Esta guía detalla cómo utilizar el proxy de IA para la clasificación automática de contenidos bajo la **Ley RESORTE-ME**.

## 🚀 Endpoint de Clasificación

Para obtener una respuesta JSON directa (no streaming), utilice el siguiente endpoint:

- **URL**: `https://tu-proxy-ai.vercel.app/classify`
- **Metodo**: `POST`
- **Headers**: `Content-Type: application/json`

---

## 🛠️ Estructura de la Petición

Se debe enviar un array de mensajes con un `system` prompt que defina las reglas y un `user` prompt con la descripción de la obra.

### Ejemplo de Body (JSON):

```json
{
  "messages": [
    {
      "role": "system",
      "content": "Rol: Eres un experto en curaduría de arte y cumplimiento legal de la Ley RESORTE-ME (Venezuela). Tarea: Analizar la obra de arte cargada y clasificarla.\n\nReglas de Clasificación:\n1. Tipo A (Apta): Contenido familiar. Si la obra es apta para niños, paisajes, retratos, sin desnudez ni violencia.\n2. Tipo B (Supervisada): Contenido que requiere madurez. Incluye desnudos artísticos parciales (no explícitos), violencia moderada o temas sociales complejos.\n3. Tipo C (Adultos): Erotismo explícito, desnudez total (+40% o genitales), violencia gráfica/gore o lenguaje ofensivo.\n\nIMPORTANTE: Aplica un enfoque de género inclusivo. No penalices el torso femenino (arte/lactancia) de forma más severa que el masculino bajo los mismos criterios de desnudez.\n\nDebes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:\n{\n  \"status\": \"APPROVED\" | \"FLAGGED\" | \"REJECTED\",\n  \"category\": \"A\" | \"B\" | \"C\",\n  \"confidence_score\": 0.0-1.0,\n  \"reasoning\": \"Breve explicación técnica\",\n  \"alert\": \"Mensaje de notificación interno\"\n}"
    },
    {
      "role": "user",
      "content": "Descripción de la obra: Retrato al óleo de una mujer amamantando en un entorno rural, estilo impresionista."
    }
  ]
}
```

---

## ✅ Estructura de la Respuesta

El proxy entregará un objeto JSON listo para ser procesado por el backend:

```json
{
  "status": "APPROVED",
  "category": "A",
  "confidence_score": 0.98,
  "reasoning": "La obra representa un acto natural de lactancia bajo un estilo artístico impresionista, lo cual se clasifica como contenido apto (Tipo A) según los criterios de género inclusivo.",
  "alert": "Contenido apto para todo público."
}
```

---

## 💡 Notas Técnicas

1. **Balanceo Automático**: Cada petición puede ser atendida por un proveedor distinto (Gemini, Groq, Cerebras, etc.) para asegurar disponibilidad, pero el contrato de respuesta JSON se mantiene idéntico.
2. **Robustez**: El endpoint `/classify` limpia automáticamente los bloques de código markdown (backticks) que suelen devolver algunas IAs.
3. **Manejo de Errores**: Si la IA no logra generar un JSON válido, el endpoint devolverá un objeto con `"status": "ERROR"` y el contenido original en el campo `"raw"`.
4. **Timeout**: Dependiendo del proveedor, la respuesta puede tardar entre 2 y 5 segundos.

## 📑 Documentación Interactiva (Swagger)

Puedes probar este endpoint y ver el esquema completo en:
`https://tu-proxy-ai.vercel.app/swagger`
