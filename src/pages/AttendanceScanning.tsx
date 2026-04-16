import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { presencaAPI, alunosAPI } from '../services/api';
import { Presenca } from '../types/index';
import { ArrowLeft, ExternalLink, Check, X, Camera, CameraOff, Settings } from 'lucide-react';
import { toast } from 'react-toastify';

interface ConfirmationData {
  nome: string;
  curso: string;
  fotoUrl?: string;
  status: 'presente' | 'saida';
  qrData: string;
}

interface AttendanceScanningProps {
  onBack?: () => void;
}

export function AttendanceScanning({ onBack }: AttendanceScanningProps) {
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursoFiltro, setCursoFiltro] = useState<string>('');
  const [cursos, setCursos] = useState<string[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [scannerAtivo, setScannerAtivo] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  
  // Configurações
  const [camerasDisponiveis, setCamerasDisponiveis] = useState<{id: string; label: string}[]>([]);
  const [cameraSelecionada, setCameraSelecionada] = useState<string>('');
  const [tempoModal, setTempoModal] = useState<number>(5);
  const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);
  const [contagemRegressiva, setContagemRegressiva] = useState<number | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Carregar presenças do dia ao montar o componente
  useEffect(() => {
    carregarPresencas();
    carregarCursos();
    inicializarScanner();

    return () => {
      // Limpar scanner ao desmontar
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current = null;
        }).catch(() => {
          scannerRef.current = null;
        });
      }
      // Limpar timer de contagem regressiva
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Carregar configurações ao montar
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          setCamerasDisponiveis(cameras.map(c => ({ id: c.id, label: c.label })));
          
          // Selecionar câmera salva ou primeira disponível
          const cameraSalva = localStorage.getItem('cameraSelecionada');
          if (cameraSalva && cameras.some(c => c.id === cameraSalva)) {
            setCameraSelecionada(cameraSalva);
          } else {
            setCameraSelecionada(cameras[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar câmeras:', error);
      }
    };
    
    const tempoSalvo = localStorage.getItem('tempoModal');
    if (tempoSalvo) {
      setTempoModal(Number(tempoSalvo));
    }
    
    carregarConfiguracoes();
  }, []);

  // Atualizar presenças quando o filtro de curso mudar
  useEffect(() => {
    carregarPresencas();
  }, [cursoFiltro]);

  const inicializarScanner = async () => {
    if (!videoContainerRef.current || scannerRef.current) return;

    try {
      setScannerError(null);
      const scanner = new Html5Qrcode('qr-reader-video');

      const config = {
        fps: 5,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
          barCodeDetector: {
            format: ['qr_code'],
          },
        },
      };

      // Usar câmera selecionada ou fallback para environment
      const deviceId = cameraSelecionada || { facingMode: 'environment' };
      
      await scanner.start(
        deviceId,
        config,
        onScanSuccess,
        onScanError
      );

      scannerRef.current = scanner;
      setScannerAtivo(true);
      console.log('Scanner iniciado com sucesso');
    } catch (error) {
      console.error('Erro ao iniciar scanner:', error);
      setScannerError(error instanceof Error ? error.message : 'Erro ao iniciar câmera');
      toast.error('Erro ao iniciar câmera. Verifique as permissões.', {
        position: 'bottom-right',
      });
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    // Prevenir múltiplas detecções enquantoprocessa
    if (isProcessingScan) return;
    setIsProcessingScan(true);

    try {
      setLoading(true);
      
      // Parar de scanear
      if (scannerRef.current) {
        await scannerRef.current.pause();
      }

      // Buscar dados do aluno no backend (o backend retorna os dados já parsados do QR)
      const result = await presencaAPI.registrar({
        qrData: decodedText,
      });

      // Mostrar modal com dados para confirmação
      setConfirmationData({
        nome: result.nome,
        curso: result.curso,
        fotoUrl: result.fotoUrl,
        status: result.status === 'presente' ? 'presente' : 'saida',
        qrData: decodedText,
      });
      setShowConfirmationModal(true);
      
      // Iniciar contagem regressiva
      iniciarContagemRegressiva();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao ler QR code',
        { position: 'bottom-right' }
      );
      resumirScanner();
    } finally {
      setLoading(false);
      // Manter isProcessingScan=true até confirmar ou cancelar
    }
  };

  const onScanError = (error: string) => {
    // Silenciar erros de scan contínuo (esses são normais quando não detecta nada)
    if (
      error.includes('No MultiFormat Readers') ||
      error.includes('NotFoundException') ||
      error.includes('No QR code') ||
      error.includes('Not found')
    ) {
      return;
    }
    console.log('Scanner erro:', error);
  };

  const resumirScanner = async () => {
    if (scannerRef.current) {
      try {
        // Pequeno delay para garantir que a câmera está pronta
        await new Promise(resolve => setTimeout(resolve, 300));
        await scannerRef.current.resume();
        setScannerAtivo(true);
        console.log('Scanner retomado');
      } catch (error) {
        console.error('Erro ao resumir scanner:', error);
        // Se não conseguir resumir, reiniciar
        await inicializarScanner();
      }
    }
  };

  const pararScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setScannerAtivo(false);
      } catch (error) {
        console.error('Erro ao parar scanner:', error);
      }
    }
  };

  // Funções de contagem regressiva do modal
  const iniciarContagemRegressiva = () => {
    setContagemRegressiva(tempoModal);
    
    timerRef.current = setInterval(() => {
      setContagemRegressiva((prev) => {
        if (prev === null || prev <= 1) {
          // Tempo esgotado - fechar modal
          limparContagemRegressiva();
          fecharModalERetomarScanner();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const limparContagemRegressiva = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setContagemRegressiva(null);
  };

  const fecharModalERetomarScanner = async () => {
    setShowConfirmationModal(false);
    setConfirmationData(null);
    setIsProcessingScan(false);
    await carregarPresencas();
    await resumirScanner();
  };

  // Função para reiniciar scanner com nova câmera
  const alterarCamera = async (novaCameraId: string) => {
    setCameraSelecionada(novaCameraId);
    localStorage.setItem('cameraSelecionada', novaCameraId);
    
    // Parar scanner atual
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.error('Erro ao parar scanner:', error);
      }
      scannerRef.current = null;
    }
    
    // Reiniciar com nova câmera
    await inicializarScanner();
  };

  const salvarTempoModal = (novoTempo: number) => {
    setTempoModal(novoTempo);
    localStorage.setItem('tempoModal', String(novoTempo));
  };

  const handleConfirmPresenca = async () => {
    if (!confirmationData) return;

    try {
      setConfirmLoading(true);

      // A presença já foi registrada em onScanSuccess
      // Apenas confirmar visualmente
      toast.success(
        confirmationData.status === 'presente' 
          ? 'Entrada registrada com sucesso!' 
          : 'Saída registrada com sucesso!',
        {
          position: 'bottom-right',
        }
      );

      // Fechar modal
      setShowConfirmationModal(false);
      setConfirmationData(null);
      setIsProcessingScan(false);
      
      // Limpar contagem regressiva
      limparContagemRegressiva();

      // Recarregar presenças
      await carregarPresencas();

      // Reiniciar scanner automaticamente
      await resumirScanner();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao confirmar presença',
        { position: 'bottom-right' }
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelPresenca = async () => {
    setShowConfirmationModal(false);
    setConfirmationData(null);
    setIsProcessingScan(false);
    limparContagemRegressiva();
    await resumirScanner();
  };

  const carregarPresencas = async () => {
    try {
      const data = await presencaAPI.getPresencaDia(cursoFiltro || undefined);
      // Limitar a últimas 10 entradas
      setPresencas(data.slice(0, 10));
    } catch (error) {
      console.error('Erro ao carregar presenças:', error);
    }
  };

  const carregarCursos = async () => {
    try {
      const alunos = await alunosAPI.getAll();
      const cursosUnicos = Array.from(new Set(alunos.map(a => a.curso))).sort();
      setCursos(cursosUnicos);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  const limparPresencas = async () => {
    if (!window.confirm('Tem certeza que deseja EXCLUIR TODAS as presenças de HOJE? Esta ação não pode ser desfeita.')) {
      return;
    }
    if (!window.confirm('CONFIRMAÇÃO FINAL: Isso vai excluir todas as presenças de HOJE. Continuar?')) {
      return;
    }

    try {
      await presencaAPI.limparPresencaDia();
      toast.success('Presenças de hoje foram excluídas!', {
        position: 'bottom-right',
      });
      carregarPresencas();
    } catch (error) {
      toast.error('Erro ao limpar presenças', {
        position: 'bottom-right',
      });
    }
  };

  const formatarHora = (data: string) => {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const abrirRelatorioNovaAba = () => {
    // Simular navegação para nova página através do App
    // Será tratado no App.tsx via URL ou localStorage
    const url = new URL(window.location.href);
    url.searchParams.set('navigateTo', 'presenca-qr-relatorio');
    window.open(url.toString(), '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header com botão voltar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Registrar Presença</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarConfiguracoes(!mostrarConfiguracoes)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                mostrarConfiguracoes 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
              title="Configurações"
            >
              <Settings size={20} />
              Configurações
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                <ArrowLeft size={20} />
                Voltar
              </button>
            )}
          </div>
        </div>

        {/* Painel de Configurações */}
        {mostrarConfiguracoes && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seletor de Câmera */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Câmera:
                </label>
                <select
                  value={cameraSelecionada}
                  onChange={(e) => alterarCamera(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {camerasDisponiveis.length === 0 ? (
                    <option value="">Nenhuma câmera encontrada</option>
                  ) : (
                    camerasDisponiveis.map((camera) => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Tempo do Modal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo do modal (segundos):
                </label>
                <input
                  type="number"
                  value={tempoModal}
                  onChange={(e) => salvarTempoModal(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Scanner QR Code</h2>
              <button
                onClick={() => scannerAtivo ? pararScanner() : inicializarScanner()}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  scannerAtivo
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {scannerAtivo ? (
                  <>
                    <CameraOff size={18} />
                    Parar
                  </>
                ) : (
                  <>
                    <Camera size={18} />
                    Iniciar
                  </>
                )}
              </button>
            </div>

            {/* Container do Video */}
            <div
              ref={videoContainerRef}
              className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-900"
              style={{ minHeight: '300px' }}
            >
              {/* Video element que será criado pela biblioteca */}
              <div id="qr-reader-video" className="w-full h-full" />

              {/* Overlay quando não ativo */}
              {!scannerAtivo && !scannerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white">
                  <Camera size={48} className="mb-4 opacity-50" />
                  <p className="text-center px-4">
                    Clique em "Iniciar" para ativar a câmera
                  </p>
                </div>
              )}

              {/* Overlay de erro */}
              {scannerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900 text-white">
                  <CameraOff size={48} className="mb-4" />
                  <p className="text-center px-4 text-sm">{scannerError}</p>
                  <button
                    onClick={inicializarScanner}
                    className="mt-4 px-4 py-2 bg-white text-red-900 rounded-lg font-semibold"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>

            {/* Status do Scanner */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <div
                className={`w-2 h-2 rounded-full ${
                  scannerAtivo ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              <span className="text-gray-600">
                {scannerAtivo ? 'Scanner ativo - Aponte para o QR Code' : 'Scanner inativo'}
              </span>
            </div>

            {loading && (
              <div className="mt-4 text-center text-gray-600">
                <p className="animate-pulse">Processando...</p>
              </div>
            )}
          </div>

          {/* Últimas Entradas */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Últimas Entradas</h2>
              <div className="flex gap-2">
                <button
                  onClick={limparPresencas}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm"
                  title="Limpar presenças de hoje (testes)"
                >
                  <X size={16} />
                  Limpar
                </button>
                <button
                  onClick={abrirRelatorioNovaAba}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                  title="Abrir relatório em nova aba"
                >
                  <ExternalLink size={16} />
                  Relatório
                </button>
              </div>
            </div>

            {/* Filtro de Curso */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Curso:
              </label>
              <select
                value={cursoFiltro}
                onChange={(e) => setCursoFiltro(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os cursos</option>
                {cursos.map((curso) => (
                  <option key={curso} value={curso}>
                    {curso}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista */}
            <div className="space-y-2 flex-1 overflow-y-auto max-h-96">
              {presencas.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">Nenhuma presença registrada</p>
              ) : (
                presencas.map((presenca) => (
                  <div
                    key={presenca._id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {presenca.fotoUrl && (
                          <img
                            src={presenca.fotoUrl}
                            alt={presenca.nome}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{presenca.nome}</p>
                          <p className="text-xs text-gray-600 truncate">{presenca.curso}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            {presenca.dataEntrada && (
                              <span>
                                {formatarHora(presenca.dataEntrada)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            presenca.status === 'presente'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {presenca.status === 'presente' ? 'Ent.' : 'Saída'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600 text-center border-t pt-4">
              Total: {presencas.length} registro(s)
            </div>
          </div>
        </div>

        {/* Modal de Confirmação */}
        {showConfirmationModal && confirmationData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Confirmar Presença
              </h2>

              {/* Dados do Aluno */}
              <div className="space-y-4 mb-8">
                {confirmationData.fotoUrl && (
                  <div className="flex justify-center">
                    <img
                      src={confirmationData.fotoUrl}
                      alt={confirmationData.nome}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                    />
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Nome do Aluno
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {confirmationData.nome}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Curso
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {confirmationData.curso}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Status
                  </label>
                  <p
                    className={`text-lg font-semibold ${
                      confirmationData.status === 'presente'
                        ? 'text-green-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {confirmationData.status === 'presente' ? 'Entrada' : 'Saída'}
                  </p>
                </div>

                {/* Contagem Regressiva */}
                {contagemRegressiva !== null && (
                  <div className="text-center">
                    <p className="text-sm text-orange-600 font-semibold">
                      Esta janela fechará em {contagemRegressiva}s
                    </p>
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelPresenca}
                  disabled={confirmLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition disabled:opacity-50"
                >
                  <X size={20} />
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPresenca}
                  disabled={confirmLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {confirmLoading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
