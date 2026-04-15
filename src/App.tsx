import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Landing from './pages/Landing';
import AlunosPage from './pages/Alunos';
import CursosPage from './pages/Cursos';
import { PresencaQR } from './pages/PresencaQR';
import { ImpressaoQR } from './pages/ImpressaoQR';
import './index.css';

type CurrentPage = 'landing' | 'alunos' | 'cursos' | 'presenca-qr' | 'impressao-qr';

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('landing');

  const handleNavigate = (page: 'alunos' | 'cursos' | 'presenca-qr' | 'impressao-qr') => {
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
      {currentPage === 'presenca-qr' && <PresencaQR onBack={handleBack} />}
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
