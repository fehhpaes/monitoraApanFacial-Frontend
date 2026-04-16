import { useState, useEffect } from 'react';
import { presencaAPI, alunosAPI } from '../services/api';
import { Presenca } from '../types/index';
import { ArrowLeft, Printer } from 'lucide-react';

interface AttendanceReportProps {
  onBack?: () => void;
}

export function AttendanceReport({ onBack }: AttendanceReportProps) {
  const [presencasRelatorio, setPresencasRelatorio] = useState<Presenca[]>([]);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const [periodo, setPeriodo] = useState<string>('hoje');
  const [cursoFiltro, setCursoFiltro] = useState<string>('');
  const [alunoFiltro, setAlunoFiltro] = useState<string>('');
  const [cursos, setCursos] = useState<string[]>([]);

  // Carregar cursos ao montar o componente
  useEffect(() => {
    carregarCursos();
  }, []);

  // Carregar relatório quando período ou curso mudar
  useEffect(() => {
    carregarRelatorio();
  }, [periodo, cursoFiltro]);

  // Filtrar relatório por nome de aluno
  useEffect(() => {
    if (alunoFiltro.trim()) {
      setPresencasRelatorio((prev) =>
        prev.filter((p) =>
          p.nome.toLowerCase().includes(alunoFiltro.toLowerCase())
        )
      );
    } else {
      carregarRelatorio();
    }
  }, [alunoFiltro]);

  const carregarCursos = async () => {
    try {
      const alunos = await alunosAPI.getAll();
      const cursosUnicos = Array.from(new Set(alunos.map(a => a.curso))).sort();
      setCursos(cursosUnicos);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  const carregarRelatorio = async () => {
    try {
      setLoadingRelatorio(true);
      const data = await presencaAPI.getRelatorioPeriodos(periodo, cursoFiltro || undefined);
      setPresencasRelatorio(data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      setPresencasRelatorio([]);
    } finally {
      setLoadingRelatorio(false);
    }
  };

  const formatarHora = (data: string) => {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const obterNomePeriodo = (periodo: string): string => {
    const nomes: Record<string, string> = {
      'hoje': 'Hoje',
      'semana': 'Últimos 7 dias',
      'mes': 'Últimos 30 dias',
      'bimestre': 'Últimos 60 dias',
      'trimestre': 'Últimos 90 dias',
      'semestre': 'Últimos 180 dias',
      'ano': 'Últimos 365 dias',
    };
    return nomes[periodo] || periodo;
  };

  const imprimirRelatorio = () => {
    if (presencasRelatorio.length === 0) {
      alert('Nenhum registro de presença encontrado para o período e filtros selecionados');
      return;
    }

    const printWindow = window.open('', '', 'height=600,width=1200');
    if (!printWindow) return;

    const dataGeracao = new Date().toLocaleString('pt-BR');
    const nomePeriodo = obterNomePeriodo(periodo);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Presença</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
          }
          .page {
            page-break-after: always;
            page-break-inside: avoid;
            background: white;
            padding: 20px;
            margin-bottom: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #333;
          }
          .header-info {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            font-size: 13px;
            color: #666;
            margin-top: 10px;
          }
          .header-info div {
            text-align: center;
          }
          .header-info strong {
            display: block;
            color: #333;
            margin-top: 5px;
          }
          .presencas-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 25px;
            margin-bottom: 20px;
          }
          .presenca-card {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .presenca-card-nome {
            font-weight: bold;
            font-size: 14px;
            color: #333;
            margin-bottom: 4px;
          }
          .presenca-card-curso {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
          }
          .presenca-card-foto {
            width: 130px;
            height: 130px;
            border-radius: 4px;
            margin: 0 auto 10px;
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            object-fit: cover;
          }
          .presenca-card-horas {
            font-size: 12px;
            margin-top: 8px;
          }
          .presenca-card-hora-label {
            color: #666;
            display: block;
            font-weight: bold;
            margin-top: 4px;
          }
          .presenca-card-hora-valor {
            color: #333;
            font-size: 13px;
          }
          .footer {
            text-align: right;
            font-size: 11px;
            color: #999;
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          @media print {
            html, body {
              padding: 0;
              background: white;
            }
            .page {
              page-break-after: always;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .presencas-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
          }
        </style>
      </head>
      <body>
    `);

    // Agrupar por curso e ordenar
    const presencasPorCurso = new Map<string, Presenca[]>();
    presencasRelatorio.forEach((presenca) => {
      if (!presencasPorCurso.has(presenca.curso)) {
        presencasPorCurso.set(presenca.curso, []);
      }
      presencasPorCurso.get(presenca.curso)!.push(presenca);
    });

    // Ordenar cada curso alfabeticamente e por curso
    const cursosOrdenados = Array.from(presencasPorCurso.keys()).sort();
    
    cursosOrdenados.forEach((curso) => {
      const presencas = presencasPorCurso.get(curso)!;
      presencas.sort((a, b) => a.nome.localeCompare(b.nome));

      // Dividir em páginas (9 alunos por página = 3x3)
      const paginaSize = 9;
      for (let i = 0; i < presencas.length; i += paginaSize) {
        const presencasPage = presencas.slice(i, i + paginaSize);

        printWindow.document.write(`
          <div class="page">
            <div class="header">
              <h1>Relatório de Presença - MonitoraApan</h1>
              <div class="header-info">
                <div>
                  <strong>Período:</strong>
                  ${nomePeriodo}
                </div>
                <div>
                  <strong>Curso:</strong>
                  ${curso}
                </div>
                <div>
                  <strong>Página ${Math.floor(i / paginaSize) + 1}</strong>
                </div>
              </div>
            </div>

            <div class="presencas-grid">
        `);

        presencasPage.forEach((presenca) => {
          const horaEntrada = presenca.dataEntrada ? formatarHora(presenca.dataEntrada) : 'Não registrada';
          const horaSaida = presenca.dataSaida ? formatarHora(presenca.dataSaida) : 'Pendente';
          const fotoUrl = presenca.fotoUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23ccc%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E';

          printWindow.document.write(`
            <div class="presenca-card">
              <div class="presenca-card-nome">${presenca.nome}</div>
              <div class="presenca-card-curso">${presenca.curso}</div>
              <img src="${fotoUrl}" alt="${presenca.nome}" class="presenca-card-foto" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23ccc%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E'">
              <div class="presenca-card-horas">
                <span class="presenca-card-hora-label">Entrada:</span>
                <span class="presenca-card-hora-valor">${horaEntrada}</span>
                <span class="presenca-card-hora-label" style="margin-top: 6px;">Saída:</span>
                <span class="presenca-card-hora-valor">${horaSaida}</span>
              </div>
            </div>
          `);
        });

        printWindow.document.write(`
            </div>

            <div class="footer">
              <p>Gerado em: ${dataGeracao}</p>
            </div>
          </div>
        `);
      }
    });

    printWindow.document.write(`
      </body>
      </html>
    `);

    printWindow.document.close();

    // Aguardar que o conteúdo seja renderizado
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header com botão voltar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Relatório de Presença</h1>
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Consulta e Impressão de Presenças</h2>
            <button
              onClick={imprimirRelatorio}
              disabled={presencasRelatorio.length === 0 || loadingRelatorio}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-semibold"
            >
              <Printer size={20} />
              {loadingRelatorio ? 'Carregando...' : 'Imprimir Relatório'}
            </button>
          </div>

          {/* Filtros de Relatório */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Filtro de Período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período:
              </label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hoje">Hoje</option>
                <option value="semana">Últimos 7 dias (Semana)</option>
                <option value="mes">Últimos 30 dias (Mês)</option>
                <option value="bimestre">Últimos 60 dias (Bimestre)</option>
                <option value="trimestre">Últimos 90 dias (Trimestre)</option>
                <option value="semestre">Últimos 180 dias (Semestre)</option>
                <option value="ano">Últimos 365 dias (Ano)</option>
              </select>
            </div>

            {/* Filtro de Curso para Relatório */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Curso (opcional):
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

            {/* Filtro de Aluno */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Aluno (opcional):
              </label>
              <input
                type="text"
                value={alunoFiltro}
                onChange={(e) => setAlunoFiltro(e.target.value)}
                placeholder="Digite o nome do aluno..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>{presencasRelatorio.length}</strong> aluno(s) com presença registrada no período selecionado
              {cursoFiltro && ` - ${cursoFiltro}`}
            </p>
            {loadingRelatorio && <p className="text-sm text-blue-600 mt-2 animate-pulse">Carregando dados...</p>}
          </div>

          {/* Lista de Presenças */}
          {presencasRelatorio.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-2 text-left font-semibold">Nome</th>
                    <th className="border px-3 py-2 text-left font-semibold">Curso</th>
                    <th className="border px-3 py-2 text-left font-semibold">Status</th>
                    <th className="border px-3 py-2 text-left font-semibold">Entrada</th>
                    <th className="border px-3 py-2 text-left font-semibold">Saída</th>
                  </tr>
                </thead>
                <tbody>
                  {presencasRelatorio.map((presenca) => (
                    <tr key={presenca._id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{presenca.nome}</td>
                      <td className="border px-3 py-2">{presenca.curso}</td>
                      <td className="border px-3 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            presenca.status === 'presente'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {presenca.status === 'presente' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="border px-3 py-2">
                        {presenca.dataEntrada ? formatarHora(presenca.dataEntrada) : '-'}
                      </td>
                      <td className="border px-3 py-2">
                        {presenca.dataSaida ? formatarHora(presenca.dataSaida) : 'Pendente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {presencasRelatorio.length === 0 && !loadingRelatorio && (
            <p className="text-center text-gray-500 py-8">
              Nenhum registro de presença encontrado para o período selecionado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
