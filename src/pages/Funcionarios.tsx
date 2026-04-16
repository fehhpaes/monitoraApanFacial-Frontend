import { useEffect, useState } from 'react';
import FormCadastroFuncionario from '../components/FormCadastroFuncionario';
import GaleriaFuncionarios from '../components/GaleriaFuncionarios';
import { Funcionario, Cargo } from '../types/index';
import { funcionariosAPI, cargosAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Loader, ArrowLeft } from 'lucide-react';

interface FuncionariosPageProps {
  onBack: () => void;
}

export default function FuncionariosPage({ onBack }: FuncionariosPageProps) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      try {
        const cargosDoBackend = await cargosAPI.getAll();
        setCargos(cargosDoBackend);
      } catch (error) {
        console.error('Erro ao carregar cargos:', error);
        toast.warning('Erro ao carregar cargos do servidor');
        setCargos([]);
      }

      const dados = await funcionariosAPI.getAll();
      setFuncionarios(dados);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-8">
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
              👨‍💼 Funcionários
            </h1>
            <p className="text-gray-600 text-lg">
              Sistema de Cadastro de Funcionários
            </p>
          </div>
        </div>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-gray-600 font-semibold">Carregando funcionários...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <FormCadastroFuncionario
                cargos={cargos}
                onSuccess={carregarDados}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <GaleriaFuncionarios
              funcionarios={funcionarios}
              onFuncionarioDeleted={carregarDados}
            />
          </div>
        </div>
      )}
    </div>
  );
}