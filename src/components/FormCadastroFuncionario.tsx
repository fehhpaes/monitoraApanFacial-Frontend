import { useState } from 'react';
import { Camera } from 'lucide-react';
import { funcionariosAPI } from '../services/api';
import { CreateFuncionarioPayload, Cargo } from '../types/index';
import CameraCapture from './CameraCapture';
import { toast } from 'react-toastify';

interface FormCadastroFuncionarioProps {
  cargos: Cargo[];
  onSuccess: () => void;
}

export default function FormCadastroFuncionario({ cargos, onSuccess }: FormCadastroFuncionarioProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [novoCargo, setNovoCargo] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleRemoveFoto = () => {
    setFotoCapturada(null);
  };

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.cargo) newErrors.cargo = 'Cargo é obrigatório';
    if (!fotoCapturada) newErrors.foto = 'Foto é obrigatória';

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
      const fotoResponse = await funcionariosAPI.uploadFoto(fotoCapturada!);

      const funcionarioData: CreateFuncionarioPayload = {
        nome: formData.nome,
        cargo: formData.cargo,
        fotoUrl: fotoResponse.url,
        fotoPublicId: fotoResponse.publicId,
      };

      await funcionariosAPI.create(funcionarioData);

      toast.success('Funcionário cadastrado com sucesso!');

      setFormData({
        nome: '',
        cargo: '',
      });
      setFotoCapturada(null);
      setErrors({});

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      const mensagem = error.response?.data?.message || 'Erro ao cadastrar funcionário';
      toast.error(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const handleAdicionarCargo = () => {
    if (!novoCargo.trim()) return;
    
    const cargoJaExiste = cargos.some(c => c.nome.toLowerCase() === novoCargo.trim().toLowerCase());
    if (cargoJaExiste) {
      toast.error('Cargo já existe');
      return;
    }
    
    setFormData(prev => ({ ...prev, cargo: novoCargo.trim() }));
    setNovoCargo('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Cadastrar Funcionário
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            placeholder="Digite o nome completo"
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
          
          {cargos.length > 0 ? (
            <div className="space-y-2">
              <select
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.cargo ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um cargo</option>
                {cargos.map((cargo) => (
                  <option key={cargo._id} value={cargo.nome}>
                    {cargo.nome}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Ou adicione um novo:</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novoCargo}
                  onChange={(e) => setNovoCargo(e.target.value)}
                  placeholder="Novo cargo..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={handleAdicionarCargo}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  Adicionar
                </button>
              </div>
            </div>
          ) : (
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleInputChange}
              placeholder="Digite o cargo"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.cargo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          )}
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
                alt="Foto capturada"
                className="w-32 h-32 object-cover rounded-lg border-2 border-green-500"
              />
              <button
                type="button"
                onClick={handleRemoveFoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition flex items-center justify-center gap-2"
            >
              <Camera size={24} />
              Capturar Foto
            </button>
          )}
          {errors.foto && <p className="text-red-500 text-xs mt-1">{errors.foto}</p>}
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar Funcionário'}
        </button>
      </form>

      {showCamera && (
        <CameraCapture
          onCapture={handleCaptureFoto}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}