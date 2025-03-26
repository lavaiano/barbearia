import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1d9bf0',
      light: '#1a8cd8',
      dark: '#1a8cd8',
    },
    background: {
      default: '#000000',
      paper: '#000000',
    },
    text: {
      primary: '#e7e9ea',
      secondary: '#71767b',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#000000',
          color: '#e7e9ea',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#2f3336',
          color: '#e7e9ea',
        },
        head: {
          backgroundColor: '#000000',
          color: '#71767b',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          borderColor: '#2f3336',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#e7e9ea',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 9999,
        },
        contained: {
          backgroundColor: '#1d9bf0',
          '&:hover': {
            backgroundColor: '#1a8cd8',
          },
        },
        outlined: {
          borderColor: '#1d9bf0',
          color: '#1d9bf0',
          '&:hover': {
            borderColor: '#1a8cd8',
            backgroundColor: 'rgba(29, 155, 240, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#e7e9ea',
            '& fieldset': {
              borderColor: '#2f3336',
            },
            '&:hover fieldset': {
              borderColor: '#1d9bf0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1d9bf0',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#71767b',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#e7e9ea',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2f3336',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1d9bf0',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1d9bf0',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#e7e9ea',
          '&:hover': {
            backgroundColor: 'rgba(29, 155, 240, 0.1)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#000000',
          borderRight: '1px solid #2f3336',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(29, 155, 240, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          borderBottom: '1px solid #2f3336',
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: '#e7e9ea',
          '&.Mui-selected': {
            backgroundColor: '#1d9bf0',
            '&:hover': {
              backgroundColor: '#1a8cd8',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(29, 155, 240, 0.1)',
          },
        },
      },
    },
    MuiCalendarPicker: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          color: '#e7e9ea',
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: {
          color: '#e7e9ea',
        },
        iconButton: {
          color: '#71767b',
          '&:hover': {
            backgroundColor: 'rgba(29, 155, 240, 0.1)',
          },
        },
      },
    },
  },
}); 