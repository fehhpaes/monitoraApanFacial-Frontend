import { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { FaceDetectionResult } from '../services/faceDetection';

interface FaceValidationOverlayProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  faceDetectionResult: FaceDetectionResult | null;
}

export default function FaceValidationOverlay({
  faceDetectionResult,
}: FaceValidationOverlayProps) {
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!overlayCanvasRef.current) return;

    const overlayCanvas = overlayCanvasRef.current;
    const ctx = overlayCanvas.getContext('2d');

    if (!ctx) return;

    // Assumindo que o video tem dimensões padrão
    const videoWidth = 400;
    const videoHeight = 400;
    overlayCanvas.width = videoWidth;
    overlayCanvas.height = videoHeight;

    // Limpar canvas
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Desenhar guia de centralização (círculo)
    drawCenteringGuide(ctx, overlayCanvas);

    // Se houver detecção de rosto, desenhar bbox
    if (faceDetectionResult?.detections) {
      drawFaceBoundingBox(ctx, faceDetectionResult.detections);
      drawFaceLandmarks(ctx, faceDetectionResult.detections);
    }

    // Desenhar indicador de status
    drawStatusIndicator(ctx, faceDetectionResult);
  }, [faceDetectionResult]);

  return (
    <>
      <canvas
        ref={overlayCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
        }}
      />
      {faceDetectionResult && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: faceDetectionResult.isValid
              ? 'rgba(34, 197, 94, 0.9)'
              : 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            textAlign: 'center',
            zIndex: 20,
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {faceDetectionResult.message}
        </div>
      )}
    </>
  );
}

function drawCenteringGuide(
  ctx: CanvasRenderingContext2D,
  canvasElement: HTMLCanvasElement
) {
  const centerX = canvasElement.width / 2;
  const centerY = canvasElement.height / 2;
  const radius = Math.min(canvasElement.width, canvasElement.height) * 0.25;

  // Desenhar círculo guia
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Desenhar crosshair no centro
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 20, centerY);
  ctx.lineTo(centerX + 20, centerY);
  ctx.moveTo(centerX, centerY - 20);
  ctx.lineTo(centerX, centerY + 20);
  ctx.stroke();

  // Textos de instrução
  ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Centralize seu rosto', centerX, 30);
}

function drawFaceBoundingBox(
  ctx: CanvasRenderingContext2D,
  detections: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
  }>
) {
  const { detection } = detections;
  const { box } = detection;

  // Determinar cor baseado na validação
  // Verde se válido, vermelho se inválido
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.9)';
  ctx.lineWidth = 3;

  // Desenhar bounding box
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  // Desenhar cantos reforçados
  const cornerSize = 20;
  ctx.strokeStyle = 'rgba(100, 200, 255, 1)';
  ctx.lineWidth = 2;

  // Canto superior esquerdo
  ctx.strokeRect(box.x, box.y, cornerSize, cornerSize);
  // Canto superior direito
  ctx.strokeRect(box.x + box.width - cornerSize, box.y, cornerSize, cornerSize);
  // Canto inferior esquerdo
  ctx.strokeRect(box.x, box.y + box.height - cornerSize, cornerSize, cornerSize);
  // Canto inferior direito
  ctx.strokeRect(
    box.x + box.width - cornerSize,
    box.y + box.height - cornerSize,
    cornerSize,
    cornerSize
  );
}

function drawFaceLandmarks(
  ctx: CanvasRenderingContext2D,
  detections: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
  }>
) {
  const { landmarks } = detections;

  // Desenhar pontos dos landmarks (pequenos pontos)
  ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';

  const points = (landmarks as any).getPoints?.() || (landmarks as any)._positions || [];
  points.forEach((point: any) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function drawStatusIndicator(
  ctx: CanvasRenderingContext2D,
  faceDetectionResult: FaceDetectionResult | null
) {
  if (!faceDetectionResult) return;

  const x = 20;
  let y = 20;
  const itemHeight = 25;

  // Background semi-transparente
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x, y, 220, itemHeight * 4 + 10);

  ctx.font = '12px monospace';
  ctx.fillStyle = 'white';

  const status = (text: string, valid: boolean) => {
    const icon = valid ? '✓' : '✗';
    const color = valid ? '#22C55E' : '#EF4444';
    ctx.fillStyle = color;
    ctx.fillText(`${icon} ${text}`, x + 10, y + itemHeight);
  };

  ctx.fillStyle = 'rgba(150, 150, 150, 0.9)';
  ctx.fillText('Validações:', x + 10, y + itemHeight - 10);

  y = y + itemHeight;
  status('Rosto visível', faceDetectionResult.faceFullyVisible);
  ctx.fillStyle = 'white';
  ctx.fillText(
    `${faceDetectionResult.faceFullyVisible ? '✓' : '✗'} Rosto visível`,
    x + 10,
    y + itemHeight
  );

  ctx.fillStyle = faceDetectionResult.isCentered ? '#22C55E' : '#EF4444';
  ctx.fillText(
    `${faceDetectionResult.isCentered ? '✓' : '✗'} Centralizado`,
    x + 10,
    y + itemHeight * 2
  );

  ctx.fillStyle = faceDetectionResult.noGlasses ? '#22C55E' : '#EF4444';
  ctx.fillText(
    `${faceDetectionResult.noGlasses ? '✓' : '✗'} Sem óculos`,
    x + 10,
    y + itemHeight * 3
  );

  ctx.fillStyle = faceDetectionResult.bothEyesOpen ? '#22C55E' : '#EF4444';
  ctx.fillText(
    `${faceDetectionResult.bothEyesOpen ? '✓' : '✗'} Olhos abertos`,
    x + 10,
    y + itemHeight * 4
  );
}
