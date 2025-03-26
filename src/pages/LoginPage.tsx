import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#16181c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: '#e7e9ea',
              textAlign: 'center',
              fontSize: { xs: '1.75rem', sm: '2rem' },
              mb: 3
            }}
          >
            Login
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(244, 33, 46, 0.1)',
                color: '#F4212E',
                '& .MuiAlert-icon': {
                  color: '#F4212E'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#000000',
                  color: '#e7e9ea',
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
                  '&.Mui-focused': {
                    color: '#1d9bf0'
                  }
                }
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#000000',
                  color: '#e7e9ea',
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
                  '&.Mui-focused': {
                    color: '#1d9bf0'
                  }
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                height: '48px',
                backgroundColor: '#1d9bf0',
                color: '#ffffff',
                borderRadius: '9999px',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: '#1a8cd8',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(29, 155, 240, 0.5)',
                  color: '#ffffff'
                }
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage; 