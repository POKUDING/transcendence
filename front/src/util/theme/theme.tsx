import { createTheme } from '@mui/system';

// ThemeProvider - app 전역에 적용하기 위한 css theme 설정
const theme = createTheme({
    palette: {
        primary: {
          main: 'grey'
        },
      },
});

export default theme;