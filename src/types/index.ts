export interface Aluno {
  _id: string;
  nome: string;
  curso: string;
  nomeResponsavel: string;
  emailResponsavel: string;
  fotoUrl: string;
  fotoPublicId: string;
  dataCadastro: string;
  dataAtualizacao: string;
}

export interface CreateAlunoPayload {
  nome: string;
  curso: string;
  nomeResponsavel: string;
  emailResponsavel: string;
  fotoUrl: string;
  fotoPublicId: string;
}

export interface UpdateAlunoPayload extends Partial<CreateAlunoPayload> {}

export interface FotoUploadResponse {
  url: string;
  publicId: string;
}

export type TipoCurso = 'modular' | 'integral';

export interface Curso {
  _id: string;
  nome: string;
  sigla: string;
  tipo: TipoCurso;
  dataCadastro: string;
}

export interface CreateCursoPayload {
  nome: string;
  sigla: string;
  tipo: TipoCurso;
}

// Face Detection Types
export interface FaceDetectionResult {
  hasFace: boolean;
  isCentered: boolean;
  noGlasses: boolean;
  faceFullyVisible: boolean;
  isValid: boolean;
  message: string;
  detections?: any;
}
