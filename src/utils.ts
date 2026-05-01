import type { ChatMessage } from './types.js';

/**
 * Expresión regular mejorada para detectar URLs de imágenes, 
 * incluyendo extensiones como .blob de Supabase.
 */
export const IMAGE_REGEX = /https?:\/\/\S+\.(?:png|jpg|jpeg|webp|gif|blob|svg)(?:\?\S*)?/gi;

/**
 * Expresión regular para detectar Data URIs (Base64)
 */
export const DATA_URI_REGEX = /data:image\/(?:png|jpg|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+/gi;

/**
 * Descarga una imagen desde una URL y la convierte en un Data URI con Base64.
 */
async function imageUrlToBase64(url: string): Promise<string> {
    if (url.startsWith('data:')) return url;
    
    try {
        console.log(`[Utils] Descargando imagen: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error al descargar: ${response.statusText}`);

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return `data:${contentType};base64,${base64}`;
    } catch (error) {
        console.error(`[Utils] Error procesando imagen ${url}:`, error);
        return url; // Si falla, devolvemos la URL original como respaldo
    }
}

/**
 * Procesa los mensajes para convertir URLs de imágenes y Data URIs en el formato
 * compatible con la mayoría de proveedores de visión.
 */
export async function prepareVisionMessages(messages: ChatMessage[]): Promise<any[]> {
    return Promise.all(messages.map(async (m) => {
        if (typeof m.content !== 'string') {
            // Ya está en formato multi-parte, procesamos cada parte
            const processedParts = await Promise.all(m.content.map(async (part) => {
                if (part.type === 'image_url' && part.image_url) {
                    const base64 = await imageUrlToBase64(part.image_url.url);
                    return {
                        type: 'image_url',
                        image_url: { url: base64 }
                    };
                }
                return part;
            }));
            return { role: m.role, content: processedParts };
        }

        const imageUrls = m.content.match(IMAGE_REGEX) || [];
        const dataUris = m.content.match(DATA_URI_REGEX) || [];
        
        const allImages = [...imageUrls, ...dataUris];

        if (allImages.length > 0) {
            // Limpiamos el texto de las imágenes si son Data URIs largos para no saturar el prompt
            let cleanText = m.content;
            for (const uri of dataUris) {
                if (uri.length > 100) {
                    cleanText = cleanText.replace(uri, '[Imagen adjunta]');
                }
            }

            const contentParts: any[] = [{ type: 'text', text: cleanText }];

            for (const url of allImages) {
                const base64 = await imageUrlToBase64(url);
                contentParts.push({
                    type: 'image_url',
                    image_url: { url: base64 }
                });
            }

            return { role: m.role, content: contentParts };
        }

        return m;
    }));
}
