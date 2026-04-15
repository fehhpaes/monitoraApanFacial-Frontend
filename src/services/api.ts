import axios, { AxiosInstance } from 'axios';
import { 
  Aluno, 
  CreateAlunoPayload, 
  UpdateAlunoPayload, 
  FotoUploadResponse, 
  Curso,
  QRCodeResponse,
  RegistrarPresencaPayload,
  Presenca,
  PresencaDiaResponse,
  HistoricoAlunoResponse,
  RelatorioResponse,
} from '../types/index';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Adicionar interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error);
    return Promise.reject(error);
  }
);

export const alunosAPI = {
  // Criar novo aluno
  create: async (data: CreateAlunoPayload): Promise<Aluno> => {
    const response = await api.post<{ data: Aluno }>('/alunos', data);
    return response.data.data;
  },

  // Listar todos os alunos
  getAll: async (): Promise<Aluno[]> => {
    const response = await api.get<{ data: Aluno[] }>('/alunos');
    return response.data.data;
  },

  // Buscar aluno por ID
  getById: async (id: string): Promise<Aluno> => {
    const response = await api.get<{ data: Aluno }>(`/alunos/${id}`);
    return response.data.data;
  },

  // Atualizar aluno
  update: async (id: string, data: UpdateAlunoPayload): Promise<Aluno> => {
    const response = await api.put<{ data: Aluno }>(`/alunos/${id}`, data);
    return response.data.data;
  },

  // Deletar aluno
  delete: async (id: string): Promise<void> => {
    await api.delete(`/alunos/${id}`);
  },

  // Upload de foto
  uploadFoto: async (fotoBase64: string): Promise<FotoUploadResponse> => {
    const response = await api.post<{ data: FotoUploadResponse }>('/alunos/upload/foto', {
      foto: fotoBase64,
    });
    return response.data.data;
  },

  // Gerar QR Code
  generateQRCode: async (id: string): Promise<QRCodeResponse> => {
    const response = await api.post<QRCodeResponse>(`/alunos/${id}/qrcode/generate`);
    return response.data;
  },

  // Deletar QR Code
  deleteQRCode: async (id: string): Promise<void> => {
    await api.delete(`/alunos/${id}/qrcode`);
  },
};

export const cursosAPI = {
  // Listar todos os cursos
  getAll: async (): Promise<Curso[]> => {
    const response = await api.get<{ data: Curso[] }>('/cursos');
    return response.data.data;
  },

  // Criar novo curso (admin)
  create: async (nome: string, sigla: string, tipo: 'modular' | 'integral'): Promise<void> => {
    await api.post('/cursos', { nome, sigla, tipo });
  },
};

export const presencaAPI = {
  // Registrar presença (entrada/saída automática)
  registrar: async (payload: RegistrarPresencaPayload): Promise<Presenca> => {
    const response = await api.post<{ data: Presenca }>('/presenca/registrar', payload);
    return response.data.data;
  },

  // Obter presenças do dia
  getPresencaDia: async (curso?: string): Promise<Presenca[]> => {
    const response = await api.get<PresencaDiaResponse>('/presenca/dia', {
      params: { curso },
    });
    return response.data.data;
  },

  // Obter histórico de presença de um aluno
  getHistoricoAluno: async (id: string): Promise<Presenca[]> => {
    const response = await api.get<HistoricoAlunoResponse>(`/presenca/aluno/${id}`);
    return response.data.data;
  },

  // Obter relatório de presença
  getRelatorio: async (dataInicio?: string, dataFim?: string, curso?: string): Promise<Presenca[]> => {
    const response = await api.get<RelatorioResponse>('/presenca/relatorio', {
      params: { dataInicio, dataFim, curso },
    });
    return response.data.data;
  },

  // Obter relatório com filtro por períodos
  getRelatorioPeriodos: async (periodo: string = 'hoje', curso?: string): Promise<Presenca[]> => {
    const response = await api.get<RelatorioResponse>('/presenca/relatorio-periodos', {
      params: { periodo, curso },
    });
    return response.data.data;
  },
};

export default api;
