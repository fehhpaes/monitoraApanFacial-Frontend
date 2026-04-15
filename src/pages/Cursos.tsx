import { useState, useEffect } from 'react';
import FormCurso from '../components/FormCurso';
import ModalCurso from '../components/ModalCurso';
import { cursosAPI } from '../services/api';
import { Curso } from '../types/index';
import { toast } from 'react-toastify';
import { Loader, Plus, ArrowLeft, Trash2 } from 'lucide-react';

interface CursosPageProps {
  onBack: () => void;
}

export default function CursosPage({ onBack }: CursosPageProps) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [showModalCurso, setShowModalCurso] = useState(false);

  useEffect(() => {
    carregarCursos();
  }, []);

  const carregarCursos = async () => {
    try {
      setCarregando(true);
      const cursosDoBackend = await cursosAPI.getAll();
      setCursos(cursosDoBackend);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      toast.error('Erro ao carregar cursos');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-8">
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
              📚 Cadastro de Cursos
            </h1>
            <p className="text-gray-600 text-lg">
              Gerencie todos os cursos do sistema
            </p>
          </div>
        </div>

        {/* Botão de Adicionar Curso */}
        {!carregando && (
          <button
            onClick={() => setShowModalCurso(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2 h-fit"
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
            <p className="text-gray-600 font-semibold">Carregando cursos...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <FormCurso
                onSuccess={() => {
                  setShowModalCurso(false);
                  carregarCursos();
                }}
                onClose={() => setShowModalCurso(false)}
              />
            </div>
          </div>

          {/* Coluna Direita - Lista de Cursos */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Cursos Cadastrados
              </h2>

              {cursos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Nenhum curso cadastrado ainda
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Crie um novo curso para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cursos.map((curso, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {curso.nome}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Sigla: {curso.sigla || 'N/A'} • Tipo: {curso.tipo || 'N/A'}
                        </p>
                      </div>
                      <button
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Deletar curso"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Curso */}
      <ModalCurso
        isOpen={showModalCurso}
        onClose={() => setShowModalCurso(false)}
        onSuccess={() => {
          setShowModalCurso(false);
          carregarCursos();
        }}
      />
    </div>
  );
}
