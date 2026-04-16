import { useState } from 'react';
import { X } from 'lucide-react';
import { Funcionario, UpdateFuncionarioPayload } from '../types/index';
import CameraCapture from './CameraCapture';
import { funcionariosAPI } from '../services/api';
import { toast } from 'react-toastify';

interface ModalEditarFuncionarioProps {
  funcionario: Funcionario;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarFuncionario({ funcionario, onClose, onSuccess }: ModalEditarFuncionarioProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: funcionario.nome,
    cargo: funcionario.cargo,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCaptureFoto = (imageSrc: string) => {
    setFotoCapturada(imageSrc);
    setShowCamera(false);
    toast.success('Foto capturada com sucesso!');
  };

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.cargo.trim()) newErrors.cargo = 'Cargo é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error('Por favor, corrija os erros do formulário');
      return;
    }

    setCarregando(true);

    try {
      let fotoUrl = funcionario.fotoUrl;
      let fotoPublicId = funcionario.fotoPublicId;

      if (fotoCapturada) {
        const fotoResponse = await funcionariosAPI.uploadFoto(fotoCapturada);
        fotoUrl = fotoResponse.url;
        fotoPublicId = fotoResponse.publicId;
      }

      const updateData: UpdateFuncionarioPayload = {
        nome: formData.nome,
        cargo: formData.cargo,
        fotoUrl,
        fotoPublicId,
      };

      await funcionariosAPI.update(funcionario._id, updateData);

      toast.success('Funcionário atualizado com sucesso!');
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      const mensagem = error.response?.data?.message || 'Erro ao atualizar funcionário';
      toast.error(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Editar Funcionário
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.nome ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.cargo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cargo && <p className="text-red-500 text-xs mt-1">{errors.cargo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto
            </label>
            {fotoCapturada ? (
              <div className="relative inline-block">
                <img
                  src={fotoCapturada}
                  alt="Nova foto"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-green-500"
                />
                <button
                  type="button"
                  onClick={() => setFotoCapturada(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <img
                  src={funcionario.fotoUrl}
                  alt="Foto atual"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  Trocar Foto
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {carregando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>

        {showCamera && (
          <CameraCapture
            onCapture={handleCaptureFoto}
            onClose={() => setShowCamera(false)}
          />
        )}
      </div>
    </div>
  );
}