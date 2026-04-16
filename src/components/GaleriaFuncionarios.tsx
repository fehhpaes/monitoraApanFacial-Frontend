import { useState } from 'react';
import { Funcionario } from '../types/index';
import { funcionariosAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Trash2, QrCode, Edit } from 'lucide-react';
import ModalEditarFuncionario from './ModalEditarFuncionario';

interface GaleriaFuncionariosProps {
  funcionarios: Funcionario[];
  onFuncionarioDeleted: () => void;
}

export default function GaleriaFuncionarios({ funcionarios, onFuncionarioDeleted }: GaleriaFuncionariosProps) {
  const [funcionarioEditando, setFuncionarioEditando] = useState<Funcionario | null>(null);
  const [funcionarioParaDeletar, setFuncionarioParaDeletar] = useState<string | null>(null);
  const [carregandoDeletar, setCarregandoDeletar] = useState(false);
  const [filtro, setFiltro] = useState('');

  const handleEditClick = (funcionario: Funcionario) => {
    setFuncionarioEditando(funcionario);
  };

  const handleDeleteClick = (id: string) => {
    setFuncionarioParaDeletar(id);
  };

  const handleGenerateQRCode = async (id: string) => {
    try {
      await funcionariosAPI.generateQRCode(id);
      toast.success('QR Code gerado com sucesso!');
      onFuncionarioDeleted();
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error('Erro ao gerar QR Code. Tente novamente.');
    }
  };

  const handleDeleteQRCode = async (id: string) => {
    try {
      await funcionariosAPI.deleteQRCode(id);
      toast.success('QR Code deletado com sucesso!');
      onFuncionarioDeleted();
    } catch (error) {
      console.error('Erro ao deletar QR Code:', error);
      toast.error('Erro ao deletar QR Code. Tente novamente.');
    }
  };

  const confirmDelete = async () => {
    if (!funcionarioParaDeletar) return;

    setCarregandoDeletar(true);
    try {
      await funcionariosAPI.delete(funcionarioParaDeletar);
      toast.success('Funcionário deletado com sucesso!');
      setFuncionarioParaDeletar(null);
      onFuncionarioDeleted();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar funcionário. Tente novamente.');
    } finally {
      setCarregandoDeletar(false);
    }
  };

  const funcionariosFiltrados = funcionarios.filter((funcionario) => {
    if (filtro && !funcionario.nome.toLowerCase().includes(filtro.toLowerCase()) && 
        !funcionario.cargo.toLowerCase().includes(filtro.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Funcionários Cadastrados
        </h2>
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nome ou cargo..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {funcionariosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {filtro ? 'Nenhum funcionário encontrado na busca' : 'Nenhum funcionário cadastrado ainda'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {funcionariosFiltrados.map((funcionario) => (
            <div
              key={funcionario._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
            >
              <div className="flex items-start gap-3">
                <img
                  src={funcionario.fotoUrl}
                  alt={funcionario.nome}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {funcionario.nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {funcionario.cargo}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEditClick(funcionario)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(funcionario._id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
                >
                  <Trash2 size={16} />
                  Deletar
                </button>
              </div>

              <div className="mt-2">
                {funcionario.qrCodeGerado &&funcionario.qrCodeUrl ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={funcionario.qrCodeUrl}
                      alt="QR Code"
                      className="w-16 h-16 object-contain border"
                    />
                    <button
                      onClick={() => handleDeleteQRCode(funcionario._id)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Deletar QR
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateQRCode(funcionario._id)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition"
                  >
                    <QrCode size={16} />
                    Gerar QR Code
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {funcionarioEditando && (
        <ModalEditarFuncionario
          funcionario={funcionarioEditando}
          onClose={() => setFuncionarioEditando(null)}
          onSuccess={() => {
            setFuncionarioEditando(null);
            onFuncionarioDeleted();
          }}
        />
      )}

      {funcionarioParaDeletar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Confirmar Deleção
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar este funcionário? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setFuncionarioParaDeletar(null)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={carregandoDeletar}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
              >
                {carregandoDeletar ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}