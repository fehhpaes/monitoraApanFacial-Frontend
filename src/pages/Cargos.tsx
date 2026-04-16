import { useState, useEffect } from 'react';
import { Cargo } from '../types/index';
import { cargosAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Loader, Plus, ArrowLeft, Trash2 } from 'lucide-react';

interface CargosPageProps {
  onBack: () => void;
}

export default function CargosPage({ onBack }: CargosPageProps) {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novoCargo, setNovoCargo] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarCargos();
  }, []);

  const carregarCargos = async () => {
    try {
      setCarregando(true);
      const cargosDoBackend = await cargosAPI.getAll();
      setCargos(cargosDoBackend);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
      toast.error('Erro ao carregar cargos');
    } finally {
      setCarregando(false);
    }
  };

  const criarCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCargo.trim()) return;

    try {
      setSalvando(true);
      await cargosAPI.create(novoCargo.trim());
      toast.success('Cargo criado com sucesso!');
      setNovoCargo('');
      carregarCargos();
    } catch (error: any) {
      const mensagem = error.response?.data?.message || 'Erro ao criar cargo';
      toast.error(mensagem);
    } finally {
      setSalvando(false);
    }
  };

  const deletarCargo = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este cargo?')) return;

    try {
      await cargosAPI.delete(id);
      toast.success('Cargo deletado com sucesso!');
      carregarCargos();
    } catch (error: any) {
      const mensagem = error.response?.data?.message || 'Erro ao deletar cargo';
      toast.error(mensagem);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-4 md:p-8">
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
              💼 Cadastro de Cargos
            </h1>
            <p className="text-gray-600 text-lg">
              Gerencie todos os cargos do sistema
            </p>
          </div>
        </div>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-gray-600 font-semibold">Carregando cargos...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Novo Cargo
                </h2>
                <form onSubmit={criarCargo}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Cargo
                    </label>
                    <input
                      type="text"
                      value={novoCargo}
                      onChange={(e) => setNovoCargo(e.target.value)}
                      placeholder="Ex: Professor, Coordenador, Secretário..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={salvando || !novoCargo.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {salvando ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        Adicionar Cargo
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Cargos Cadastrados
              </h2>

              {cargos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Nenhum cargo cadastrado ainda
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Crie um novo cargo para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cargos.map((cargo) => (
                    <div
                      key={cargo._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {cargo.nome}
                        </h3>
                      </div>
                      <button
                        onClick={() => deletarCargo(cargo._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Deletar cargo"
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
    </div>
  );
}