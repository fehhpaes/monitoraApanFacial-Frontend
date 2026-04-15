import { Users, BookOpen, ArrowRight, Camera, FileText, Printer } from 'lucide-react';

interface LandingProps {
  onNavigate: (page: 'alunos' | 'cursos' | 'presenca-qr-scanner' | 'presenca-qr-relatorio' | 'impressao-qr') => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Container Principal */}
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            🎓 MonitoraApan
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            Sistema de Gerenciamento de Alunos
          </p>
          <p className="text-gray-500">
            Escolha uma opção para começar
          </p>
        </div>

        {/* Cards de Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Card - Cadastro de Alunos */}
          <div
            onClick={() => onNavigate('alunos')}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer p-4 border-2 border-transparent hover:border-blue-500 min-h-64 flex flex-col overflow-hidden"
          >
            <div className="flex flex-col items-center text-center h-full justify-between">
              {/* Icon */}
              <div className="mb-2">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="text-blue-600" size={28} />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col items-center justify-center py-1">
                <h2 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2">
                  Cadastro de Alunos
                </h2>
                <p className="text-gray-600 text-xs line-clamp-2">
                  Registre e gerencie alunos
                </p>
              </div>

              {/* Botão */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1 mt-2 text-xs flex-shrink-0">
                Acessar
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card - Cadastro de Cursos */}
          <div
            onClick={() => onNavigate('cursos')}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer p-4 border-2 border-transparent hover:border-green-500 min-h-64 flex flex-col overflow-hidden"
          >
            <div className="flex flex-col items-center text-center h-full justify-between">
              {/* Icon */}
              <div className="mb-2">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="text-green-600" size={28} />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col items-center justify-center py-1">
                <h2 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2">
                  Cadastro de Cursos
                </h2>
                <p className="text-gray-600 text-xs line-clamp-2">
                  Crie e gerencie cursos
                </p>
              </div>

              {/* Botão */}
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1 mt-2 text-xs flex-shrink-0">
                Acessar
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card - Registrar Presença (Scanner) */}
          <div
            onClick={() => onNavigate('presenca-qr-scanner')}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer p-4 border-2 border-transparent hover:border-red-500 min-h-64 flex flex-col overflow-hidden"
          >
            <div className="flex flex-col items-center text-center h-full justify-between">
              {/* Icon */}
              <div className="mb-2">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="text-red-600" size={28} />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col items-center justify-center py-1">
                <h2 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2">
                  Registrar Presença
                </h2>
                <p className="text-gray-600 text-xs line-clamp-2">
                  Scanner de QR Code
                </p>
              </div>

              {/* Botão */}
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1 mt-2 text-xs flex-shrink-0">
                Acessar
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card - Relatório de Presença */}
          <div
            onClick={() => onNavigate('presenca-qr-relatorio')}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer p-4 border-2 border-transparent hover:border-indigo-500 min-h-64 flex flex-col overflow-hidden"
          >
            <div className="flex flex-col items-center text-center h-full justify-between">
              {/* Icon */}
              <div className="mb-2">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="text-indigo-600" size={28} />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col items-center justify-center py-1">
                <h2 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2">
                  Relatório de Presença
                </h2>
                <p className="text-gray-600 text-xs line-clamp-2">
                  Consulte relatórios
                </p>
              </div>

              {/* Botão */}
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1 mt-2 text-xs flex-shrink-0">
                Acessar
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card - Impressão de QR Codes */}
          <div
            onClick={() => onNavigate('impressao-qr')}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer p-4 border-2 border-transparent hover:border-orange-500 min-h-64 flex flex-col overflow-hidden"
          >
            <div className="flex flex-col items-center text-center h-full justify-between">
              {/* Icon */}
              <div className="mb-2">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Printer className="text-orange-600" size={28} />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col items-center justify-center py-1">
                <h2 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2">
                  Impressão de QR Codes
                </h2>
                <p className="text-gray-600 text-xs line-clamp-2">
                  Imprima QR Codes em lote
                </p>
              </div>

              {/* Botão */}
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1 mt-2 text-xs flex-shrink-0">
                Acessar
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            MonitoraApan © 2026 | Sistema de Gerenciamento Acadêmico
          </p>
        </div>
      </div>
    </div>
  );
}
