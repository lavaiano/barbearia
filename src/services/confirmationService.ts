import { supabase } from './supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  data: string;
  nome_cliente: string;
  telefone_cliente: string;
  barbeiro_id: string;
  servico_id: string;
  status: string;
  ultima_confirmacao: string | null;
  tentativas_confirmacao: number;
}

export async function sendConfirmationMessages() {
  try {
    // Buscar agendamentos pendentes que precisam de confirmação
    const { data: appointments, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        barbeiros (nome, telefone),
        servicos (nome)
      `)
      .eq('status', 'pendente')
      .lte('tentativas_confirmacao', 3); // Limitar a 3 tentativas

    if (error) throw error;

    for (const appointment of appointments) {
      const formattedDate = format(new Date(appointment.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      
      // Mensagem para o cliente
      const clientMessage = `Olá ${appointment.nome_cliente}! Confirme seu agendamento:\n\n` +
        `📅 Data: ${formattedDate}\n` +
        `💇‍♂️ Serviço: ${appointment.servicos.nome}\n\n` +
        `Responda com:\n` +
        `✅ SIM - para confirmar\n` +
        `❌ NÃO - para cancelar`;

      // Mensagem para o barbeiro
      const barberMessage = `Olá ${appointment.barbeiros.nome}! Cliente precisa confirmar agendamento:\n\n` +
        `👤 Cliente: ${appointment.nome_cliente}\n` +
        `📱 Telefone: ${appointment.telefone_cliente}\n` +
        `📅 Data: ${formattedDate}\n` +
        `💇‍♂️ Serviço: ${appointment.servicos.nome}`;

      // Enviar mensagem para o cliente
      const clientWhatsAppLink = `https://wa.me/${appointment.telefone_cliente.replace(/\D/g, '')}?text=${encodeURIComponent(clientMessage)}`;
      
      // Enviar mensagem para o barbeiro
      const barberWhatsAppLink = `https://wa.me/${appointment.barbeiros.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(barberMessage)}`;

      // Abrir as mensagens em novas abas
      window.open(clientWhatsAppLink, '_blank');
      window.open(barberWhatsAppLink, '_blank');

      // Atualizar o agendamento
      await supabase
        .from('agendamentos')
        .update({
          ultima_confirmacao: new Date().toISOString(),
          tentativas_confirmacao: (appointment.tentativas_confirmacao || 0) + 1
        })
        .eq('id', appointment.id);
    }
  } catch (error) {
    console.error('Erro ao enviar mensagens de confirmação:', error);
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  try {
    const { error } = await supabase
      .from('agendamentos')
      .update({ status })
      .eq('id', appointmentId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar status do agendamento:', error);
    throw error;
  }
} 