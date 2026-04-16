import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { alunosAPI, funcionariosAPI } from '../services/api';
import { Aluno, Funcionario } from '../types/index';
import { ArrowLeft, Download } from 'lucide-react';

interface ImpressaoQRProps {
  onBack?: () => void;
}

type TipoPessoa = 'alunos' | 'funcionarios';

export function ImpressaoQR({ onBack }: ImpressaoQRProps) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [alunosFiltrados, setAlunosFiltrados] = useState<Aluno[]>([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState<Funcionario[]>([]);
  const [cursos, setCursos] = useState<string[]>([]);
  const [cargos, setCargos] = useState<string[]>([]);
  const [cursoSelecionado, setCursoSelecionado] = useState<string>('');
  const [cargoSelecionado, setCargoSelecionado] = useState<string>('');
  const [busca, setBusca] = useState<string>('');
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>('alunos');
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const qrGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    filtrarDados();
  }, [alunos, funcionarios, cursoSelecionado, cargoSelecionado, busca, tipoPessoa]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const carregarDados = async () => {
    try {
      const [alunosData, funcionariosData] = await Promise.all([
        alunosAPI.getAll(),
        funcionariosAPI.getAll(),
      ]);
      setAlunos(alunosData);
      setFuncionarios(funcionariosData);

      const cursosUnicos = Array.from(new Set(alunosData.map((a) => a.curso))).sort();
      setCursos(cursosUnicos);

      const cargosUnicos = Array.from(new Set(funcionariosData.map((f) => f.cargo))).sort();
      setCargos(cargosUnicos);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const filtrarDados = () => {
    if (tipoPessoa === 'alunos') {
      let filtrados = alunos.filter((aluno) => aluno.qrCodeGerado);
      if (cursoSelecionado) {
        filtrados = filtrados.filter((aluno) => aluno.curso === cursoSelecionado);
      }
      if (busca) {
        filtrados = filtrados.filter((aluno) =>
          aluno.nome.toLowerCase().includes(busca.toLowerCase())
        );
      }
      setAlunosFiltrados(filtrados);
    } else {
      let filtrados = funcionarios.filter((f) => f.qrCodeGerado);
      if (cargoSelecionado) {
        filtrados = filtrados.filter((f) => f.cargo === cargoSelecionado);
      }
      if (busca) {
        filtrados = filtrados.filter((f) =>
          f.nome.toLowerCase().includes(busca.toLowerCase())
        );
      }
      setFuncionariosFiltrados(filtrados);
    }
  };

  const downloadQRCode = async (item: Aluno | Funcionario, e: React.MouseEvent) => {
    e.preventDefault();
    if (!item.qrCodeUrl) return;

    try {
      const response = await fetch(item.qrCodeUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `QR-${item.nome}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setToastMessage('QR Code baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
      setToastMessage('Erro ao baixar QR Code');
    }
  };

  const downloadQRCodesZip = async () => {
    setIsDownloadingZip(true);

    try {
      const zip = new JSZip();
      const items = tipoPessoa === 'alunos' ? alunosFiltrados : funcionariosFiltrados;
      const filtroNome = tipoPessoa === 'alunos' ? cursoSelecionado : cargoSelecionado;
      const date = new Date().toISOString().split('T')[0];

      for (const item of items) {
        if (!item.qrCodeUrl) continue;

        try {
          const response = await fetch(item.qrCodeUrl);
          const blob = await response.blob();
          const fileName = `QR-${item.nome}.png`;
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Erro ao baixar QR de ${item.nome}:`, error);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `QR-${tipoPessoa}-${filtroNome || 'Todos'}-${date}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setToastMessage(`${items.length} QR Code(s) baixado(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao criar ZIP:', error);
      setToastMessage('Erro ao criar arquivo ZIP');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const totalItems = tipoPessoa === 'alunos' ? alunosFiltrados.length : funcionariosFiltrados.length;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Impressão de QR Codes</h1>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Seletor de Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo:
              </label>
              <select
                value={tipoPessoa}
                onChange={(e) => setTipoPessoa(e.target.value as TipoPessoa)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alunos">Alunos</option>
                <option value="funcionarios">Funcionários</option>
              </select>
            </div>

            {/* Filtro de Curso/Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por {tipoPessoa === 'alunos' ? 'Curso' : 'Cargo'}:
              </label>
              {tipoPessoa === 'alunos' ? (
                <select
                  value={cursoSelecionado}
                  onChange={(e) => setCursoSelecionado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os cursos</option>
                  {cursos.map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={cargoSelecionado}
                  onChange={(e) => setCargoSelecionado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os cargos</option>
                  {cargos.map((cargo) => (
                    <option key={cargo} value={cargo}>
                      {cargo}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Busca por Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Nome:
              </label>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={`Nome do ${tipoPessoa === 'alunos' ? 'aluno' : 'funcionário'}...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-2">
              <button
                onClick={downloadQRCodesZip}
                disabled={totalItems === 0 || isDownloadingZip}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Download size={18} />
                {isDownloadingZip ? 'Baixando...' : 'Download ZIP'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800">
              <strong>{totalItems}</strong> QR Code(s) encontrado(s)
              {(tipoPessoa === 'alunos' ? cursoSelecionado : cargoSelecionado) && 
                ` - ${tipoPessoa === 'alunos' ? cursoSelecionado : cargoSelecionado}`}
            </p>
          </div>
        </div>

        <div
          ref={qrGridRef}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {totalItems === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">
                Nenhum QR Code encontrado. Gere QR Codes para {tipoPessoa} primeiro.
              </p>
            </div>
          ) : tipoPessoa === 'alunos' ? (
            alunosFiltrados.map((aluno) => (
              <div
                key={aluno._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
              >
                {aluno.qrCodeUrl ? (
                  <img
                    src={aluno.qrCodeUrl}
                    alt={`QR Code ${aluno.nome}`}
                    className="w-full mb-3 border border-gray-200 rounded"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 rounded border border-gray-300 flex items-center justify-center mb-3">
                    <p className="text-gray-400 text-sm">QR indisponível</p>
                  </div>
                )}
                <h3 className="font-bold text-gray-800 mb-1 truncate">{aluno.nome}</h3>
                <p className="text-sm text-gray-600 mb-4">{aluno.curso}</p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => downloadQRCode(aluno, e)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))
          ) : (
            funcionariosFiltrados.map((funcionario) => (
              <div
                key={funcionario._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
              >
                {funcionario.qrCodeUrl ? (
                  <img
                    src={funcionario.qrCodeUrl}
                    alt={`QR Code ${funcionario.nome}`}
                    className="w-full mb-3 border border-gray-200 rounded"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 rounded border border-gray-300 flex items-center justify-center mb-3">
                    <p className="text-gray-400 text-sm">QR indisponível</p>
                  </div>
                )}
                <h3 className="font-bold text-gray-800 mb-1 truncate">{funcionario.nome}</h3>
                <p className="text-sm text-gray-600 mb-4">{funcionario.cargo}</p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => downloadQRCode(funcionario, e)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          {toastMessage}
        </div>
      )}
    </div>
  );
}