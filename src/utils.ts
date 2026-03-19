import type { ChatMessage } from './types';

/**
 * Expresión regular mejorada para detectar URLs de imágenes, 
 * incluyendo extensiones como .blob de Supabase.
 */
export const IMAGE_REGEX = /https?:\/\/\S+\.(?:png|jpg|jpeg|webp|gif|blob)(?:\?\S*)?/gi;

/**
 * Descarga una imagen desde una URL y la convierte en un Data URI con Base64.
 */
async function imageUrlToBase64(url: string): Promise<string> {
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
 * Procesa los mensajes para convertir URLs de imágenes en Base64
 * compatible con la mayoría de proveedores de visión.
 */
export async function prepareVisionMessages(messages: ChatMessage[]): Promise<any[]> {
    return Promise.all(messages.map(async (m) => {
        const imageUrls = m.content.match(IMAGE_REGEX);

        if (imageUrls && imageUrls.length > 0) {
            const contentParts: any[] = [{ type: 'text', text: m.content }];

            for (const url of imageUrls) {
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
