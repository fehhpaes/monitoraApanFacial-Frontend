import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cursosAPI } from '../services/api';
import { CreateCursoPayload, TipoCurso } from '../types/index';
import { toast } from 'react-toastify';

interface FormCursoProps {
  onSuccess: () => void;
  onClose?: () => void;
}

export default function FormCurso({ onSuccess, onClose }: FormCursoProps) {
  const [formData, setFormData] = useState<CreateCursoPayload>({
    nome: '',
    sigla: '',
    tipo: 'modular',
  });
  const [carregando, setCarregando] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'tipo' ? (value as TipoCurso) : value,
    }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do curso é obrigatório';
    }

    if (!formData.sigla.trim()) {
      newErrors.sigla = 'Sigla é obrigatória';
    } else if (formData.sigla.trim().length > 7) {
      newErrors.sigla = 'Sigla não pode exceder 7 caracteres';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo de curso é obrigatório';
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
      // Chamar API com os novos campos
      await cursosAPI.create(formData.nome, formData.sigla, formData.tipo);

      toast.success('Curso cadastrado com sucesso!');

      // Limpar formulário
      setFormData({
        nome: '',
        sigla: '',
        tipo: 'modular',
      });
      setErrors({});

      // Chamar callback de sucesso
      onSuccess();

      // Fechar modal se fornecido
      if (onClose) {
        setTimeout(() => onClose(), 500);
      }
    } catch (error) {
      console.error('Erro ao cadastrar curso:', error);
      toast.error('Erro ao cadastrar curso. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Novo Curso</h2>

      {/* Nome */}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Curso
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
          placeholder="Ex: Desenvolvimento Web"
        />
        {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
      </div>

      {/* Sigla */}
      <div>
        <label htmlFor="sigla" className="block text-sm font-medium text-gray-700 mb-1">
          Sigla do Curso (máx. 7 caracteres)
        </label>
        <input
          type="text"
          id="sigla"
          name="sigla"
          value={formData.sigla}
          onChange={handleInputChange}
          maxLength={7}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 uppercase ${
            errors.sigla ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Ex: DEV"
        />
        <p className="text-gray-500 text-xs mt-1">
          {formData.sigla.length}/7 caracteres
        </p>
        {errors.sigla && <p className="text-red-500 text-sm mt-1">{errors.sigla}</p>}
      </div>

      {/* Tipo de Curso */}
      <div>
        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Curso
        </label>
        <select
          id="tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.tipo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        >
          <option value="modular">Modular</option>
          <option value="integral">Integral</option>
        </select>
        {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
      </div>

      {/* Botões */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={carregando}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
