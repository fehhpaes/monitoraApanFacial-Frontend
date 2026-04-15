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
  qrCodeUrl?: string;
  qrCodePublicId?: string;
  qrCodeGerado?: boolean;
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

// QR Code Types
export interface QRCodeData {
  _id: string;
  nome: string;
  curso: string;
  fotoUrl: string;
  emailResponsavel: string;
  geradoEm: string;
}

export interface QRCodeResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    qrCodeUrl: string;
    qrCodePublicId: string;
    qrCodeGerado: boolean;
  };
}

// Presença Types
export type StatusPresenca = 'presente' | 'saida';

export interface Presenca {
  _id: string;
  alunoId: string;
  nome: string;
  curso: string;
  fotoUrl: string;
  emailResponsavel: string;
  dataEntrada: string;
  dataSaida?: string;
  status: StatusPresenca;
  dataCriacao: string;
}

export interface RegistrarPresencaPayload {
  qrData: string;
  tipo?: 'entrada' | 'saida';
}

export interface PresencaResponse {
  success: boolean;
  message: string;
  data: Presenca;
  alreadyRegistered?: boolean;
}

export interface PresencaDiaResponse {
  success: boolean;
  data: Presenca[];
  total: number;
}

export interface HistoricoAlunoResponse {
  success: boolean;
  data: Presenca[];
  total: number;
}

export interface RelatorioResponse {
  success: boolean;
  data: Presenca[];
  total: number;
}
