import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode.react';
import { alunosAPI } from '../services/api';
import { Aluno } from '../types/index';
import { ArrowLeft } from 'lucide-react';

interface ImpressaoQRProps {
  onBack?: () => void;
}

export function ImpressaoQR({ onBack }: ImpressaoQRProps) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosFiltrados, setAlunosFiltrados] = useState<Aluno[]>([]);
  const [cursos, setCursos] = useState<string[]>([]);
  const [cursoSelecionado, setCursoSelecionado] = useState<string>('');
  const [busca, setBusca] = useState<string>('');
  const qrGridRef = useRef<HTMLDivElement>(null);

  // Carregar alunos ao montar o componente
  useEffect(() => {
    carregarAlunos();
  }, []);

  // Filtrar alunos
  useEffect(() => {
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
  }, [alunos, cursoSelecionado, busca]);

  const carregarAlunos = async () => {
    try {
      const data = await alunosAPI.getAll();
      setAlunos(data);

      // Extrair cursos únicos
      const cursosUnicos = Array.from(new Set(data.map((a) => a.curso))).sort();
      setCursos(cursosUnicos);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  };

  const imprimirQRCodes = () => {
    if (!qrGridRef.current) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Impressão de QR Codes</title>');
    printWindow.document.write(`
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          text-align: center;
          margin-bottom: 30px;
        }
        .qr-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          page-break-inside: avoid;
        }
        .qr-item {
          text-align: center;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .qr-item img {
          max-width: 200px;
          height: auto;
        }
        .qr-nome {
          font-size: 12px;
          font-weight: bold;
          margin-top: 10px;
          word-wrap: break-word;
        }
        .qr-curso {
          font-size: 10px;
          color: #666;
          margin-top: 5px;
        }
        @media print {
          body {
            margin: 10px;
          }
          .qr-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }
      </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>QR Codes - Controle de Presença</h1>');
    printWindow.document.write('<div class="qr-grid">');

    alunosFiltrados.forEach((aluno) => {
      if (!aluno.qrCodeUrl) return;

      const qrData = JSON.stringify({
        _id: aluno._id,
        nome: aluno.nome,
        curso: aluno.curso,
        fotoUrl: aluno.fotoUrl,
        emailResponsavel: aluno.emailResponsavel,
        geradoEm: new Date().toISOString(),
      });

      // Gerar QR Code localmente para impressão
      const canvas = document.getElementById(`qr-${aluno._id}`) as HTMLCanvasElement;
      if (canvas) {
        const imageUrl = canvas.toDataURL('image/png');
        printWindow.document.write(`
          <div class="qr-item">
            <img src="${imageUrl}" alt="QR Code ${aluno.nome}" />
            <div class="qr-nome">${aluno.nome}</div>
            <div class="qr-curso">${aluno.curso}</div>
          </div>
        `);
      }
    });

    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Aguardar que o conteúdo seja renderizado
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const downloadQRCode = (aluno: Aluno) => {
    const canvas = document.getElementById(`qr-${aluno._id}`) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `QR-${aluno.nome}.png`;
      link.click();
    }
  };

  const downloadTodosPDF = async () => {
    // Implementar download de PDF com múltiplos QR codes
    alert('Funcionalidade de download em PDF em desenvolvimento');
  };

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

          {/* Controles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Filtro de Curso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Curso:
              </label>
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
                placeholder="Nome do aluno..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-2">
              <button
                onClick={imprimirQRCodes}
                disabled={alunosFiltrados.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
              >
                Imprimir QR Codes
              </button>
              <button
                onClick={downloadTodosPDF}
                disabled={alunosFiltrados.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-semibold"
              >
                Download PDF
              </button>
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800">
              <strong>{alunosFiltrados.length}</strong> QR Code(s) encontrado(s)
              {cursoSelecionado && ` - ${cursoSelecionado}`}
            </p>
          </div>
        </div>

        {/* Grid de QR Codes */}
        <div
          ref={qrGridRef}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {alunosFiltrados.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">
                Nenhum QR Code encontrado. Gere QR Codes para alunos primeiro.
              </p>
            </div>
          ) : (
            alunosFiltrados.map((aluno) => (
              <div
                key={aluno._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
              >
                {/* QR Code */}
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

                {/* QR Code Hidden para Impressão */}
                <div style={{ display: 'none' }}>
                  <QRCode
                    id={`qr-${aluno._id}`}
                    value={JSON.stringify({
                      _id: aluno._id,
                      nome: aluno.nome,
                      curso: aluno.curso,
                      fotoUrl: aluno.fotoUrl,
                      emailResponsavel: aluno.emailResponsavel,
                      geradoEm: new Date().toISOString(),
                    })}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                {/* Informações */}
                <h3 className="font-bold text-gray-800 mb-1 truncate">{aluno.nome}</h3>
                <p className="text-sm text-gray-600 mb-4">{aluno.curso}</p>

                {/* Botões */}
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadQRCode(aluno)}
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
    </div>
  );
}
