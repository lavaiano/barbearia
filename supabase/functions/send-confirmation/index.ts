import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configurações do Twilio
const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
const twilioWhatsappNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')

// Configurações do Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseKey)

// Função para enviar mensagem via Twilio
async function sendTwilioMessage(to: string, body: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const auth = btoa(`${accountSid}:${authToken}`)

  // Limpar o número de qualquer formatação e garantir código do Brasil
  const cleanNumber = to.replace(/\D/g, '')
  const formattedTo = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`
  
  // Usar o número do sandbox do Twilio
  const formattedFrom = '+14155238886' // Número padrão do sandbox

  const formData = new URLSearchParams()
  formData.append('To', `whatsapp:+${formattedTo}`)
  formData.append('From', `whatsapp:${formattedFrom}`)
  formData.append('Body', body)

  console.log('Enviando para:', `whatsapp:+${formattedTo}`)
  console.log('Enviando de:', `whatsapp:${formattedFrom}`)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Resposta do Twilio:', errorData)
      throw new Error(`Twilio API error: ${response.status} ${response.statusText} - ${errorData}`)
    }

    return response.json()
  } catch (error) {
    console.error('Erro completo:', error)
    throw error
  }
}

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
        await sendTwilioMessage(
          appointment.telefone_cliente.replace(/\D/g, ''),
          clientMessage
        )

        // Enviar mensagem para o barbeiro
        await sendTwilioMessage(
          appointment.barbeiros.telefone.replace(/\D/g, ''),
          barberMessage
        )

        // Atualizar o contador de tentativas
        await supabase
          .from('agendamentos')
          .update({
            ultima_confirmacao: new Date().toISOString(),
            tentativas_confirmacao: (appointment.tentativas_confirmacao || 0) + 1
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