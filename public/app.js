document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const uploadContent = document.getElementById('upload-content');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image');
    const identifyBtn = document.getElementById('identify-btn');
    const customPromptInput = document.getElementById('custom-prompt');
    const resultSection = document.getElementById('result-section');
    const responseContent = document.getElementById('response-content');
    const loading = document.getElementById('loading');

    let base64Image = null;

    const defaultPrompt = 'Eres un experto ornitólogo. Tu tarea es identificar el ave en la imagen, proporcionar su nombre científico, nombre común y contar una historia o datos interesantes sobre su origen, comportamiento y hábitat.';
    const defaultUserPrompt = 'Identifica esta ave y cuéntame su historia.';

    // Abrir selector de archivos al hacer clic en el área
    dropArea.addEventListener('click', () => {
        if (!base64Image) fileInput.click();
    });

    // Manejar selección de archivos
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    // Drag & Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
    });

    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) handleFile(file);
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, sube una imagen válida.');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            base64Image = reader.result;
            imagePreview.src = base64Image;
            uploadContent.style.display = 'none';
            previewContainer.style.display = 'block';
            identifyBtn.disabled = false;
        };
    }

    // Quitar imagen
    removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        base64Image = null;
        imagePreview.src = '';
        fileInput.value = '';
        uploadContent.style.display = 'block';
        previewContainer.style.display = 'none';
        identifyBtn.disabled = true;
        resultSection.style.display = 'none';
        responseContent.innerText = '';
        customPromptInput.value = '';
    });

    // Identificar Ave / Procesar Imagen
    identifyBtn.addEventListener('click', async () => {
        if (!base64Image) return;

        const userPrompt = customPromptInput.value.trim() || defaultUserPrompt;

        resultSection.style.display = 'block';
        responseContent.innerText = '';
        loading.style.display = 'block';
        identifyBtn.disabled = true;

        const messages = [
            {
                role: 'system',
                content: customPromptInput.value.trim() ? 'Eres un asistente de IA experto en visión y análisis de imágenes.' : defaultPrompt
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: userPrompt },
                    { type: 'image_url', image_url: { url: base64Image } }
                ]
            }
        ];

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) throw new Error('Error al conectar con el servidor.');

            loading.style.display = 'none';

            // Manejar streaming
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                responseContent.innerText += chunk;
                // Scroll al final
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }

        } catch (error) {
            console.error('Error:', error);
            responseContent.innerText = `Error: ${error.message}`;
            loading.style.display = 'none';
        } finally {
            identifyBtn.disabled = false;
        }
    });
});
