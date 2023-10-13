import { useState } from 'react';
import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// 로딩되기 전에 그림자 띄울 수 있음. 아직 적용하지 않았음. 
import Skeleton from '@mui/material/Skeleton';

// styled component (컴포넌트 고정 style로 보임)
import { styled } from '@mui/system';

const MainFriendPanal = styled(Box) ({
    position: 'absolute',
    top: 60,
    backgroundColor: 'white'
  })


export default function FriendListPanal (props: any) {
  const {value, index} = props;

  return (
    <div
        hidden={value !== index}
    >
        {value === index && (
            <MainFriendPanal sx={{ p: 2 }}>
            <Typography>
                test for text is changed. It is Friend Panal.
            </Typography>
            </MainFriendPanal>
        )}
    </div>
  );
}