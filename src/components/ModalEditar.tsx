import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Aluno, UpdateAlunoPayload } from '../types/index';
import CameraCapture from './CameraCapture';
import { alunosAPI } from '../services/api';
import { toast } from 'react-toastify';

interface ModalEditarProps {
  aluno: Aluno;
  cursos: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditar({ aluno, cursos, onClose, onSuccess }: ModalEditarProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: aluno.nome,
    curso: aluno.curso,
    nomeResponsavel: aluno.nomeResponsavel,
    emailResponsavel: aluno.emailResponsavel,
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

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.curso) newErrors.curso = 'Curso é obrigatório';
    if (!formData.nomeResponsavel.trim()) newErrors.nomeResponsavel = 'Nome do responsável é obrigatório';
    if (!formData.emailResponsavel.trim()) newErrors.emailResponsavel = 'Email do responsável é obrigatório';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.emailResponsavel && !emailRegex.test(formData.emailResponsavel)) {
      newErrors.emailResponsavel = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error('Por favor, corrija os erros do formulário');
      return;
    }

    setCarregando(true);

    try {
      let fotoUrl = aluno.fotoUrl;
      let fotoPublicId = aluno.fotoPublicId;

      // Se uma nova foto foi capturada, fazer upload
      if (fotoCapturada) {
        const fotoResponse = await alunosAPI.uploadFoto(fotoCapturada);
        fotoUrl = fotoResponse.url;
        fotoPublicId = fotoResponse.publicId;
      }

      const updateData: UpdateAlunoPayload = {
        nome: formData.nome,
        curso: formData.curso,
        nomeResponsavel: formData.nomeResponsavel,
        emailResponsavel: formData.emailResponsavel,
        fotoUrl,
        fotoPublicId,
      };

      await alunosAPI.update(aluno._id, updateData);

      toast.success('Aluno atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      toast.error('Erro ao atualizar aluno. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Editar Aluno</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Aluno
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.nome ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
          </div>

          {/* Curso */}
          <div>
            <label htmlFor="curso" className="block text-sm font-medium text-gray-700 mb-1">
              Curso
            </label>
            <select
              id="curso"
              name="curso"
              value={formData.curso}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.curso ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              {cursos.map((curso) => (
                <option key={curso} value={curso}>
                  {curso}
                </option>
              ))}
            </select>
            {errors.curso && <p className="text-red-500 text-sm mt-1">{errors.curso}</p>}
          </div>

          {/* Nome Responsável */}
          <div>
            <label htmlFor="nomeResponsavel" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Responsável
            </label>
            <input
              type="text"
              id="nomeResponsavel"
              name="nomeResponsavel"
              value={formData.nomeResponsavel}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.nomeResponsavel ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.nomeResponsavel && <p className="text-red-500 text-sm mt-1">{errors.nomeResponsavel}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="emailResponsavel" className="block text-sm font-medium text-gray-700 mb-1">
              Email do Responsável
            </label>
            <input
              type="email"
              id="emailResponsavel"
              name="emailResponsavel"
              value={formData.emailResponsavel}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.emailResponsavel ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.emailResponsavel && <p className="text-red-500 text-sm mt-1">{errors.emailResponsavel}</p>}
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Aluno</label>
            {fotoCapturada ? (
              <div className="space-y-2">
                <img
                  src={fotoCapturada}
                  alt="Nova foto"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFotoCapturada(null)}
                  className="w-full text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg transition"
                >
                  Remover Nova Foto
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <img
                  src={aluno.fotoUrl}
                  alt={aluno.nome}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition"
                >
                  Trocar Foto
                </button>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              {carregando ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </form>

        {showCamera && <CameraCapture onCapture={handleCaptureFoto} onClose={() => setShowCamera(false)} />}
      </div>
    </div>
  );
}
