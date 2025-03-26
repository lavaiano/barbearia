import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
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

interface Barber {
  id: string;
  nome: string;
  telefone: string;
  ativo: boolean;
}

const BarbersPage: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [formData, setFormData] = useState({ nome: '', telefone: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbeiros')
        .select('*')
        .order('nome');

      if (error) throw error;
      setBarbers(data || []);
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
      showSnackbar('Erro ao carregar barbeiros', 'error');
    }
  };

  const handleOpenDialog = (barber?: Barber) => {
    if (barber) {
      setSelectedBarber(barber);
      setFormData({ nome: barber.nome, telefone: barber.telefone });
    } else {
      setSelectedBarber(null);
      setFormData({ nome: '', telefone: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBarber(null);
    setFormData({ nome: '', telefone: '' });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    try {
      if (selectedBarber) {
        const { error } = await supabase
          .from('barbeiros')
          .update({
            nome: formData.nome,
            telefone: formData.telefone
          })
          .eq('id', selectedBarber.id);

        if (error) throw error;
        showSnackbar('Barbeiro atualizado com sucesso!', 'success');
      } else {
        const { error } = await supabase
          .from('barbeiros')
          .insert([{
            nome: formData.nome,
            telefone: formData.telefone,
            ativo: true
          }]);

        if (error) throw error;
        showSnackbar('Barbeiro cadastrado com sucesso!', 'success');
      }

      handleCloseDialog();
      fetchBarbers();
    } catch (error) {
      console.error('Erro ao salvar barbeiro:', error);
      showSnackbar('Erro ao salvar barbeiro', 'error');
    }
  };

  const handleToggleActive = async (barber: Barber) => {
    try {
      const { error } = await supabase
        .from('barbeiros')
        .update({ ativo: !barber.ativo })
        .eq('id', barber.id);

      if (error) throw error;
      showSnackbar(
        `Barbeiro ${barber.ativo ? 'inativado' : 'ativado'} com sucesso!`,
        'success'
      );
      fetchBarbers();
    } catch (error) {
      console.error('Erro ao atualizar status do barbeiro:', error);
      showSnackbar('Erro ao atualizar status do barbeiro', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#e7e9ea' }}>
          Barbeiros
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
          Novo Barbeiro
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Nome</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Telefone</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {barbers.map((barber) => (
              <TableRow key={barber.id}>
                <TableCell sx={{ color: '#e7e9ea' }}>{barber.nome}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>{barber.telefone}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>
                  <Typography
                    sx={{
                      color: barber.ativo ? '#00ba7c' : '#f4212e',
                      bgcolor: barber.ativo ? 'rgba(0, 186, 124, 0.1)' : 'rgba(244, 33, 46, 0.1)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'inline-block'
                    }}
                  >
                    {barber.ativo ? 'Ativo' : 'Inativo'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(barber)}
                    sx={{ color: '#1d9bf0' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleToggleActive(barber)}
                    sx={{ color: barber.ativo ? '#f4212e' : '#00ba7c' }}
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
          {selectedBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
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
            label="Telefone"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
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
            {selectedBarber ? 'Salvar' : 'Cadastrar'}
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

export default BarbersPage; 