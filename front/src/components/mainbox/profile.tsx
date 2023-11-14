'use client';
import React from 'react';
import styles from './mainbox.module.css';
import Button from '@mui/material/Button';
import Matchlist from './matchlist';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'next-client-cookies';
import OtpModal from '../profile/otp';
import TwoFAPass from '@/app/login/twoFAPass';


const ProfilePage = (props: any) => {
  const [isFriend, setIsFriend] = useState(false);
  const [isBlock, setIsBlock] = useState(false);
  const [isOTP, setIsOTP] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const cookies = useCookies();
  
  const userNickname = props.nickname;
  const my_id = Number(cookies.get('user_id'));
  const my_nick = cookies.get('nick_name');
  const access_token = cookies.get('access_token');

  console.log("my_id: " + my_id);
  console.log("userNickname: " + userNickname);

  // useEffect(() => {
  //   const sseEvents = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}event/friendlist/${cookies.get('user_id')}`);
    
  //   sseEvents.onopen = function() {
  //   }
    
  //   sseEvents.onerror = function (error) {
  //   }
    
    // sseEvents.onmessage = function (stream) {
    //   if (stream.data.nick === userNickname) {
    //     setRendering(stream.data);
    //   }
  //   }
  //   return () => {
  //     sseEvents.close();
  //   };

  // }, [])

  useEffect(() => {
    const fetchData = async () => {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}user/getdata/nickname/${userNickname}`) 
        .then((res) => {
        if (res.data.userData.twoFA)
          setIsActivated(true);
        else
          setIsActivated(false);
        })
      }

    const fetchFriendData = async () => {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}social/checkFriend`,{
        params: { user1: my_id , user2: userNickname},
      })
      .then((res) => {
        console.log(res.data)
        if (res.data.status)
          setIsFriend(true);
        else
          setIsFriend(false);
        console.log(isFriend);
      });
    };
    fetchData();
    if (userNickname !== my_nick)
      fetchFriendData();
  }, [userNickname, isFriend, isOTP]);

  const handleFriend = async () => {
    if (isFriend) {
      console.log("delete friend!!!");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}social/DeleteFriend`,{
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        data: {
          user_id: my_id,
          user_nickname: my_nick,
          friend_nickname: userNickname
        }})
      .then((res) => {
        console.log(res.data)
        setIsFriend(false);
      })
      .catch((err) => {
        //토큰이 만료되었을때
        //리프레쉬토큰을들고 토큰 재발급후 쿠키에 저장해야함
        console.log(err);
      })
    }
    else {
      console.log("add friend!!!");
      console.log(my_id, my_nick, userNickname);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}social/addFriend`,{
        user_id: my_id,
        user_nickname: my_nick,
        friend_nickname: userNickname
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
      })
      .then((res) => {
        console.log(res.data)
        setIsFriend(true);
      })
    }
   }
 
  const handleBlock = () => {setIsBlock(true)}
  const handleClose = () => {setIsOTP(false)}
  const handleActivte = (value: boolean) => {setIsActivated(value)}
  const handleOTP = () => {
    if (isActivated)
      //나중에 비활성화 로직 넣기 -> 2차인증 비활성화 api
      setIsActivated(false)
    setIsOTP(true)
  }

  const imageLoader = ({ src }: any) => {
    return `${process.env.NEXT_PUBLIC_API_URL}user/getimg/nickname/${src}`
  }

  return (  
    <div className={styles.mainContainer}>
      <div className={styles.topComponent}>
      <div className={styles.imageContainer}>
          <Image loader={imageLoader} src={`${userNickname}`} alt="User Image" className={styles.userImage} width={0} height={0} /> 
          <div className={styles.userName}>
            {userNickname !== my_nick ? `${userNickname}` : my_nick}
          </div>
          {userNickname !==  my_nick ? ( 
            <div className={styles.imageContent}>
              <div className={styles.buttons}>
                {isFriend? (
                  <Button variant="outlined" className={styles.roundButton} onClick={() => handleFriend()}>
                    친구삭제
                  </Button>
                  ) : (
                  <Button variant="outlined" className={styles.roundButton} onClick={() => handleFriend()}>
                    친구추가
                  </Button>
                  )}
                <Button variant="outlined" className={styles.roundButton} onClick={() => handleBlock()}>
                  차단
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.imageContent}>
              <div className={styles.buttons}>
                <Button variant="outlined" className={styles.roundButton}>
                  프로필 수정
                </Button>
                <Button variant="outlined" className={styles.roundButton} onClick={() => handleOTP()}>
                  {isActivated? '2차인증 비활성화' : '2차인증 활성화'}
                </Button>
                <Button variant="outlined" className={styles.roundButton}>
                  로그아웃
                </Button>
              </div>
              <OtpModal
                open={isOTP}
                isActivated={isActivated}
                setActive={handleActivte}
                onClose={handleClose}
                myId={my_id}
                myNick={my_nick}
                token={access_token}
                />
              {/* <TwoFAPass/> */}
            </div>
          )}
        </div>
      </div>
      <div className={styles.bottomHalfContainer}>
          <Matchlist id={userNickname} />
      </div>
    </div>
  );
}

export default ProfilePage;
