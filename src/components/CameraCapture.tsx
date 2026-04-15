import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, AlertCircle } from 'lucide-react';
import {
  loadFaceApiModels,
  detectAndValidateFace,
  cropFaceTo3x4,
  FaceDetectionResult,
} from '../services/faceDetection';
import FaceValidationOverlay from './FaceValidationOverlay';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionLoopRef = useRef<number | null>(null);
  const validFaceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCapturedTimeRef = useRef<number>(0);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDetectionResult, setFaceDetectionResult] = useState<FaceDetectionResult | null>(null);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [captureDisabled, setCaptureDisabled] = useState(true);
  const [validFaceCountdown, setValidFaceCountdown] = useState<number>(0);

  // Carregar modelos do face-api ao montar o componente
  useEffect(() => {
    const loadModels = async () => {
      try {
        setModelsLoading(true);
        await loadFaceApiModels();
        setModelsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar modelos:', error);
        setLoadError('Erro ao carregar modelos de reconhecimento de rosto');
        setModelsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Iniciar loop de detecção quando webcam está pronto
  useEffect(() => {
    if (!modelsLoading && webcamRef.current) {
      startDetectionLoop();
    }

    return () => {
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
      if (validFaceTimerRef.current) {
        clearTimeout(validFaceTimerRef.current);
      }
    };
  }, [modelsLoading]);

  // Gerenciar auto-capture quando rosto é válido por 2 segundos
  useEffect(() => {
    if (faceDetectionResult?.isValid && !capturedImage) {
      if (validFaceCountdown === 0) {
        // Iniciar countdown
        setValidFaceCountdown(2);
        validFaceTimerRef.current = setTimeout(() => {
          setValidFaceCountdown(1);
          validFaceTimerRef.current = setTimeout(() => {
            setValidFaceCountdown(0);
            captureAutomatic();
          }, 1000);
        }, 1000);
      }
    } else {
      // Resetar countdown se rosto deixou de ser válido
      if (validFaceTimerRef.current) {
        clearTimeout(validFaceTimerRef.current);
      }
      setValidFaceCountdown(0);
    }

    return () => {
      if (validFaceTimerRef.current) {
        clearTimeout(validFaceTimerRef.current);
      }
    };
  }, [faceDetectionResult?.isValid, capturedImage]);

  const startDetectionLoop = () => {
    const detectFace = async () => {
      if (!webcamRef.current || !canvasRef.current) {
        detectionLoopRef.current = requestAnimationFrame(detectFace);
        return;
      }

      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
          detectionLoopRef.current = requestAnimationFrame(detectFace);
          return;
        }

        // Criar imagem a partir do screenshot
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current!;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            // Detectar e validar rosto
            detectAndValidateFace(canvas).then((result) => {
              setFaceDetectionResult(result);
              setCaptureDisabled(!result.isValid);
            });
          }
        };
        img.src = imageSrc;
      } catch (error) {
        console.error('Erro durante detecção:', error);
      }

      detectionLoopRef.current = requestAnimationFrame(detectFace);
    };

    detectFace();
  };

  const captureAutomatic = async () => {
    // Evitar múltiplas capturas rápidas
    const now = Date.now();
    if (now - lastCapturedTimeRef.current < 3000) {
      return;
    }
    lastCapturedTimeRef.current = now;

    if (!faceDetectionResult?.isValid) {
      return;
    }

    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) return;

      // Criar imagem para crop
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        // Detectar rosto novamente para crop
        const detections = await detectAndValidateFace(canvas);
        if (detections.detections) {
          try {
            // Fazer crop 3x4
            const croppedCanvas = cropFaceTo3x4(canvas, detections.detections);
            const croppedImageSrc = croppedCanvas.toDataURL('image/jpeg', 0.95);
            setCapturedImage(croppedImageSrc);
          } catch (error) {
            console.error('Erro ao fazer crop:', error);
            // Se falhar no crop, usar a imagem original
            setCapturedImage(imageSrc);
          }
        }
      };
      img.src = imageSrc;
    } catch (error) {
      console.error('Erro ao capturar automaticamente:', error);
    }
  };

  const capture = async () => {
    if (!faceDetectionResult?.isValid) {
      alert('Posicione seu rosto corretamente antes de capturar a foto.');
      return;
    }

    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) return;

      // Criar imagem para crop
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        // Detectar rosto novamente para crop
        const detections = await detectAndValidateFace(canvas);
        if (detections.detections) {
          try {
            // Fazer crop 3x4
            const croppedCanvas = cropFaceTo3x4(canvas, detections.detections);
            const croppedImageSrc = croppedCanvas.toDataURL('image/jpeg', 0.95);
            setCapturedImage(croppedImageSrc);
          } catch (error) {
            console.error('Erro ao fazer crop:', error);
            // Se falhar no crop, usar a imagem original
            setCapturedImage(imageSrc);
          }
        }
      };
      img.src = imageSrc;
    } catch (error) {
      console.error('Erro ao capturar:', error);
      alert('Erro ao capturar foto');
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setFaceDetectionResult(null);
    startDetectionLoop();
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800">Capturar Foto</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {loadError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-800">Erro ao carregar</h3>
              <p className="text-red-700 text-sm">{loadError}</p>
            </div>
          </div>
        ) : modelsLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Carregando modelos de reconhecimento facial...</p>
            <p className="text-gray-500 text-sm mt-2">Isso pode levar alguns segundos</p>
          </div>
        ) : !capturedImage ? (
          <div className="space-y-3">
            {/* Webcam com overlay */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '1' }}>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 400,
                  height: 400,
                  facingMode: 'user',
                }}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay com guias e validações */}
              <FaceValidationOverlay
                canvasRef={canvasRef}
                videoRef={undefined as any}
                faceDetectionResult={faceDetectionResult}
              />

              {/* Canvas invisível para processamento */}
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </div>

            {/* Informações de validação */}
            {faceDetectionResult && (
              <div className="bg-gray-50 rounded-lg p-2 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 text-xs">Validações:</h3>
                  {validFaceCountdown > 0 && (
                    <div className="flex items-center gap-2 bg-green-100 px-2 py-1 rounded-full">
                      <div className="animate-pulse text-green-600 font-bold text-sm">{validFaceCountdown}</div>
                      <span className="text-green-600 text-xs">Auto-captura</span>
                    </div>
                  )}
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={faceDetectionResult.hasFace ? '✓ text-green-600' : '✗ text-red-600'}>
                      {faceDetectionResult.hasFace ? '✓' : '✗'}
                    </span>
                    <span>Rosto detectado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={faceDetectionResult.faceFullyVisible ? '✓ text-green-600' : '✗ text-red-600'}>
                      {faceDetectionResult.faceFullyVisible ? '✓' : '✗'}
                    </span>
                    <span>Rosto visível</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={faceDetectionResult.isCentered ? '✓ text-green-600' : '✗ text-red-600'}>
                      {faceDetectionResult.isCentered ? '✓' : '✗'}
                    </span>
                    <span>Centralizado</span>
                  </div>
                   <div className="flex items-center gap-2">
                     <span className={faceDetectionResult.noGlasses ? '✓ text-green-600' : '✗ text-red-600'}>
                       {faceDetectionResult.noGlasses ? '✓' : '✗'}
                     </span>
                     <span>Sem óculos</span>
                   </div>
                </div>
              </div>
            )}

            {/* Botão de captura - escondido se há countdown de auto-capture */}
            {validFaceCountdown === 0 && (
              <button
                onClick={capture}
                disabled={captureDisabled}
                className={`w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
                  captureDisabled
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Camera size={20} />
                {captureDisabled ? 'Ajuste seu rosto para capturar' : 'Capturar Foto Manual'}
              </button>
            )}
          </div>
        ) : (
          /* Tela de confirmação */
          <div className="space-y-3">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img src={capturedImage} alt="Capturada" className="w-full" />
            </div>
            <p className="text-xs text-gray-600 text-center">
              Foto em formato 3x4
            </p>
            <div className="flex gap-2">
              <button
                onClick={retake}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition text-sm"
              >
                Retomar
              </button>
              <button
                onClick={confirmCapture}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
