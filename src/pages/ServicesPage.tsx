import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { supabase } from '../services/supabase';

interface Service {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  ativo: boolean;
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ nome: '', preco: '', duracao: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      showSnackbar('Erro ao carregar serviços', 'error');
    }
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setSelectedService(service);
      setFormData({
        nome: service.nome,
        preco: service.preco.toString(),
        duracao: service.duracao.toString()
      });
    } else {
      setSelectedService(null);
      setFormData({ nome: '', preco: '', duracao: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedService(null);
    setFormData({ nome: '', preco: '', duracao: '' });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    try {
      const serviceData = {
        nome: formData.nome,
        preco: parseFloat(formData.preco),
        duracao: parseInt(formData.duracao),
        ativo: true
      };

      if (selectedService) {
        const { error } = await supabase
          .from('servicos')
          .update(serviceData)
          .eq('id', selectedService.id);

        if (error) throw error;
        showSnackbar('Serviço atualizado com sucesso!', 'success');
      } else {
        const { error } = await supabase
          .from('servicos')
          .insert([serviceData]);

        if (error) throw error;
        showSnackbar('Serviço cadastrado com sucesso!', 'success');
      }

      handleCloseDialog();
      fetchServices();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      showSnackbar('Erro ao salvar serviço', 'error');
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('servicos')
        .update({ ativo: !service.ativo })
        .eq('id', service.id);

      if (error) throw error;
      showSnackbar(
        `Serviço ${service.ativo ? 'inativado' : 'ativado'} com sucesso!`,
        'success'
      );
      fetchServices();
    } catch (error) {
      console.error('Erro ao atualizar status do serviço:', error);
      showSnackbar('Erro ao atualizar status do serviço', 'error');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#e7e9ea' }}>
          Serviços
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: '#1d9bf0',
            '&:hover': {
              backgroundColor: '#1a8cd8',
            },
          }}
        >
          Novo Serviço
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Nome</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Preço</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Duração (min)</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell sx={{ color: '#e7e9ea' }}>{service.nome}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>{formatCurrency(service.preco)}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>{service.duracao}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>
                  <Typography
                    sx={{
                      color: service.ativo ? '#00ba7c' : '#f4212e',
                      bgcolor: service.ativo ? 'rgba(0, 186, 124, 0.1)' : 'rgba(244, 33, 46, 0.1)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'inline-block'
                    }}
                  >
                    {service.ativo ? 'Ativo' : 'Inativo'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(service)}
                    sx={{ color: '#1d9bf0' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleToggleActive(service)}
                    sx={{ color: service.ativo ? '#f4212e' : '#00ba7c' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            bgcolor: '#000000',
            color: '#e7e9ea',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #2f3336' }}>
          {selectedService ? 'Editar Serviço' : 'Novo Serviço'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            margin="normal"
            required
            sx={{
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
          <TextField
            fullWidth
            label="Preço"
            type="number"
            value={formData.preco}
            onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
            margin="normal"
            required
            sx={{
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
          <TextField
            fullWidth
            label="Duração (minutos)"
            type="number"
            value={formData.duracao}
            onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
            margin="normal"
            required
            sx={{
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
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #2f3336', p: 2 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ color: '#71767b' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: '#1d9bf0',
              '&:hover': { bgcolor: '#1a8cd8' }
            }}
          >
            {selectedService ? 'Salvar' : 'Cadastrar'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ServicesPage; 