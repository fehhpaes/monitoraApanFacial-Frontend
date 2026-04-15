import { Users, BookOpen, ArrowRight, QrCode, Printer } from 'lucide-react';

interface LandingProps {
  onNavigate: (page: 'alunos' | 'cursos' | 'presenca-qr' | 'impressao-qr') => void;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card - Cadastro de Alunos */}
          <div
            onClick={() => onNavigate('alunos')}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer p-8 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex flex-col items-center text-center h-full justify-between">
              {/* Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-blue-600" size={40} />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Cadastro de Alunos
                </h2>
                <p className="text-gray-600 mb-6">
                  Registre novos alunos, visualize a galeria e gerencie informações
                </p>
              </div>

              {/* Botão */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 mt-6">
                Acessar
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Card - Cadastro de Cursos */}
          <div
            onClick={() => onNavigate('cursos')}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer p-8 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex flex-col items-center text-center h-full justify-between">
              {/* Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="text-green-600" size={40} />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Cadastro de Cursos
                </h2>
                <p className="text-gray-600 mb-6">
                  Crie e gerencie novos cursos, defina tipo e sigla
                </p>
              </div>

              {/* Botão */}
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 mt-6">
                Acessar
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Card - Controle de Presença */}
          <div
            onClick={() => onNavigate('presenca-qr')}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer p-8 border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex flex-col items-center text-center h-full justify-between">
              {/* Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="text-purple-600" size={40} />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Controle de Presença
                </h2>
                <p className="text-gray-600 mb-6">
                  Escaneie QR Codes para registrar entrada e saída de alunos
                </p>
              </div>

              {/* Botão */}
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 mt-6">
                Acessar
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Card - Impressão de QR Codes */}
          <div
            onClick={() => onNavigate('impressao-qr')}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer p-8 border-2 border-transparent hover:border-orange-500"
          >
            <div className="flex flex-col items-center text-center h-full justify-between">
              {/* Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Printer className="text-orange-600" size={40} />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Impressão de QR Codes
                </h2>
                <p className="text-gray-600 mb-6">
                  Imprima QR Codes de alunos em lote para controle de presença
                </p>
              </div>

              {/* Botão */}
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 mt-6">
                Acessar
                <ArrowRight size={20} />
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
