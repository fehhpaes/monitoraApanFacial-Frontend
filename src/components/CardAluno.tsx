import { Aluno } from '../types/index';
import { Trash2, Edit2 } from 'lucide-react';

interface CardAlunoProps {
  aluno: Aluno;
  onEdit: (aluno: Aluno) => void;
  onDelete: (id: string) => void;
}

export default function CardAluno({ aluno, onEdit, onDelete }: CardAlunoProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Foto */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        <img
          src={aluno.fotoUrl}
          alt={aluno.nome}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{aluno.nome}</h3>

        <div className="space-y-1 mb-4 text-sm text-gray-600">
          <p>
            <span className="font-semibold text-gray-700">Curso:</span> {aluno.curso}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Responsável:</span>{' '}
            {aluno.nomeResponsavel}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Email:</span>{' '}
            <a
              href={`mailto:${aluno.emailResponsavel}`}
              className="text-blue-600 hover:underline"
            >
              {aluno.emailResponsavel}
            </a>
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(aluno)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Edit2 size={16} />
            Editar
          </button>
          <button
            onClick={() => onDelete(aluno._id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}
