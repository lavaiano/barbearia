import React from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {
  ContentCut as ServiceIcon,
  Assessment as ReportIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 240;

const AdminPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const menuItems = [
    { text: 'Barbeiros', icon: <PersonOutlineIcon />, path: '/admin/barbers' },
    { text: 'Serviços', icon: <ServiceIcon />, path: '/admin/services' },
    { text: 'Relatórios', icon: <ReportIcon />, path: '/admin/reports' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const drawer = (
    <Box sx={{ bgcolor: '#000000', height: '100%' }}>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              color: '#ffffff',
              '&.Mui-selected': {
                bgcolor: 'rgba(29, 155, 240, 0.2)',
                color: '#1d9bf0',
                '&:hover': {
                  bgcolor: 'rgba(29, 155, 240, 0.3)',
                }
              },
              '&:hover': {
                bgcolor: 'rgba(29, 155, 240, 0.1)',
              }
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? '#1d9bf0' : '#ffffff' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            color: '#ffffff',
            '&:hover': {
              bgcolor: 'rgba(29, 155, 240, 0.1)',
            }
          }}
        >
          <ListItemIcon sx={{ color: '#ffffff' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#000000', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: '#000000',
          borderBottom: '1px solid #2f3336',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: '#ffffff' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ color: '#ffffff' }}>
            Área Administrativa
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#000000',
              borderRight: '1px solid #2f3336'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#000000',
              borderRight: '1px solid #2f3336'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: '#000000'
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AdminPage; 