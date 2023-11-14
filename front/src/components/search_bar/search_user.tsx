import React from 'react';
import { useState } from 'react';
import axios from 'axios';
// import { UserContext } from '../../pages/main'; 

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// 로딩되기 전에 그림자 띄울 수 있음. 아직 적용하지 않았음. 
import Skeleton from '@mui/material/Skeleton';

// styled component (컴포넌트 고정 style로 보임)
import { styled } from '@mui/system';


const MainSearchUser = styled(TextField) ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 400,
  height: 100,
  color: "black"
});

const MainSearchButton = styled(Button) ({
    position: 'absolute',
    top: 0,
    left: 330,
    width: 70,
    height: 55,
    color: "black"
  });

interface SearchUserProps {
    setMTbox: (num: number, searchTarget: string) => void;
}

export default function SearchUser({ setMTbox }: SearchUserProps) {
    const [searchTarget, setSearchTarget] = useState('');

    const handleMTbox =  async (num: number, searchTarget: string) => {
        if (searchTarget) {
            await axios.get(`${process.env.NEXT_PUBLIC_API_URL}user/getdata/nickname/${searchTarget}`)
                .then((res) => {
                    // console.log(typeof res.data.userData.user_id)
                    if (res.data.status === true)
                        setMTbox(num, searchTarget);
                })
        }
    }

    const handleEnterkey = (e: any) => {
        if (e.key === 'Enter')
            handleMTbox(1, searchTarget);
    }

    return (
        <React.Fragment>
            <MainSearchUser
                id="outlined_search_user"
                label="유저 검색"
                variant="outlined"
                onChange={(e) => setSearchTarget(e.target.value)}
                onKeyDown={handleEnterkey}
                >
                Matching
            </MainSearchUser>
            <MainSearchButton
                variant='contained'
                onClick={() => handleMTbox(1, searchTarget)}
                >
                검색
            </MainSearchButton>
        </React.Fragment>
    );
}