import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    fecha: {
      type: Type.STRING,
      description: "The date of the transaction in YYYY-MM-DD format. Infer from the message or use the current date if not specified.",
    },
    entidad: {
      type: Type.STRING,
      description: "The entity or merchant involved in the transaction (e.g., Éxito, Bancolombia, Claro).",
    },
    monto: {
      type: Type.NUMBER,
      description: "The numeric amount of the transaction, without currency symbols or commas.",
    },
    tipo: {
      type: Type.STRING,
      enum: [TransactionType.Ingreso, TransactionType.Gasto, TransactionType.Transferencia, TransactionType.Retiro, TransactionType.Otro],
      description: "The type of transaction.",
    },
    categoria: {
      type: Type.STRING,
      description: "A normalized category for the transaction (e.g., Compras, Servicios, Nómina, Alimentación, Transporte, Salud, Educación, Suscripciones, Retiro en efectivo, Transferencia enviada).",
    },
    subcategoria: {
        type: Type.STRING,
        description: "An optional, more specific sub-category. For example, if categoria is 'Servicios', subcategoria could be 'Streaming', 'Telefonía', or 'Servicios Públicos'."
    }
  },
  required: ["fecha", "entidad", "monto", "tipo", "categoria"],
};

const systemInstruction = `You are an expert financial assistant. Your task is to analyze a raw SMS message from a Colombian bank and classify it into a structured JSON format.
- Accurately extract the date, entity, and amount.
- Determine if the transaction is an Income (Ingreso), Expense (Gasto), Transfer (Transferencia), or Withdrawal (Retiro).
- Assign a relevant, normalized category.
- Also assign a more specific sub-category where possible (e.g., for a Netflix payment, categoria is 'Servicios' and subcategoria is 'Streaming').
- If a value cannot be determined, use a sensible default (e.g., "Desconocido" for entity, today's date). The amount must always be extracted.

Here are some examples based on real data:

---
EXAMPLE 1
SMS: "Compra aprobada por $120.000 en Éxito con tarjeta débito 4321."
JSON:
{
  "fecha": "YYYY-MM-DD",
  "entidad": "Éxito",
  "monto": 120000,
  "tipo": "Gasto",
  "categoria": "Compras",
  "subcategoria": "Supermercado"
}
---
EXAMPLE 2
SMS: "Abono de $1.200.000 por NOMINA EMPRESA en Cta. Ahorros **0011."
JSON:
{
  "fecha": "YYYY-MM-DD",
  "entidad": "NOMINA EMPRESA",
  "monto": 1200000,
  "tipo": "Ingreso",
  "categoria": "Nómina",
  "subcategoria": "Salario"
}
---
EXAMPLE 3
SMS: "Pago de la factura Claro de $95,300 exitoso."
JSON:
{
  "fecha": "YYYY-MM-DD",
  "entidad": "Claro",
  "monto": 95300,
  "tipo": "Gasto",
  "categoria": "Servicios",
  "subcategoria": "Telefonía"
}
---
EXAMPLE 4
SMS: "Retiro en cajero Banco de Bogotá por $300.000."
JSON:
{
  "fecha": "YYYY-MM-DD",
  "entidad": "Banco de Bogotá",
  "monto": 300000,
  "tipo": "Retiro",
  "categoria": "Retiro en efectivo"
}
---
EXAMPLE 5
SMS: "Bancolombia: Recibiste una transferencia por $240,000 de DAVID AVILA en tu cuenta **2187."
JSON:
{
  "fecha": "YYYY-MM-DD",
  "entidad": "DAVID AVILA",
  "monto": 240000,
  "tipo": "Ingreso",
  "categoria": "Transferencia"
}
---
EXAMPLE 6
SMS: "Transf. de $65.000 a cuenta Davivienda **5678."
JSON:
{
  "fecha": "YYYY-MM-DD",
  "entidad": "Davivienda",
  "monto": 65000,
  "tipo": "Transferencia",
  "categoria": "Transferencia enviada"
}
---
EXAMPLE 7
SMS: "Nequi: Pagaste $8900.00 en DLO GOOGLE Google One."
JSON:
{
  "fecha": "YYYY-MM-DD",
  "entidad": "Google One",
  "monto": 8900,
  "tipo": "Gasto",
  "categoria": "Servicios",
  "subcategoria": "Suscripciones"
}
---
`;

export const classifySms = async (sms: string): Promise<Omit<Transaction, 'id' | 'rawSms'>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Please classify the following SMS message:\n\n"${sms}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    // Validate the type to match our enum
    if (!Object.values(TransactionType).includes(parsedData.tipo as TransactionType)) {
        parsedData.tipo = TransactionType.Otro;
    }
    
    return parsedData;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid classification from the AI model.");
  }
};
