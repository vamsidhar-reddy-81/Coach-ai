export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface ChartData {
  type: 'bar' | 'line' | 'area';
  title?: string;
  data: Record<string, any>[];
  xKey: string;
  series: string[];
}

export interface Source {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  isStreaming?: boolean;
  timestamp: number;
  sources?: Source[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}