export enum TransactionType {
  Ingreso = "Ingreso",
  Gasto = "Gasto",
  Transferencia = "Transferencia",
  Retiro = "Retiro",
  Otro = "Otro",
}

export interface Transaction {
  id: string;
  rawSms: string;
  fecha: string;
  entidad: string;
  monto: number;
  tipo: TransactionType;
  categoria: string;
  subcategoria?: string;
}

export type Budgets = Record<string, number>;

// Types for Conversational AI (Component 6)
export type ChatMessageSender = 'user' | 'ai';

export enum ChatActionType {
  AjustarPresupuesto = 'ajustar_presupuesto',
  CrearAlerta = 'crear_alerta',
  SugerirReto = 'sugerir_reto',
  RevisarTransaccion = 'revisar_transaccion',
  Info = 'info',
}

export interface ChatAction {
  type: ChatActionType;
  details: Record<string, any>;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: ChatMessageSender;
  text: string;
  isLoading?: boolean;
  actions?: ChatAction[];
  sources?: string[];
  explainability?: string;
}


// Types for Anomaly Detection (Component 4)
export type AlertSeverity = 'Bajo' | 'Medio' | 'Alto';
export type AlertType = 'anomaly' | 'budget';

export interface Alert {
  id: string;
  timestamp: string;
  transactionId: string;
  message: string;
  severity: AlertSeverity;
  alertType: AlertType;
}
