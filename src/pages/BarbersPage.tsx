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
  Snackbar,
  Grid,
  InputAdornment,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PhotoCamera
} from '@mui/icons-material';
import { supabase } from '../services/supabase';
import InputMask from 'react-input-mask';

interface Barber {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  ativo: boolean;
  foto?: string;
}

const BarbersPage: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [formData, setFormData] = useState({ nome: '', telefone: '', email: '', foto: '' });
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
      setFormData({ nome: barber.nome, telefone: barber.telefone, email: barber.email, foto: barber.foto || '' });
    } else {
      setSelectedBarber(null);
      setFormData({ nome: '', telefone: '', email: '', foto: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBarber(null);
    setFormData({ nome: '', telefone: '', email: '', foto: '' });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não está autenticado');
      }

      if (selectedBarber) {
        const { error } = await supabase
          .from('barbeiros')
          .update({
            nome: formData.nome,
            telefone: formData.telefone,
            email: formData.email,
            ativo: true,
            foto: formData.foto
          })
          .eq('id', selectedBarber.id);

        if (error) {
          console.error('Erro ao atualizar:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('barbeiros')
          .insert([{
            nome: formData.nome,
            telefone: formData.telefone,
            email: formData.email,
            ativo: true,
            foto: formData.foto
          }]);

        if (error) {
          console.error('Erro ao inserir:', error);
          throw error;
        }
      }

      handleCloseDialog();
      fetchBarbers();
      showSnackbar(`Barbeiro ${selectedBarber ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
    } catch (error: any) {
      console.error('Erro ao salvar barbeiro:', error);
      showSnackbar(error.message || 'Erro ao salvar barbeiro', 'error');
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não está autenticado');
      }

      const file = event.target.files?.[0];
      if (!file) return;

      // Upload da imagem para o bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Iniciando upload do arquivo:', fileName);

      const { error: uploadError, data } = await supabase.storage
        .from('fotosbarbeiros')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('Upload concluído:', data);

      // Obter a URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('fotosbarbeiros')
        .getPublicUrl(filePath);

      console.log('URL pública da imagem:', publicUrl);

      // Atualizar o barbeiro com a URL da foto
      if (selectedBarber) {
        const { error: updateError } = await supabase
          .from('barbeiros')
          .update({ foto: publicUrl })
          .eq('id', selectedBarber.id);

        if (updateError) {
          console.error('Erro ao atualizar foto:', updateError);
          throw updateError;
        }

        // Atualizar o estado local
        setSelectedBarber(prev => prev ? { ...prev, foto: publicUrl } : null);
        setFormData(prev => ({ ...prev, foto: publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, foto: publicUrl }));
      }

      showSnackbar('Foto atualizada com sucesso!', 'success');
    } catch (error: any) {
      console.error('Erro ao fazer upload da foto:', error);
      showSnackbar(error.message || 'Erro ao fazer upload da foto', 'error');
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
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Foto</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Nome</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Telefone</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: '#e7e9ea', fontWeight: 'bold' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {barbers.map((barber) => (
              <TableRow key={barber.id}>
                <TableCell>
                  {barber.foto ? (
                    <Box sx={{ width: 50, height: 50, position: 'relative' }}>
                      <img 
                        src={barber.foto} 
                        alt={barber.nome}
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', e);
                          console.log('URL da imagem que falhou:', barber.foto);
                          // Tentar recarregar a imagem com a URL completa
                          const img = e.target as HTMLImageElement;
                          if (img && barber.foto) {
                            img.src = barber.foto;
                          }
                        }}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          borderRadius: '50%', 
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        crossOrigin="anonymous"
                      />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: '50%', 
                      bgcolor: '#2f3336', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Typography sx={{ color: '#71767b' }}>{barber.nome.charAt(0)}</Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>{barber.nome}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>{barber.telefone}</TableCell>
                <TableCell sx={{ color: '#e7e9ea' }}>{barber.email}</TableCell>
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
          <InputMask
            mask="(99) 99999-9999"
            value={formData.telefone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, telefone: e.target.value })}
          >
            {(inputProps: any) => (
              <TextField
                {...inputProps}
                fullWidth
                label="Telefone"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">📱</InputAdornment>,
                }}
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
            )}
          </InputMask>
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="foto-barbeiro"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="foto-barbeiro">
              <Button
                variant="outlined"
                component="span"
                sx={{ mb: 2 }}
              >
                {selectedBarber ? 'Alterar Foto' : 'Adicionar Foto'}
              </Button>
            </label>
            {selectedBarber && selectedBarber.foto && (
              <Box sx={{ mt: 1, position: 'relative' }}>
                <img
                  src={selectedBarber.foto}
                  alt="Foto do barbeiro"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', e);
                    console.log('URL da imagem que falhou:', selectedBarber.foto);
                    // Tentar recarregar a imagem com a URL completa
                    const img = e.target as HTMLImageElement;
                    if (img && selectedBarber.foto) {
                      img.src = selectedBarber.foto;
                    }
                  }}
                  style={{ 
                    width: 100, 
                    height: 100, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  crossOrigin="anonymous"
                />
              </Box>
            )}
          </Box>
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