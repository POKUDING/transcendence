import Grid from '@mui/material/Grid';

import Typography from '@mui/material/Typography';

// 로딩되기 전에 그림자 띄울 수 있음. 아직 적용하지 않았음. 
import Skeleton from '@mui/material/Skeleton';

// styled component (컴포넌트 고정 style로 보임)
import { styled } from '@mui/system';

// item component의 의미는?

const MainChatRoomList = styled(Grid) ({
  position: 'absolute',
//   top: 0,
//   left: 400,
//   width: 1000,
//   height: 1000
});

export default function ChatRoomList() {
    return (
        <MainChatRoomList container rowSpacing={1} columnSpacing={1}>
            <Grid item md={6}>
                {/* <Item>1</Item> */}
            </Grid>
        </MainChatRoomList>
    );
}