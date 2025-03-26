import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Grid,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../services/supabase';
import * as XLSX from 'xlsx';

interface Appointment {
  id: string;
  data: string;
  nome_cliente: string;
  telefone_cliente: string;
  barbeiro: {
    nome: string;
  };
  servico: {
    nome: string;
    preco: number;
  };
  status: string;
}

interface Barber {
  id: string;
  nome: string;
}

const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAppointments();
    }
  }, [startDate, endDate, selectedBarber]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbeiros')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setBarbers(data || []);
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
      showSnackbar('Erro ao carregar lista de barbeiros', 'error');
    }
  };

  const fetchAppointments = async () => {
    if (!startDate || !endDate) {
      showSnackbar('Selecione o período para buscar os agendamentos', 'error');
      return;
    }

    try {
      setLoading(true);

      // Ajustar as datas para início e fim do dia
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      let query = supabase
        .from('agendamentos')
        .select(`
          id,
          data,
          nome_cliente,
          telefone_cliente,
          status,
          barbeiro:barbeiro_id(nome),
          servico:servico_id(nome, preco)
        `)
        .gte('data', start.toISOString())
        .lte('data', end.toISOString());

      // Adicionar filtro por barbeiro se selecionado
      if (selectedBarber) {
        query = query.eq('barbeiro_id', selectedBarber);
      }

      const { data, error } = await query.order('data', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      showSnackbar('Erro ao carregar agendamentos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTotalRevenue = () => {
    return appointments.reduce((total, appointment) => {
      return total + (appointment.servico?.preco || 0);
    }, 0);
  };

  const exportToExcel = () => {
    if (appointments.length === 0) {
      showSnackbar('Não há dados para exportar', 'error');
      return;
    }

    try {
      // Preparar os dados para o Excel
      const excelData = appointments.map(appointment => ({
        'Data': formatDate(appointment.data),
        'Cliente': appointment.nome_cliente,
        'Telefone': appointment.telefone_cliente,
        'Barbeiro': appointment.barbeiro?.nome || '',
        'Serviço': appointment.servico?.nome || '',
        'Valor': formatCurrency(appointment.servico?.preco || 0),
        'Status': appointment.status
      }));

      // Criar uma nova planilha
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Ajustar largura das colunas
      const colWidths = [
        { wch: 20 }, // Data
        { wch: 30 }, // Cliente
        { wch: 15 }, // Telefone
        { wch: 20 }, // Barbeiro
        { wch: 25 }, // Serviço
        { wch: 15 }, // Valor
        { wch: 12 }  // Status
      ];
      ws['!cols'] = colWidths;

      // Definir estilo para a primeira coluna (negrito)
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cell = ws[XLSX.utils.encode_cell({ r: row, c: 0 })];
        if (cell) {
          if (!cell.s) cell.s = {};
          cell.s.font = { bold: true };
        }
      }

      // Criar um novo workbook e adicionar a planilha
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Agendamentos');

      // Gerar o arquivo e fazer o download
      XLSX.writeFile(wb, `relatorio_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
      
      showSnackbar('Relatório exportado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      showSnackbar('Erro ao exportar relatório', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: '#e7e9ea', mb: 3 }}>
        Relatório de Agendamentos
      </Typography>

      <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Data Inicial"
              value={startDate}
              onChange={setStartDate}
              format="dd/MM/yyyy"
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  color: '#e7e9ea',
                  '& fieldset': { borderColor: '#2f3336' },
                  '&:hover fieldset': { borderColor: '#1d9bf0' },
                  '&.Mui-focused fieldset': { borderColor: '#1d9bf0' }
                },
                '& .MuiInputLabel-root': {
                  color: '#71767b',
                  '&.Mui-focused': { color: '#1d9bf0' }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Data Final"
              value={endDate}
              onChange={setEndDate}
              format="dd/MM/yyyy"
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  color: '#e7e9ea',
                  '& fieldset': { borderColor: '#2f3336' },
                  '&:hover fieldset': { borderColor: '#1d9bf0' },
                  '&.Mui-focused fieldset': { borderColor: '#1d9bf0' }
                },
                '& .MuiInputLabel-root': {
                  color: '#71767b',
                  '&.Mui-focused': { color: '#1d9bf0' }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel 
                id="barbeiro-select-label"
                sx={{ 
                  color: '#71767b',
                  '&.Mui-focused': { color: '#1d9bf0' }
                }}
              >
                Barbeiro
              </InputLabel>
              <Select
                labelId="barbeiro-select-label"
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                label="Barbeiro"
                sx={{
                  color: '#e7e9ea',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2f3336' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1d9bf0' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1d9bf0' },
                  '& .MuiSvgIcon-root': { color: '#71767b' }
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {barbers.map((barber) => (
                  <MenuItem key={barber.id} value={barber.id}>
                    {barber.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <Tooltip title="Atualizar">
                <IconButton
                  onClick={fetchAppointments}
                  disabled={loading}
                  sx={{ color: '#1d9bf0' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exportar Excel">
                <IconButton
                  onClick={exportToExcel}
                  disabled={appointments.length === 0}
                  sx={{ color: '#00ba7c' }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {appointments.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}>
          <Typography variant="h6" sx={{ color: '#e7e9ea', mb: 2 }}>
            Resumo
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(29, 155, 240, 0.1)' }}>
                <Typography variant="subtitle2" sx={{ color: '#71767b' }}>
                  Total de Agendamentos
                </Typography>
                <Typography variant="h4" sx={{ color: '#1d9bf0' }}>
                  {appointments.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(0, 186, 124, 0.1)' }}>
                <Typography variant="subtitle2" sx={{ color: '#71767b' }}>
                  Faturamento Total
                </Typography>
                <Typography variant="h4" sx={{ color: '#00ba7c' }}>
                  {formatCurrency(calculateTotalRevenue())}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Data</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Cliente</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Telefone</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Barbeiro</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Serviço</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Valor</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell sx={{ color: '#e7e9ea' }}>{formatDate(appointment.data)}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>{appointment.nome_cliente}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>{appointment.telefone_cliente}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>{appointment.barbeiro?.nome}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>{appointment.servico?.nome}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>{formatCurrency(appointment.servico?.preco || 0)}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>
                  <Typography
                    sx={{
                      color: appointment.status === 'concluido' ? '#00ba7c' : 
                             appointment.status === 'pendente' ? '#1d9bf0' : '#f4212e',
                      bgcolor: appointment.status === 'concluido' ? 'rgba(0, 186, 124, 0.1)' :
                              appointment.status === 'pendente' ? 'rgba(29, 155, 240, 0.1)' : 'rgba(244, 33, 46, 0.1)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'inline-block',
                      textTransform: 'capitalize'
                    }}
                  >
                    {appointment.status}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            bgcolor: snackbar.severity === 'success' ? 'rgba(0, 186, 124, 0.1)' : 'rgba(244, 33, 46, 0.1)',
            color: snackbar.severity === 'success' ? '#00ba7c' : '#f4212e'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsPage; 