import { useState } from 'react';
import { Aluno, Curso } from '../types/index';
import CardAluno from './CardAluno';
import ModalEditar from './ModalEditar';
import { alunosAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Trash2, AlertCircle } from 'lucide-react';

interface GaleriaAlunosProps {
  alunos: Aluno[];
  cursos: Curso[];
  onAlunoDeleted: () => void;
}

export default function GaleriaAlunos({ alunos, cursos, onAlunoDeleted }: GaleriaAlunosProps) {
  const [alunoEditando, setAlunoEditando] = useState<Aluno | null>(null);
  const [alunoParaDeletar, setAlunoParaDeletar] = useState<string | null>(null);
  const [carregandoDeletar, setCarregandoDeletar] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');

  const handleEditClick = (aluno: Aluno) => {
    setAlunoEditando(aluno);
  };

  const handleDeleteClick = (id: string) => {
    setAlunoParaDeletar(id);
  };

  const confirmDelete = async () => {
    if (!alunoParaDeletar) return;

    setCarregandoDeletar(true);
    try {
      await alunosAPI.delete(alunoParaDeletar);
      toast.success('Aluno deletado com sucesso!');
      setAlunoParaDeletar(null);
      onAlunoDeleted();
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      toast.error('Erro ao deletar aluno. Tente novamente.');
    } finally {
      setCarregandoDeletar(false);
    }
  };

  // Função para contar alunos por curso
  const contarAlunosPorCurso = (nomeCurso: string): number => {
    return alunos.filter(a => a.curso === nomeCurso).length;
  };

  // Função para contar alunos por tipo
  const contarAlunosPorTipo = (tipo: string): number => {
    return alunos.filter(aluno => {
      const cursoObj = cursos.find(c => c.nome === aluno.curso);
      return cursoObj && cursoObj.tipo === tipo;
    }).length;
  };

  // Lógica de filtragem combinada
  const alunosFiltrados = alunos.filter((aluno) => {
    // Filtro por busca de texto (mantém o existente)
    if (filtro && !aluno.nome.toLowerCase().includes(filtro.toLowerCase()) && 
        !aluno.curso.toLowerCase().includes(filtro.toLowerCase())) {
      return false;
    }

    // Filtro por curso selecionado
    if (selectedCurso && aluno.curso !== selectedCurso) {
      return false;
    }

    // Filtro por tipo de curso
    if (selectedTipo) {
      const cursoObj = cursos.find(c => c.nome === aluno.curso);
      if (!cursoObj || cursoObj.tipo !== selectedTipo) {
        return false;
      }
    }

    return true;
  });

  if (alunos.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-gray-400 mb-2">
          <div className="text-5xl mb-2">📚</div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum aluno cadastrado</h3>
        <p className="text-gray-600">Comece adicionando o primeiro aluno usando o formulário ao lado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Alunos Cadastrados ({alunosFiltrados.length})
        </h2>

        {/* Seção de Filtros */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4 flex flex-col md:flex-row gap-3">
          {/* Filtro Curso */}
          <select
            value={selectedCurso}
            onChange={(e) => setSelectedCurso(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">📚 Todos os Cursos</option>
            {cursos.map(curso => (
              <option key={curso._id} value={curso.nome}>
                {curso.nome} ({contarAlunosPorCurso(curso.nome)} alunos)
              </option>
            ))}
          </select>

          {/* Filtro Tipo */}
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">📅 Todos os Tipos</option>
            <option value="modular">Modular ({contarAlunosPorTipo('modular')} alunos)</option>
            <option value="integral">Integral ({contarAlunosPorTipo('integral')} alunos)</option>
          </select>

          {/* Botão Reset */}
          <button
            onClick={() => {
              setSelectedCurso('');
              setSelectedTipo('');
              setFiltro('');
            }}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition whitespace-nowrap"
          >
            🔄 Reset
          </button>
        </div>

        {/* Busca por Texto */}
        <input
          type="text"
          placeholder="🔍 Buscar por nome ou curso..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alunosFiltrados.map((aluno) => (
          <CardAluno
            key={aluno._id}
            aluno={aluno}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {/* Modal de Edição */}
      {alunoEditando && (
        <ModalEditar
          aluno={alunoEditando}
          cursos={cursos}
          onClose={() => setAlunoEditando(null)}
          onSuccess={() => {
            setAlunoEditando(null);
            onAlunoDeleted();
          }}
        />
      )}

      {/* Modal de Confirmação de Deleção */}
      {alunoParaDeletar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={28} />
              <h3 className="text-lg font-bold text-gray-800">Confirmar Deleção</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar este aluno? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setAlunoParaDeletar(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={carregandoDeletar}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                {carregandoDeletar ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
