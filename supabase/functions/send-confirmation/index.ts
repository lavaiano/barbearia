import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Twilio } from 'https://esm.sh/twilio'

// Configurações do Twilio
const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
const twilioWhatsappNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')
const client = new Twilio(accountSid, authToken)

// Configurações do Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async () => {
  try {
    // Buscar agendamentos pendentes
    const { data: appointments, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        barbeiros (nome, telefone),
        servicos (nome)
      `)
      .eq('status', 'pendente')
      .lte('tentativas_confirmacao', 3)

    if (error) throw error

    for (const appointment of appointments) {
      const formattedDate = new Date(appointment.data).toLocaleDateString('pt-BR')
      const formattedTime = new Date(appointment.data).toLocaleTimeString('pt-BR')

      // Mensagem para o cliente
      const clientMessage = `Olá ${appointment.nome_cliente}! Confirme seu agendamento:\n\n` +
        `📅 Data: ${formattedDate}\n` +
        `⏰ Hora: ${formattedTime}\n` +
        `💇‍♂️ Serviço: ${appointment.servicos.nome}\n\n` +
        `Responda com:\n` +
        `✅ SIM - para confirmar\n` +
        `❌ NÃO - para cancelar`

      // Mensagem para o barbeiro
      const barberMessage = `Olá ${appointment.barbeiros.nome}! Novo agendamento:\n\n` +
        `👤 Cliente: ${appointment.nome_cliente}\n` +
        `📱 Telefone: ${appointment.telefone_cliente}\n` +
        `📅 Data: ${formattedDate}\n` +
        `⏰ Hora: ${formattedTime}\n` +
        `💇‍♂️ Serviço: ${appointment.servicos.nome}`

      try {
        // Enviar mensagem para o cliente
        await client.messages.create({
          body: clientMessage,
          from: `whatsapp:${twilioWhatsappNumber}`,
          to: `whatsapp:+${appointment.telefone_cliente.replace(/\D/g, '')}`
        })

        // Enviar mensagem para o barbeiro
        await client.messages.create({
          body: barberMessage,
          from: `whatsapp:${twilioWhatsappNumber}`,
          to: `whatsapp:+${appointment.barbeiros.telefone.replace(/\D/g, '')}`
        })

        // Atualizar o contador de tentativas
        await supabase
          .from('agendamentos')
          .update({
            ultima_confirmacao: new Date().toISOString(),
            tentativas_confirmacao: appointment.tentativas_confirmacao + 1
          })
          .eq('id', appointment.id)

      } catch (twilioError) {
        console.error(`Erro ao enviar mensagem para agendamento ${appointment.id}:`, twilioError)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }
}) 