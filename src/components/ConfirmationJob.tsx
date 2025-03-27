import React, { useEffect } from 'react';
import { sendConfirmationMessages } from '../services/confirmationService';

const ConfirmationJob: React.FC = () => {
  useEffect(() => {
    // Função para executar o job
    const runJob = async () => {
      console.log('Executando job de confirmação...'); // Log para debug
      await sendConfirmationMessages();
    };

    // Executar imediatamente
    runJob();

    // Configurar intervalo de 5 minutos (5 * 60 * 1000 ms)
    const interval = setInterval(runJob, 5 * 60 * 1000);

    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  }, []);

  return null; // Este componente não renderiza nada
};

export default ConfirmationJob; 