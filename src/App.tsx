import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Landing from './pages/Landing';
import AlunosPage from './pages/Alunos';
import CursosPage from './pages/Cursos';
import FuncionariosPage from './pages/Funcionarios';
import CargosPage from './pages/Cargos';
import { AttendanceScanning } from './pages/AttendanceScanning';
import { AttendanceReport } from './pages/AttendanceReport';
import { ImpressaoQR } from './pages/ImpressaoQR';
import './index.css';

type CurrentPage = 'landing' | 'alunos' | 'cursos' | 'funcionarios' | 'cargos' | 'presenca-qr-scanner' | 'presenca-qr-relatorio' | 'impressao-qr';

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('landing');

  const handleNavigate = (page: 'alunos' | 'cursos' | 'funcionarios' | 'cargos' | 'presenca-qr-scanner' | 'presenca-qr-relatorio' | 'impressao-qr') => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('landing');
  };

  return (
    <>
      {currentPage === 'landing' && <Landing onNavigate={handleNavigate} />}
      {currentPage === 'alunos' && <AlunosPage onBack={handleBack} />}
      {currentPage === 'cursos' && <CursosPage onBack={handleBack} />}
      {currentPage === 'funcionarios' && <FuncionariosPage onBack={handleBack} />}
      {currentPage === 'cargos' && <CargosPage onBack={handleBack} />}
      {currentPage === 'presenca-qr-scanner' && <AttendanceScanning onBack={handleBack} />}
      {currentPage === 'presenca-qr-relatorio' && <AttendanceReport onBack={handleBack} />}
      {currentPage === 'impressao-qr' && <ImpressaoQR onBack={handleBack} />}
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
