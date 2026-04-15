import { useEffect, useState } from 'react';
import FormCadastro from '../components/FormCadastro';
import GaleriaAlunos from '../components/GaleriaAlunos';
import ModalCurso from '../components/ModalCurso';
import { Aluno, Curso } from '../types/index';
import { alunosAPI, cursosAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Loader, Plus, ArrowLeft } from 'lucide-react';

interface AlunosPageProps {
  onBack: () => void;
}

export default function AlunosPage({ onBack }: AlunosPageProps) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [showModalCurso, setShowModalCurso] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      // Carregar cursos
      try {
        const cursosDoBackend = await cursosAPI.getAll();
        setCursos(cursosDoBackend);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        toast.warning('Erro ao carregar cursos do servidor');
        setCursos([]);
      }

      // Carregar alunos
      const dados = await alunosAPI.getAll();
      setAlunos(dados);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              🎓 MonitoraApan
            </h1>
            <p className="text-gray-600 text-lg">
              Sistema de Cadastro de Alunos
            </p>
          </div>
        </div>
        
        {/* Botão de Adicionar Curso */}
        {!carregando && (
          <button
            onClick={() => setShowModalCurso(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2 h-fit"
          >
            <Plus size={20} />
            Novo Curso
          </button>
        )}
      </div>

      {/* Conteúdo Principal */}
      {carregando ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-gray-600 font-semibold">Carregando alunos...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <FormCadastro
                cursos={cursos}
                onSuccess={carregarDados}
              />
            </div>
          </div>

          {/* Coluna Direita - Galeria */}
          <div className="lg:col-span-2">
            <GaleriaAlunos
              alunos={alunos}
              cursos={cursos}
              onAlunoDeleted={carregarDados}
            />
          </div>
        </div>
      )}

      {/* Modal de Adicionar Curso */}
      <ModalCurso
        isOpen={showModalCurso}
        onClose={() => setShowModalCurso(false)}
        onSuccess={() => {
          setShowModalCurso(false);
          carregarDados();
        }}
      />
    </div>
  );
}
