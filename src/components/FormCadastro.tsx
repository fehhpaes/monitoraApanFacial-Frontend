import { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { alunosAPI } from '../services/api';
import { CreateAlunoPayload } from '../types/index';
import CameraCapture from './CameraCapture';
import { toast } from 'react-toastify';

interface FormCadastroProps {
  cursos: string[];
  onSuccess: () => void;
}

export default function FormCadastro({ cursos, onSuccess }: FormCadastroProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    nome: '',
    curso: '',
    nomeResponsavel: '',
    emailResponsavel: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpar erro do campo
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
    if (!formData.curso) newErrors.curso = 'Curso é obrigatório';
    if (!formData.nomeResponsavel.trim()) newErrors.nomeResponsavel = 'Nome do responsável é obrigatório';
    if (!formData.emailResponsavel.trim()) newErrors.emailResponsavel = 'Email do responsável é obrigatório';
    if (!fotoCapturada) newErrors.foto = 'Foto é obrigatória';

    // Validar email
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
      // Upload da foto
      const fotoResponse = await alunosAPI.uploadFoto(fotoCapturada!);

      // Criar aluno
      const alunoData: CreateAlunoPayload = {
        nome: formData.nome,
        curso: formData.curso,
        nomeResponsavel: formData.nomeResponsavel,
        emailResponsavel: formData.emailResponsavel,
        fotoUrl: fotoResponse.url,
        fotoPublicId: fotoResponse.publicId,
      };

      await alunosAPI.create(alunoData);

      toast.success('Aluno cadastrado com sucesso!');

      // Limpar formulário
      setFormData({
        nome: '',
        curso: '',
        nomeResponsavel: '',
        emailResponsavel: '',
      });
      setFotoCapturada(null);
      setErrors({});

      // Chamar callback de sucesso
      onSuccess();
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      toast.error('Erro ao cadastrar aluno. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Cadastro de Aluno</h2>

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
          placeholder="Digite o nome do aluno"
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
          <option value="">Selecione um curso</option>
          {cursos.map((curso) => (
            <option key={curso} value={curso}>
              {curso}
            </option>
          ))}
        </select>
        {errors.curso && <p className="text-red-500 text-sm mt-1">{errors.curso}</p>}
      </div>

      {/* Nome do Responsável */}
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
          placeholder="Digite o nome do responsável"
        />
        {errors.nomeResponsavel && <p className="text-red-500 text-sm mt-1">{errors.nomeResponsavel}</p>}
      </div>

      {/* Email do Responsável */}
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
          placeholder="Digite o email do responsável"
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
              alt="Foto capturada"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveFoto}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Remover Foto
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-4 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Camera size={20} />
            Capturar Foto
          </button>
        )}
        {errors.foto && <p className="text-red-500 text-sm mt-1">{errors.foto}</p>}
      </div>

      {/* Botão Enviar */}
      <button
        type="submit"
        disabled={carregando}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        <Upload size={20} />
        {carregando ? 'Cadastrando...' : 'Cadastrar Aluno'}
      </button>

      {showCamera && <CameraCapture onCapture={handleCaptureFoto} onClose={() => setShowCamera(false)} />}
    </form>
  );
}
