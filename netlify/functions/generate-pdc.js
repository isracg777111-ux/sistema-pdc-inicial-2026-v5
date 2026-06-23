exports.handler = async (event, context) => {
    // Solo permitir peticiones POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const body = JSON.parse(event.body);
        const promptText = body.prompt;

        if (!promptText) {
            return { statusCode: 400, body: JSON.stringify({ error: "No prompt provided" }) };
        }

        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "GEMINI_API_KEY no está configurada como variable de entorno en Netlify." }),
            };
        }

        // Realizamos la solicitud a la API de Gemini (Node 18+ soporta fetch nativo)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return { statusCode: response.status, body: JSON.stringify({ error: "Gemini API error", details: errText }) };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message })
        };
    }
};
