import { createTheme } from '@mui/material/styles';

/**
 * Creates and exports the custom Material UI theme for the application.
 * This theme defines the color palette, typography, and component styles
 * to ensure a consistent and polished look and feel.
 */
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5865f2', // Brand accent color
    },
    secondary: {
      main: '#b9bbbe', // A lighter gray for secondary actions
    },
    background: {
      default: '#1e1f22', // Darkest background, brand-primary
      paper: '#2b2d31',   // Card and surface background, brand-secondary
    },
    text: {
      primary: '#f2f3f5', // Main text color, brand-light
      secondary: '#dbdee1', // Secondary text color, brand-text
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    // Customizing the default props for the Button component
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent ALL CAPS buttons
          borderRadius: 8,
        },
      },
    },
    // Customizing the default props for the Card component
    MuiCard: {
      defaultProps: {
        elevation: 2,
      },
       styleOverrides: {
        root: {
          borderRadius: 12, // More rounded corners for cards
        },
      },
    },
    // Customizing the default props for TextFields
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                }
            }
        }
    }
  },
});
