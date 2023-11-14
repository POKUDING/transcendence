import Button from '@mui/material/Button';

// 로딩되기 전에 그림자 띄울 수 있음. 아직 적용하지 않았음. 
import Skeleton from '@mui/material/Skeleton';

// styled component (컴포넌트 고정 style로 보임)
import { styled } from '@mui/system';


const MainMatchingButton = styled(Button) ({
  backgroundColor: '#4fca35',
  position: 'absolute',
  top: 70,
  left: 50,
  width: 300,
  height: 170,
  color: "black",
  borderRadius: '100%',
});

interface MyProfileProps {
    setMTbox: (num: number, searchTarget: string) => void;
  
}

export default function MatchingButton({ setMTbox }: MyProfileProps) {

    const handleMTbox = (num: number) => () => {
        setMTbox(num, '');
    }

    return (
        <MainMatchingButton variant="outlined" onClick={handleMTbox(3)}>
            START
        </MainMatchingButton>
    );
}