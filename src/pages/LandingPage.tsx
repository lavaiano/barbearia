import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { AccessTime, LocalOffer, Star, EmojiEvents } from '@mui/icons-material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../contexts/AuthContext';

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const ServiceCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: '#1a1a1a',
  margin: '0 8px',
  '&:hover': {
    color: '#c4a484',
  },
}));

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5535991455692', '_blank');
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      minHeight: '100vh',
      width: '100vw',
      overflowX: 'hidden',
      backgroundColor: '#000000'
    }}>
      {/* Hero Section com imagem de fundo */}
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          backgroundImage: 'url("/images/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            color: 'white',
            width: '100%',
            maxWidth: '1200px',
            px: { xs: 2, sm: 3, md: 4 },
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh'
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: isMobile ? '3rem' : '4.5rem',
              fontWeight: 'bold',
              fontFamily: 'Playfair Display',
              mb: 4,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Barbearia dos Parças
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 6,
              fontFamily: 'Playfair Display',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            Desde 2021
          </Typography>
          <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate('/agendar')}
                sx={{
                  borderColor: '#1d9bf0',
                  color: 'white',
                  '&:hover': {
                    borderColor: '#1a8cd8',
                    backgroundColor: 'rgba(29, 155, 240, 0.1)',
                  },
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: '30px',
                  textTransform: 'none',
                  borderWidth: '2px',
                }}
              >
                Agendar Agora
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate('/corte-kids')}
                sx={{
                  borderColor: '#1d9bf0',
                  color: 'white',
                  '&:hover': {
                    borderColor: '#1a8cd8',
                    backgroundColor: 'rgba(29, 155, 240, 0.1)',
                  },
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: '30px',
                  textTransform: 'none',
                  borderWidth: '2px',
                }}
              >
                Corte Kids
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate('/assinatura')}
                sx={{
                  borderColor: '#1d9bf0',
                  color: 'white',
                  '&:hover': {
                    borderColor: '#1a8cd8',
                    backgroundColor: 'rgba(29, 155, 240, 0.1)',
                  },
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: '30px',
                  textTransform: 'none',
                  borderWidth: '2px',
                }}
              >
                Assinatura Mês
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        py: { xs: 6, sm: 8 }, 
        backgroundColor: '#000000',
        width: '100vw',
        overflowX: 'hidden'
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, color: '#e7e9ea', fontWeight: 'bold' }}
          >
            Por que escolher a gente?
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <FeatureCard sx={{ 
                backgroundColor: '#15202b', 
                color: 'white', 
                border: '1px solid #38444d',
                '& .MuiSvgIcon-root': {
                  color: '#1d9bf0'
                },
                '& .MuiTypography-h5': {
                  color: '#1d9bf0'
                }
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccessTimeIcon sx={{ fontSize: 48, color: '#c4a484', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ color: '#1d9bf0' }}>
                    Horário Flexível
                  </Typography>
                  <Typography sx={{ color: '#cccccc' }}>
                    Atendimento de segunda a sábado, com horários que se adaptam à sua rotina.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard sx={{ 
                backgroundColor: '#15202b', 
                color: 'white', 
                border: '1px solid #38444d',
                '& .MuiSvgIcon-root': {
                  color: '#1d9bf0'
                },
                '& .MuiTypography-h5': {
                  color: '#1d9bf0'
                }
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LocalOffer sx={{ fontSize: 48, color: '#c4a484', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ color: '#1d9bf0' }}>
                    Preços Justos
                  </Typography>
                  <Typography sx={{ color: '#cccccc' }}>
                    Serviços de qualidade com preços acessíveis para todos os estilos.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard sx={{ 
                backgroundColor: '#15202b', 
                color: 'white', 
                border: '1px solid #38444d',
                '& .MuiSvgIcon-root': {
                  color: '#1d9bf0'
                },
                '& .MuiTypography-h5': {
                  color: '#1d9bf0'
                }
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Star sx={{ fontSize: 48, color: '#c4a484', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ color: '#1d9bf0' }}>
                    Profissionais Experientes
                  </Typography>
                  <Typography sx={{ color: '#cccccc' }}>
                    Nossa equipe é formada por especialistas com anos de experiência.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ 
        backgroundColor: '#1a1a1a', 
        py: { xs: 6, sm: 8 },
        width: '100vw',
        overflowX: 'hidden'
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, color: '#e7e9ea', fontWeight: 'bold' }}
          >
            Nossos Serviços
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              {
                title: 'Corte de Cabelo',
                description: 'Corte moderno e clássico com as melhores técnicas',
                image: '/images/corte.jpg',
              },
              {
                title: 'Barba',
                description: 'Modelagem e hidratação completa da barba',
                image: '/images/barba.jpg',
              },
              {
                title: 'Combo',
                description: 'Corte de cabelo + barba com desconto especial',
                image: '/images/combo.jpg',
              },
            ].map((service, index) => (
              <Grid item xs={12} md={4} key={index}>
                <ServiceCard sx={{ backgroundColor: '#000000', color: '#e7e9ea' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={service.image}
                    alt={service.title}
                  />
                  <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ color: '#1d9bf0' }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                </ServiceCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Sobre */}
      <Box sx={{ 
        py: { xs: 6, sm: 8 }, 
        backgroundColor: '#000000',
        width: '100vw',
        overflowX: 'hidden'
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={6} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h2" gutterBottom sx={{ color: '#e7e9ea' }}>
                Sobre Nós
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: '#cccccc' }}>
                A Barbearia dos Parças é um espaço acolhedor que oferece muito mais do que um simples corte de cabelo.
                Nossa equipe de profissionais altamente qualificados oferece uma experiência única, combinando
                técnicas modernas com o tradicional cuidado capilar.
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: '#cccccc' }}>
                Com ambiente descontraído e atendimento personalizado, garantimos a satisfação total dos nossos clientes.
                Venha conhecer o que há de melhor em cuidados capilares e fazer parte da nossa família.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/barbearia_parcas.png"
                alt="Logo da Barbearia dos Parças"
                sx={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  backgroundColor: 'transparent'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contato */}
      <Box sx={{ 
        py: { xs: 6, sm: 8 }, 
        backgroundColor: '#1a1a1a',
        width: '100vw',
        overflowX: 'hidden'
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h2" component="h2" align="center" gutterBottom sx={{ color: '#e7e9ea' }}>
            Entre em Contato
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 6, color: '#cccccc' }}>
            Siga-nos nas redes sociais ou entre em contato via WhatsApp
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <SocialButton sx={{ color: '#c4a484', '&:hover': { color: '#b3916f' } }}>
              <InstagramIcon />
            </SocialButton>
            <SocialButton sx={{ color: '#c4a484', '&:hover': { color: '#b3916f' } }}>
              <FacebookIcon />
            </SocialButton>
            <SocialButton sx={{ color: '#c4a484', '&:hover': { color: '#b3916f' } }}>
              <WhatsAppIcon />
            </SocialButton>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<WhatsAppIcon />}
              onClick={handleWhatsAppClick}
              sx={{
                borderColor: '#c4a484',
                color: '#c4a484',
                '&:hover': {
                  borderColor: '#b3916f',
                  backgroundColor: 'rgba(196, 164, 132, 0.1)',
                },
                py: 2,
                fontSize: '1.1rem',
                borderRadius: '30px',
                textTransform: 'none',
                borderWidth: '2px',
              }}
            >
              Agende pelo WhatsApp
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Informações de Contato */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100vw',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          py: 2,
          zIndex: 1000,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WhatsAppIcon />
                <Typography>
                  <a
                    href="https://wa.me/5535991455692"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'white', textDecoration: 'none' }}
                  >
                    (35) 99145-5692
                  </a>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon />
                <Typography>Rua Barão do Rio Branco, 9 | Três Corações</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon />
                <Typography>
                  Seg a Sáb: 10h - 20h (Sáb: 9h - 18h)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Botão WhatsApp Flutuante */}
      <IconButton
        onClick={handleWhatsAppClick}
        sx={{
          position: 'fixed',
          bottom: 100,
          right: 20,
          backgroundColor: '#25D366',
          color: 'white',
          '&:hover': {
            backgroundColor: '#128C7E',
          },
          width: 60,
          height: 60,
          zIndex: 1000,
        }}
      >
        <WhatsAppIcon sx={{ fontSize: 40 }} />
      </IconButton>

      {/* Botão de área administrativa */}
      <Button
        onClick={() => navigate(user ? '/admin/barbers' : '/login')}
        variant="outlined"
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          borderColor: '#c4a484',
          color: '#ffffff',
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          borderWidth: 2,
          '&:hover': {
            borderColor: '#b3916f',
            backgroundColor: 'rgba(196, 164, 132, 0.2)',
            borderWidth: 2,
          }
        }}
      >
        {user ? 'Área Administrativa' : 'Login'}
      </Button>
    </Box>
  );
};

export default LandingPage; 