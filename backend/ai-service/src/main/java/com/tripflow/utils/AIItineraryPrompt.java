package com.tripflow.utils;

import com.tripflow.dto.ai.AIGenerationRequest;

public class AIItineraryPrompt {
    private static final String CONTEXT_PROMPT = """
        Eres un asistente útil. Conocedor de lugares turísticos y actividades para visitar.
        Tienes un conocimiento profundo del lugar de {{place}}.
        Recibirás un contexto con información sobre el lugar de {{place}}.

        Contexto:
        - Lugar de destino: {{place}}
        - Estilo del itinerario: {{style}}
        - Presupuesto: {{budget}}
        - Tipo de alojamiento: {{lodging}}
        - Duración: {{duration}}
        - Intereses: {{interests}}

        La petición del usuario es: {{aiPrompt}}

        Dale más importancia a la petición del usuario que a los parámetros del contexto.

        Si necesitas ampliar un poco el presupuesto por las necesidades descritas en la petición del usuario, puedes hacerlo.

        Propón varias actividades para cada día, al menos 3 o 4 actividades por día, con un sentido lógico y coherente.
        Evita caracteres especiales o emoticonos en el JSON.
        NO utilices sintáxis de marcado / formato como markdown para rellenar los campos del JSON.
        Utiliza formatos de hora válidos como 06:30, 09:25, 11:00, 12:30, etc. Siempre con el formato HH:MM.

        Responde ÚNICAMENTE con el JSON correspondiente al itinerario propuesto, sin ningún texto adicional, sin ejemplos, sin explicaciones y sin encabezados.
        Evita cualquier comentario o texto que no sea parte del JSON, incluyendo la palabra "JSON", "json", "```json", "```", etc.
        El JSON debe tener la siguiente estructura:
        {
            "id": -1,
            "title": "Título simple y corto relacionado con {{place}}",
            "place": "{{place}}",
            "people": "Un número entero que indica la cantidad de personas que viajan.",
            "budget": {{budget}},
            "date": "La fecha de inicio del viaje",
            "updatedCount": 0,
            "status": "DRAFT",
            "tags": ["Tag1", "Tag2", "Tag3"] (3 tags máximo),
            "countDays": "Un número entero que indica la cantidad de días del itinerario.",
            "days": [
                {
                    "day": 1 (1, 2, 3, ...),
                    "activities": [
                        {
                            "activity": "Visitar ... atracción",
                            "details": "Detalle sobre la actividad a tener en cuenta",
                            "location": {
                                "name": "Nombre del lugar",
                                "address": "Dirección del lugar",
                                "coordinates": {
                                    "latitude": 48.8566 (decimal),
                                    "longitude": 2.3522 (decimal)
                                }
                            },
                            "time": "Hora de inicio (06:30, 09:25, 11:00, 12:00, etc.)",
                            "duration": "2 horas / 3 horas / etc."
                        }
                    ]
                }
            ]
        }
    """;

    public static String generatePrompt(AIGenerationRequest request) {
        return CONTEXT_PROMPT
            .replace("{{aiPrompt}}", request.aiPrompt())
            .replace("{{place}}", request.destination())
            .replace("{{style}}", request.style())
            .replace("{{budget}}", request.budget().toString())
            .replace("{{lodging}}", request.lodging())
            .replace("{{duration}}", request.duration())
            .replace("{{interests}}", request.interests().toString());
    }
}
