import { X } from 'lucide-react';
import FormCurso from './FormCurso';

interface ModalCursoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalCurso({ isOpen, onClose, onSuccess }: ModalCursoProps) {
  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header do Modal */}
        <div className="sticky top-0 bg-blue-600 text-white p-4 flex items-center justify-between border-b">
          <h2 className="text-xl font-bold">Adicionar Novo Curso</h2>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 p-1 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6">
          <FormCurso onSuccess={handleSuccess} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
