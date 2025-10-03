import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Budgets, ChatMessage, ChatActionType, ChatAction, Alert } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        response_text: {
            type: Type.STRING,
            description: "The main conversational response to the user's query."
        },
        actions: {
            type: Type.ARRAY,
            description: "A list of structured, actionable suggestions for the user.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: {
                        type: Type.STRING,
                        enum: Object.values(ChatActionType),
                        description: "The type of action recommended."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A human-readable description of the action."
                    },
                    details: {
                        type: Type.OBJECT,
                        description: "A flexible object containing details for the action, e.g., { 'categoria': 'Alimentación', 'ajuste': -50000 }.",
                        properties: {} // Allow any properties
                    }
                },
                required: ["type", "description", "details"]
            }
        },
        sources: {
            type: Type.ARRAY,
            description: "A list of transaction IDs or summary points used as evidence for the response.",
            items: { type: Type.STRING }
        },
        explainability: {
            type: Type.STRING,
            description: "A brief, clear reason for the suggestion, e.g., 'Because your spending on restaurants is 40% higher than last month.'"
        }
    },
    required: ["response_text"]
};

const systemInstruction = `You are FinAicer, a friendly and expert financial assistant. Your goal is to help users understand their finances and make better decisions by answering their questions in a conversational, helpful, and data-driven manner.

**Core Instructions:**
1.  **ALWAYS respond in a structured JSON format** that matches the provided schema. The JSON object is your only output.
2.  Use the provided **[USER_CONTEXT]**, **[ALERTS_CONTEXT]** and **[EVIDENCE]** to formulate personalized, relevant responses.
3.  Keep your 'response_text' concise and easy to understand.
4.  Generate actionable suggestions in the 'actions' array. These actions should be practical and based on the user's data.
5.  Reference the data you used in the 'sources' array.
6.  Provide a simple, clear reason for your advice in the 'explainability' field.
7.  If the user asks a general question, provide general financial advice. If they ask about their data, be specific.
8.  Do not invent data. If the context is insufficient, state that you need more information.

**Few-Shot Examples:**

---
**EXAMPLE 1**
User Question: "¿Cómo reduzco mis gastos en comidas este mes?"
[USER_CONTEXT]: { "gasto_mes_actual": { "Alimentación": 420000 }, "ingresos_promedio": 2500000 }
[ALERTS_CONTEXT]: [ { "message": "Límite excedido para 'Alimentación'" } ]
[EVIDENCE]: [ { "id": "tx_1", "fecha": "2023-10-05", "entidad": "Restaurante Caro", "monto": 85000, "categoria": "Alimentación" }, { "id": "tx_2", "fecha": "2023-10-02", "entidad": "Rappi", "monto": 55000, "categoria": "Alimentación" } ]
[CHAT_HISTORY]: []

Expected JSON Output:
{
  "response_text": "He notado que tus gastos en 'Alimentación' son significativos este mes, e incluso recibiste una alerta de presupuesto. Reducir los pedidos a domicilio y las cenas fuera podría ser un buen comienzo.",
  "actions": [
    { "type": "ajustar_presupuesto", "description": "Reducir el presupuesto de 'Alimentación' en $50,000.", "details": { "categoria": "Alimentación", "ajuste": -50000 } },
    { "type": "sugerir_reto", "description": "Prueba el reto de '7 días sin comer fuera'.", "details": { "ahorro_estimado": 80000 } }
  ],
  "sources": ["tx_1", "tx_2", "Alerta de presupuesto"],
  "explainability": "Tu gasto en 'Alimentación' representa una parte importante de tus egresos totales y ya ha superado el límite que estableciste."
}
---
**EXAMPLE 2**
User Question: "¿Es normal una transferencia de $1.500.000 que recibí?"
[USER_CONTEXT]: { "ingresos_promedio": 2500000, "transferencias_recibidas_promedio": 200000 }
[ALERTS_CONTEXT]: []
[EVIDENCE]: [ { "id": "tx_3", "fecha": "2023-10-10", "entidad": "Desconocido", "monto": 1500000, "tipo": "Ingreso", "categoria": "Transferencia" } ]
[CHAT_HISTORY]: []

Expected JSON Output:
{
  "response_text": "He detectado una transferencia por $1,500,000 que es significativamente más alta que el promedio de las transferencias que sueles recibir. Te recomiendo verificar su origen.",
  "actions": [
    { "type": "revisar_transaccion", "description": "Verificar el origen de la transferencia de $1,500,000.", "details": { "transaction_id": "tx_3" } }
  ],
  "sources": ["tx_3"],
  "explainability": "El monto es 7.5 veces mayor que tu promedio de transferencias recibidas ($200,000)."
}
---
`;

interface ChatContext {
    transactions: Transaction[];
    budgets: Budgets | null;
    alerts: Alert[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);


export const getChatResponse = async (
    message: string, 
    history: ChatMessage[],
    context: ChatContext
): Promise<Omit<ChatMessage, 'id' | 'sender'>> => {

    // 1. Simulate RAG: Generate context summary
    const totalExpenses = context.transactions
        .filter(t => t.tipo === 'Gasto' || t.tipo === 'Retiro')
        .reduce((sum, t) => sum + t.monto, 0);
    const totalIncome = context.transactions
        .filter(t => t.tipo === 'Ingreso')
        .reduce((sum, t) => sum + t.monto, 0);

    const contextSummary = `
[USER_CONTEXT]
{
  "total_gastos_historico": "${formatCurrency(totalExpenses)}",
  "total_ingresos_historico": "${formatCurrency(totalIncome)}",
  "presupuestos_actuales": ${JSON.stringify(context.budgets || {})}
}

[ALERTS_CONTEXT]
${JSON.stringify(context.alerts.slice(0, 3).map(a => ({ severity: a.severity, message: a.message })), null, 2)}

[EVIDENCE]
${JSON.stringify(context.transactions.slice(0, 5).map(t => ({id: t.id, fecha: t.fecha, entidad: t.entidad, monto: t.monto, categoria: t.categoria, tipo: t.tipo})), null, 2)}

[CHAT_HISTORY]
${history.map(m => `${m.sender}: ${m.text}`).join('\n')}
    `;

    // 2. Build the final prompt
    const fullPrompt = `${contextSummary}\n\nUser Question: "${message}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: chatResponseSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);
        
        return {
            text: parsedData.response_text || "No he podido generar una respuesta.",
            actions: parsedData.actions || [],
            sources: parsedData.sources || [],
            explainability: parsedData.explainability || undefined,
        };
    } catch (error) {
        console.error("Error calling Gemini API for chat:", error);
        throw new Error("Failed to get a valid chat response from the AI model.");
    }
};
