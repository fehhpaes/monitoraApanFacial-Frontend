import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { presencaAPI, alunosAPI } from '../services/api';
import { Presenca } from '../types/index';
import { ArrowLeft, ExternalLink, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface ConfirmationData {
  nome: string;
  curso: string;
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
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Carregar presenças do dia ao montar o componente
  useEffect(() => {
    carregarPresencas();
    carregarCursos();
    inicializarScanner();

    return () => {
      // Limpar scanner ao desmontar
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {
          // Scanner já foi limpo
        });
      }
    };
  }, []);

  // Atualizar presenças quando o filtro de curso mudar
  useEffect(() => {
    carregarPresencas();
  }, [cursoFiltro]);

  const inicializarScanner = () => {
    if (!containerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      'qr-scanner-container',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;
  };

  const onScanSuccess = async (decodedText: string) => {
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
        status: result.status === 'presente' ? 'presente' : 'saida',
        qrData: decodedText,
      });
      setShowConfirmationModal(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao ler QR code',
        { position: 'bottom-right' }
      );
      resumirScanner();
    } finally {
      setLoading(false);
    }
  };

  const onScanError = (error: string) => {
    // Silenciar erros de scan contínuo
    if (!error.includes('No QR code found')) {
      console.error('Erro de scanner:', error);
    }
  };

  const resumirScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.resume();
      } catch (error) {
        console.error('Erro ao resumir scanner:', error);
      }
    }
  };

  const handleConfirmPresenca = async () => {
    if (!confirmationData) return;

    try {
      setConfirmLoading(true);

      // Registrar presença de fato
      await presencaAPI.registrar({
        qrData: confirmationData.qrData,
      });

      toast.success('Presença registrada com sucesso!', {
        position: 'bottom-right',
      });

      // Fechar modal
      setShowConfirmationModal(false);
      setConfirmationData(null);

      // Recarregar presenças
      await carregarPresencas();

      // Reiniciar scanner automaticamente
      await resumirScanner();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao registrar presença',
        { position: 'bottom-right' }
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelPresenca = async () => {
    setShowConfirmationModal(false);
    setConfirmationData(null);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Scanner QR Code</h2>
            
            <div ref={containerRef}>
              <div id="qr-scanner-container" className="rounded-lg overflow-hidden border border-gray-300" />
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
              <button
                onClick={abrirRelatorioNovaAba}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                title="Abrir relatório em nova aba"
              >
                <ExternalLink size={16} />
                Relatório
              </button>
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
