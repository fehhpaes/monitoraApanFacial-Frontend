import axios, { AxiosInstance } from 'axios';
import { Aluno, CreateAlunoPayload, UpdateAlunoPayload, FotoUploadResponse, Curso } from '../types/index';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,  // Aumentado para 30 segundos para Render cold start
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

export default api;
