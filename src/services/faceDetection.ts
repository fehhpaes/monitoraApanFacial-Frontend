import * as faceapi from 'face-api.js';

export interface FaceDetectionResult {
  hasFace: boolean;
  isCentered: boolean;
  noGlasses: boolean;
  faceFullyVisible: boolean;
  isValid: boolean;
  message: string;
  detections?: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
  }>;
}

const FACE_SIZE_MIN = 0; // Mínimo 0% - sem limite inferior de tamanho
const FACE_SIZE_MAX = 0.85; // Máximo 85% da tela
const CENTER_TOLERANCE = 0.15; // ±15% de tolerância para centro

let modelsLoaded = false;

export const loadFaceApiModels = async (): Promise<void> => {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
    await faceapi.nets.tinyFaceDetector.load(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.load(MODEL_URL);
    await faceapi.nets.faceExpressionNet.load(MODEL_URL);
    modelsLoaded = true;
    console.log('Face-API models loaded successfully');
  } catch (error) {
    console.error('Erro ao carregar modelos do face-api:', error);
    throw error;
  }
};

export const detectAndValidateFace = async (
  canvas: HTMLCanvasElement
): Promise<FaceDetectionResult> => {
  if (!modelsLoaded) {
    return {
      hasFace: false,
      isCentered: false,
      noGlasses: false,
      faceFullyVisible: false,
      isValid: false,
      message: 'Modelos não carregados',
    };
  }

  try {
    const detections = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    // Sem rosto detectado
    if (!detections) {
      return {
        hasFace: false,
        isCentered: false,
        noGlasses: false,
        faceFullyVisible: false,
        isValid: false,
        message: 'Nenhum rosto detectado. Tente novamente.',
        detections: undefined,
      };
    }

    const { detection, landmarks } = detections;
    const { box } = detection;

    // Calcular proporção do rosto em relação à tela
    const faceWidthRatio = box.width / canvas.width;
    const faceHeightRatio = box.height / canvas.height;
    const faceSizeRatio = Math.max(faceWidthRatio, faceHeightRatio);

    // Validar se rosto é visível e completamente na tela
    const isFaceFullyVisible =
      box.x >= 0 &&
      box.y >= 0 &&
      box.x + box.width <= canvas.width &&
      box.y + box.height <= canvas.height;

    // Validar se rosto está centralizado
    const faceCenterX = box.x + box.width / 2;
    const faceCenterY = box.y + box.height / 2;
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;

    const centerOffsetX = Math.abs(faceCenterX - canvasCenterX) / canvasCenterX;
    const centerOffsetY = Math.abs(faceCenterY - canvasCenterY) / canvasCenterY;
    const isCentered = centerOffsetX < CENTER_TOLERANCE && centerOffsetY < CENTER_TOLERANCE;

    // Validar se rosto está no tamanho apropriado (perto)
    const isGoodDistance =
      faceSizeRatio >= FACE_SIZE_MIN && faceSizeRatio <= FACE_SIZE_MAX;

    // Validar se há óculos (detectar reflexos nas regiões dos olhos)
    const hasGlasses = checkForGlasses(landmarks);

    // Compilar resultado
    const isValid =
      isFaceFullyVisible &&
      isCentered &&
      isGoodDistance &&
      !hasGlasses;

    let message = '';
    if (!isFaceFullyVisible) {
      message = 'Rosto deve estar completamente visível na câmera.';
    } else if (!isCentered) {
      message = 'Centralize seu rosto na câmera.';
    } else if (!isGoodDistance) {
      message = 'Distância inadequada. Aproxime-se mais da câmera.';
    } else if (hasGlasses) {
      message = 'Remova os óculos para melhor qualidade da foto.';
    } else {
      message = '✓ Rosto validado com sucesso!';
    }

    return {
      hasFace: true,
      isCentered,
      noGlasses: !hasGlasses,
      faceFullyVisible: isFaceFullyVisible,
      isValid,
      message,
      detections,
    };
  } catch (error) {
    console.error('Erro ao detectar rosto:', error);
    return {
      hasFace: false,
      isCentered: false,
      noGlasses: false,
      faceFullyVisible: false,
      isValid: false,
      message: 'Erro ao processar imagem.',
    };
  }
};

function checkForGlasses(landmarks: faceapi.WithFaceLandmarks<any>): boolean {
  if (!landmarks || !landmarks.landmarks) {
    return false;
  }

  const points = (landmarks.landmarks.getPoints() as any[]);

  // Pontos dos olhos (face-api usa 68 pontos)
  // Olho esquerdo: pontos 36-41
  // Olho direito: pontos 42-47
  const leftEyePoints = points.slice(36, 42);
  const rightEyePoints = points.slice(42, 48);

  // Verificar brilho/reflexo (óculos têm padrão específico)
  // Uma heurística simples: se os olhos têm padrão atípico, pode ser óculos
  // Para simplificar, verificamos a altura dos pontos dos olhos
  const leftEyeHeightVariance = Math.max(...leftEyePoints.map((p: any) => p.y)) - 
                                Math.min(...leftEyePoints.map((p: any) => p.y));
  const rightEyeHeightVariance = Math.max(...rightEyePoints.map((p: any) => p.y)) - 
                                 Math.min(...rightEyePoints.map((p: any) => p.y));

  // Se a variância é muito pequena, pode ser reflexo de óculos
  const hasGlassesPattern = leftEyeHeightVariance < 5 || rightEyeHeightVariance < 5;

  return hasGlassesPattern;
}

export const cropFaceTo3x4 = (
  canvas: HTMLCanvasElement,
  detections: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
  }>
): HTMLCanvasElement => {
  const { detection } = detections;
  const { box } = detection;

  // Proporção 3x4 (altura > largura)
  const targetRatio = 4 / 3; // altura/largura

  // Calcular dimensões do crop
  let cropWidth = box.width * 1.2; // 20% de margem
  let cropHeight = cropWidth * targetRatio;

  // Se a altura exceder o tamanho do rosto, ajustar
  if (cropHeight > box.height * 1.5) {
    cropHeight = box.height * 1.5;
    cropWidth = cropHeight / targetRatio;
  }

  // Calcular posição do crop (centralizado no rosto)
  const faceCenterX = box.x + box.width / 2;
  const faceCenterY = box.y + box.height / 2;

  let cropX = faceCenterX - cropWidth / 2;
  let cropY = faceCenterY - cropHeight / 2;

  // Garantir que o crop não saia dos limites do canvas
  if (cropX < 0) cropX = 0;
  if (cropY < 0) cropY = 0;
  if (cropX + cropWidth > canvas.width) {
    cropX = canvas.width - cropWidth;
  }
  if (cropY + cropHeight > canvas.height) {
    cropY = canvas.height - cropHeight;
  }

  // Criar novo canvas com as dimensões 3x4
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;

  const ctx = croppedCanvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível obter contexto do canvas');

  // Copiar e cortar a imagem
  ctx.drawImage(
    canvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return croppedCanvas;
};
