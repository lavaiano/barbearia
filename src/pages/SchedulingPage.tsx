import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import ptBR from 'date-fns/locale/pt-BR';
import { supabase } from '../config/supabaseClient';
import { format, addDays, isSameDay, isAfter, startOfDay, parseISO } from 'date-fns';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
}

interface Barbeiro {
  id: string;
  nome: string;
  especialidades?: string[];
  foto?: string;
  telefone: string;
}

interface Horario {
  hora: string;
  disponivel: boolean;
}

const steps = ['Selecionar Serviço', 'Escolher Barbeiro', 'Data e Hora', 'Seus Dados'];

const HORARIOS_PADRAO = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];


const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
  
  return value;
};

const DateSelector: React.FC<{
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  disabledDays?: number[];
}> = ({ selectedDate, onDateSelect, disabledDays = [] }) => {
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    const newDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    setDates(newDates);
  }, [startDate]);

  const handlePrevious = () => {
    setStartDate(prev => addDays(prev, -7));
  };

  const handleNext = () => {
    setStartDate(prev => addDays(prev, 7));
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    return (
      isAfter(today, date) || // Disable past dates
      disabledDays.includes(date.getDay()) // Disable specific days of week
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2 
      }}>
        <IconButton 
          onClick={handlePrevious}
          sx={{ 
            color: '#e7e9ea',
            '&:hover': { backgroundColor: 'rgba(239, 243, 244, 0.1)' }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography sx={{ color: '#e7e9ea', fontSize: '1rem' }}>
          Selecione uma data
        </Typography>
        <IconButton 
          onClick={handleNext}
          sx={{ 
            color: '#e7e9ea',
            '&:hover': { backgroundColor: 'rgba(239, 243, 244, 0.1)' }
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
      <Box sx={{ 
        display: 'flex', 
        gap: 1,
        overflowX: 'auto',
        pb: 1,
        '&::-webkit-scrollbar': {
          height: '4px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#2f3336'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#1d9bf0',
          borderRadius: '4px'
        }
      }}>
        {dates.map((date) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isDisabled = isDateDisabled(date);

          return (
            <Button
              key={date.toISOString()}
              onClick={() => !isDisabled && onDateSelect(date)}
              disabled={isDisabled}
              sx={{
                minWidth: '120px',
                p: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: isSelected ? '#1d9bf0' : 'transparent',
                border: '1px solid',
                borderColor: isSelected ? '#1d9bf0' : '#2f3336',
                color: isDisabled ? '#71767b' : '#e7e9ea',
                '&:hover': {
                  backgroundColor: isSelected ? '#1d9bf0' : 'rgba(29, 155, 240, 0.1)',
                  borderColor: isSelected ? '#1d9bf0' : '#1d9bf0'
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(47, 51, 54, 0.4)',
                  borderColor: '#2f3336'
                }
              }}
            >
              <Typography sx={{ 
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                {format(date, "dd/MMM", { locale: ptBR })}
              </Typography>
              <Typography sx={{ 
                fontSize: '0.75rem',
                color: isSelected ? '#fff' : '#71767b'
              }}>
                {format(date, 'EEEE', { locale: ptBR })}
              </Typography>
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

const SchedulingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [selectedServico, setSelectedServico] = useState<string>('');
  const [selectedBarbeiro, setSelectedBarbeiro] = useState<string>('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<Horario[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [agendamentoConcluido, setAgendamentoConcluido] = useState<{
    data: string;
    hora: string;
    barbeiro: string;
    servico: string;
    valor: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: barbeirosData, error: barbeirosError } = await supabase
          .from('barbeiros')
          .select('id, nome, especialidades, foto, telefone')
          .eq('ativo', true);

        if (barbeirosError) throw barbeirosError;

        const { data: servicosData, error: servicosError } = await supabase
          .from('servicos')
          .select('id, nome, duracao, preco')
          .eq('ativo', true);

        if (servicosError) throw servicosError;

        const barbeirosFormatados: Barbeiro[] = (barbeirosData || []).map(b => ({
          id: b.id,
          nome: b.nome,
          especialidades: b.especialidades || [],
          foto: b.foto,
          telefone: b.telefone
        }));

        setBarbeiros(barbeirosFormatados);
        setServicos(servicosData || []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const canAdvance = () => {
    switch (activeStep) {
      case 0:
        return !!selectedServico;
      case 1:
        return !!selectedBarbeiro;
      case 2:
        return !!selectedDate && !!selectedTime;
      case 3:
        return !!nome && !!telefone;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBarbeiro || !selectedServico || !selectedDate || !selectedTime || !nome || !telefone) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      
      // Buscar informações do barbeiro selecionado
      const { data: barbeiroData, error: barbeiroError } = await supabase
        .from('barbeiros')
        .select('nome, telefone')
        .eq('id', selectedBarbeiro)
        .single();

      if (barbeiroError) throw barbeiroError;

      // Buscar informações do serviço
      const servico = servicos.find(s => s.id === selectedServico);

      // Criar data com timezone correto
      const dataAgendamento = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );

      // Ajustar para UTC considerando o offset de Brasília (-3 horas)
      const offset = dataAgendamento.getTimezoneOffset();
      const dataUTC = new Date(dataAgendamento.getTime() - (offset * 60000));

      // Formatar a data e hora para exibição
      const dataFormatada = format(dataAgendamento, 'dd/MM/yyyy', { locale: ptBR });
      const horaFormatada = format(dataAgendamento, 'HH:mm', { locale: ptBR });

      // Salvar o agendamento usando a data UTC
      const { error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert([{
          barbeiro_id: selectedBarbeiro,
          servico_id: selectedServico,
          data: dataUTC.toISOString(),
          nome_cliente: nome,
          telefone_cliente: telefone,
          status: 'pendente'
        }]);

      if (agendamentoError) throw agendamentoError;

      // Primeiro exibir o Snackbar
      setOpenSnackbar(true);

      // Aguardar um pequeno delay antes de mostrar a tela de confirmação
      setTimeout(() => {
        // Salvar informações do agendamento concluído
        setAgendamentoConcluido({
          data: dataFormatada,
          hora: horaFormatada,
          barbeiro: barbeiroData.nome,
          servico: servico?.nome || '',
          valor: servico?.preco || 0
        });
      }, 500);

      // Formatar o número do barbeiro (remover caracteres especiais)
      const telefoneBarbeiro = barbeiroData.telefone.replace(/\D/g, '');

      // Montar a mensagem para o barbeiro
      const mensagem = encodeURIComponent(
        `Olá ${barbeiroData.nome}! Você tem um novo agendamento:\n\n` +
        `📅 Data: ${dataFormatada}\n` +
        `⏰ Horário: ${horaFormatada}\n` +
        `👤 Cliente: ${nome}\n` +
        `📱 Telefone: ${telefone}\n` +
        `💇‍♂️ Serviço: ${servico?.nome}\n` +
        `💰 Valor: R$ ${servico?.preco.toFixed(2)}\n\n` +
        `Status: Aguardando confirmação`
      );

      // Abrir WhatsApp do barbeiro em nova aba
      window.open(
        `https://wa.me/55${telefoneBarbeiro}?text=${mensagem}`,
        '_blank'
      );

    } catch (err) {
      console.error('Erro ao agendar:', err);
      alert('Erro ao realizar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const verificarDisponibilidade = async (data: Date, barbeiroId: string) => {
    try {
      // Criar datas para o intervalo de busca considerando o timezone
      const dataInicio = startOfDay(data);
      const dataFim = new Date(dataInicio);
      dataFim.setHours(23, 59, 59, 999);

      // Ajustar para UTC
      const offsetInicio = dataInicio.getTimezoneOffset();
      const dataInicioUTC = new Date(dataInicio.getTime() - (offsetInicio * 60000));
      
      const offsetFim = dataFim.getTimezoneOffset();
      const dataFimUTC = new Date(dataFim.getTime() - (offsetFim * 60000));

      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select('data, barbeiro_id, servico_id')
        .eq('barbeiro_id', barbeiroId)
        .gte('data', dataInicioUTC.toISOString())
        .lte('data', dataFimUTC.toISOString());

      if (error) throw error;

      // Encontrar o serviço selecionado para saber a duração
      const servicoSelecionado = servicos.find(s => s.id === selectedServico);
      const duracaoServico = servicoSelecionado?.duracao || 30;

      // Criar array de horários disponíveis
      const horarios = HORARIOS_PADRAO.map(hora => {
        const [h, m] = hora.split(':');
        const horarioAgendamento = new Date(data);
        horarioAgendamento.setHours(parseInt(h), parseInt(m), 0, 0);

        // Verificar se há conflito com outros agendamentos
        const conflito = agendamentos?.some(agendamento => {
          // Converter a data do agendamento de UTC para local
          const dataAgendamentoUTC = parseISO(agendamento.data);
          const offset = dataAgendamentoUTC.getTimezoneOffset();
          const dataAgendamento = new Date(dataAgendamentoUTC.getTime() + (offset * 60000));
          
          const fimAgendamento = new Date(dataAgendamento);
          const servicoAgendado = servicos.find(s => s.id === agendamento.servico_id);
          fimAgendamento.setMinutes(dataAgendamento.getMinutes() + (servicoAgendado?.duracao || 30));

          const fimNovoAgendamento = new Date(horarioAgendamento);
          fimNovoAgendamento.setMinutes(horarioAgendamento.getMinutes() + duracaoServico);

          return (
            (horarioAgendamento >= dataAgendamento && horarioAgendamento < fimAgendamento) ||
            (fimNovoAgendamento > dataAgendamento && fimNovoAgendamento <= fimAgendamento)
          );
        });

        return {
          hora,
          disponivel: !conflito
        };
      });

      setHorariosDisponiveis(horarios);
    } catch (err) {
      console.error('Erro ao verificar disponibilidade:', err);
      setHorariosDisponiveis([]);
    }
  };

  const commonFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#000000',
      fontSize: '1rem',
      '& fieldset': {
        borderColor: '#333639'
      },
      '&:hover fieldset': {
        borderColor: '#333639'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1d9bf0'
      }
    },
    '& .MuiInputLabel-root': {
      color: '#71767b',
      fontSize: '1rem',
      '&.Mui-focused': {
        color: '#1d9bf0'
      }
    },
    '& input': {
      color: '#e7e9ea',
      padding: '14px 16px'
    },
    '& .MuiIconButton-root': {
      color: '#71767b'
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth>
            <InputLabel 
              id="servico-label" 
              sx={{ 
                color: '#71767b',
                backgroundColor: '#000000',
                px: 1,
                '&.Mui-focused': {
                  color: '#1d9bf0'
                }
              }}
            >
              Serviço
            </InputLabel>
            <Select
              labelId="servico-label"
              value={selectedServico}
              onChange={(e) => setSelectedServico(e.target.value)}
              sx={{
                backgroundColor: '#000000',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333639'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333639'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1d9bf0'
                },
                '& .MuiSelect-select': {
                  color: '#e7e9ea'
                }
              }}
            >
              {servicos.map((servico) => (
                <MenuItem key={servico.id} value={servico.id}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    width: '100%',
                    alignItems: 'center'
                  }}>
                    <Typography sx={{ color: '#e7e9ea' }}>
                      {servico.nome}
                    </Typography>
                    <Typography sx={{ color: '#71767b' }}>
                      R$ {servico.preco.toFixed(2)}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 1:
        return (
          <FormControl fullWidth>
            <InputLabel 
              id="barbeiro-label" 
              sx={{ 
                color: '#71767b',
                backgroundColor: '#000000',
                px: 1,
                '&.Mui-focused': {
                  color: '#1d9bf0'
                }
              }}
            >
              Barbeiro
            </InputLabel>
            <Select
              labelId="barbeiro-label"
              value={selectedBarbeiro}
              onChange={(e) => setSelectedBarbeiro(e.target.value)}
              sx={{
                backgroundColor: '#000000',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333639'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333639'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1d9bf0'
                },
                '& .MuiSelect-select': {
                  color: '#e7e9ea'
                }
              }}
            >
              {barbeiros.map((barbeiro) => (
                <MenuItem key={barbeiro.id} value={barbeiro.id}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 2
                  }}>
                    {barbeiro.foto && (
                      <Box
                        component="img"
                        src={barbeiro.foto}
                        alt={barbeiro.nome}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <Box>
                      <Typography sx={{ color: '#e7e9ea' }}>
                        {barbeiro.nome}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: '#71767b' }}
                      >
                        {barbeiro.especialidades?.join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <DateSelector
              selectedDate={selectedDate}
              onDateSelect={(newValue) => {
                setSelectedDate(newValue);
                if (newValue && selectedBarbeiro) {
                  verificarDisponibilidade(newValue, selectedBarbeiro);
                }
                setSelectedTime(null);
              }}
              disabledDays={[0]} // Apenas domingo (0)
            />

            {selectedDate && horariosDisponiveis.length > 0 && (
              <Grid container spacing={1}>
                {horariosDisponiveis.map((horario, index) => {
                  const isSelected = selectedTime?.getHours() === parseInt(horario.hora.split(':')[0]) &&
                                    selectedTime?.getMinutes() === parseInt(horario.hora.split(':')[1]);
                  
                  return (
                    <Grid item xs={4} key={index}>
                      <Button
                        fullWidth
                        size="small"
                        variant={isSelected ? 'contained' : 'outlined'}
                        disabled={!horario.disponivel}
                        onClick={() => {
                          if (isSelected) {
                            // Se já está selecionado, desseleciona
                            setSelectedTime(null);
                          } else {
                            // Se não está selecionado, seleciona
                            const [hours, minutes] = horario.hora.split(':');
                            const newTime = new Date(selectedDate);
                            newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                            setSelectedTime(newTime);
                          }
                        }}
                        sx={{
                          borderColor: '#2f3336',
                          color: horario.disponivel ? '#e7e9ea' : '#71767b',
                          backgroundColor: isSelected
                            ? '#1d9bf0'
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: isSelected 
                              ? '#1a8cd8'
                              : horario.disponivel 
                                ? 'rgba(29, 155, 240, 0.1)' 
                                : 'transparent',
                            borderColor: horario.disponivel ? '#1d9bf0' : '#2f3336'
                          },
                          '&.Mui-disabled': {
                            backgroundColor: 'rgba(47, 51, 54, 0.4)',
                            color: '#71767b'
                          }
                        }}
                      >
                        {horario.hora}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              sx={commonFieldStyles}
            />
            <TextField
              fullWidth
              label="Telefone"
              value={telefone}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                setTelefone(formatted);
              }}
              placeholder="(99) 99999-9999"
              inputProps={{
                maxLength: 15
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#e7e9ea',
                  '& fieldset': {
                    borderColor: '#2f3336'
                  },
                  '&:hover fieldset': {
                    borderColor: '#1d9bf0'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1d9bf0'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#71767b'
                }
              }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  if (agendamentoConcluido) {
    return (
      <Box sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#16181c',
        color: '#e7e9ea',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6
      }}>
        <Container maxWidth="sm">
          <Paper sx={{
            p: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#1d9bf0', textAlign: 'center' }}>
              Agendamento Concluído com Sucesso!
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#e7e9ea' }}>
                Detalhes do Agendamento:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography sx={{ color: '#e7e9ea' }}>
                  <strong>Data:</strong> {agendamentoConcluido.data}
                </Typography>
                <Typography sx={{ color: '#e7e9ea' }}>
                  <strong>Horário:</strong> {agendamentoConcluido.hora}
                </Typography>
                <Typography sx={{ color: '#e7e9ea' }}>
                  <strong>Barbeiro:</strong> {agendamentoConcluido.barbeiro}
                </Typography>
                <Typography sx={{ color: '#e7e9ea' }}>
                  <strong>Serviço:</strong> {agendamentoConcluido.servico}
                </Typography>
                <Typography sx={{ color: '#e7e9ea' }}>
                  <strong>Valor:</strong> R$ {agendamentoConcluido.valor.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                backgroundColor: '#1d9bf0',
                color: '#ffffff',
                borderRadius: '9999px',
                textTransform: 'none',
                py: 1.5,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: '#1a8cd8'
                }
              }}
            >
              Voltar para a Página Inicial
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#000000'
      }}>
        <CircularProgress sx={{ color: '#1d9bf0' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 3, 
        backgroundColor: '#000000',
        minHeight: '100vh',
        color: '#F4212E'
      }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#16181c',
      color: '#e7e9ea',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)',
        pointerEvents: 'none'
      }
    }}>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{
            backgroundColor: '#1d9bf0',
            color: '#ffffff',
            '& .MuiAlert-icon': {
              color: '#ffffff'
            }
          }}
        >
          Agendamento realizado com sucesso!
        </Alert>
      </Snackbar>

      <Container 
        maxWidth={false}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 2,
          p: 4,
          position: 'relative',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          mx: 'auto',
          width: '100%',
          maxWidth: '100%',
          height: '100%'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '700px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: '#e7e9ea',
              fontWeight: 700,
              fontSize: { xs: '24px', sm: '28px' },
              textAlign: 'center',
              mb: 4
            }}
          >
            Agendar Horário
          </Typography>

          <Stepper 
            activeStep={activeStep} 
            sx={{
              mb: 4,
              width: '100%',
              '& .MuiStepLabel-label': {
                color: '#71767b',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '&.Mui-active': {
                  color: '#1d9bf0'
                },
                '&.Mui-completed': {
                  color: '#e7e9ea'
                }
              },
              '& .MuiStepIcon-root': {
                color: '#2f3336',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                '&.Mui-active': {
                  color: '#1d9bf0'
                },
                '&.Mui-completed': {
                  color: '#1d9bf0'
                }
              },
              '& .MuiStep-root': {
                padding: { xs: '0 4px', sm: '0 8px' }
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              width: '100%',
              mb: 3
            }}
          >
            {renderStepContent(activeStep)}

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 4,
              gap: 2
            }}>
              <Button
                variant="outlined"
                onClick={activeStep === 0 ? () => navigate('/') : handleBack}
                sx={{
                  borderColor: '#2f3336',
                  color: '#e7e9ea',
                  borderRadius: '9999px',
                  textTransform: 'none',
                  px: { xs: 3, sm: 4 },
                  py: 1.5,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '&:hover': {
                    borderColor: '#2f3336',
                    backgroundColor: 'rgba(239, 243, 244, 0.1)'
                  }
                }}
              >
                Voltar
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canAdvance()}
                  sx={{
                    backgroundColor: '#1d9bf0',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    textTransform: 'none',
                    px: { xs: 3, sm: 4 },
                    py: 1.5,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '&:hover': {
                      backgroundColor: '#1a8cd8'
                    }
                  }}
                >
                  Finalizar
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={!canAdvance()}
                  sx={{
                    backgroundColor: '#1d9bf0',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    textTransform: 'none',
                    px: { xs: 3, sm: 4 },
                    py: 1.5,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '&:hover': {
                      backgroundColor: '#1a8cd8'
                    }
                  }}
                >
                  Próximo
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SchedulingPage; 