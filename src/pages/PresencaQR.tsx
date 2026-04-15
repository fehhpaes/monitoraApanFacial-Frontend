import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { presencaAPI, alunosAPI } from '../services/api';
import { Presenca } from '../types/index';
import { ArrowLeft } from 'lucide-react';

interface ScanResult {
  status: 'success' | 'error';
  message: string;
  presenca?: Presenca;
  alreadyRegistered?: boolean;
}

interface PresencaQRProps {
  onBack?: () => void;
}

export function PresencaQR({ onBack }: PresencaQRProps) {
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cursoFiltro, setCursoFiltro] = useState<string>('');
  const [cursos, setCursos] = useState<string[]>([]);
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

      // Enviar para o backend
      const result = await presencaAPI.registrar({
        qrData: decodedText,
      });

      setScanResult({
        status: 'success',
        message: 'Presença registrada com sucesso!',
        presenca: result,
      });

      // Recarregar presenças
      setTimeout(() => {
        carregarPresencas();
        resumirScanner();
        setScanResult(null);
      }, 2000);
    } catch (error) {
      setScanResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao registrar presença',
      });

      setTimeout(() => {
        resumirScanner();
      }, 2000);
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

  const carregarPresencas = async () => {
    try {
      const data = await presencaAPI.getPresencaDia(cursoFiltro || undefined);
      setPresencas(data);
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header com botão voltar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Controle de Presença</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Scanner QR Code</h2>
            
            <div ref={containerRef}>
              <div id="qr-scanner-container" className="rounded-lg overflow-hidden border border-gray-300" />
            </div>

            {scanResult && (
              <div
                className={`mt-4 p-4 rounded-lg text-white ${
                  scanResult.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                <p className="font-semibold">{scanResult.message}</p>
                {scanResult.presenca && (
                  <div className="mt-2 text-sm">
                    <p>Aluno: {scanResult.presenca.nome}</p>
                    <p>Status: {scanResult.presenca.status === 'presente' ? 'Entrada' : 'Saída'}</p>
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="mt-4 text-center text-gray-600">
                <p className="animate-pulse">Processando...</p>
              </div>
            )}
          </div>

          {/* Lista de Presenças */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Presenças do Dia</h2>

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
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {presencas.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma presença registrada</p>
              ) : (
                presencas.map((presenca) => (
                  <div
                    key={presenca._id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{presenca.nome}</p>
                        <p className="text-sm text-gray-600">{presenca.curso}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          {presenca.dataEntrada && (
                            <span>
                              Entrada: {formatarHora(presenca.dataEntrada)}
                            </span>
                          )}
                          {presenca.dataSaida && (
                            <span>
                              Saída: {formatarHora(presenca.dataSaida)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            presenca.status === 'presente'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {presenca.status === 'presente' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600 text-center">
              Total: {presencas.length} registro(s)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
