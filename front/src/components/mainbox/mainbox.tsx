import React from 'react';
import ProfilePage from './profile';
import ChatRoomPage from './chatroom';
import MatchingButton from './match';

const MainBox = (props: any) => {
  const value = props.mod;
  const search = props.search;
  const handleRender = () => {
    if (value === 1)
      return <ProfilePage nickname={search}/>;
    else if (value === 2)
		  return <ChatRoomPage />;
    else
		  return <MatchingButton />;
  };	

  return <div>{handleRender()}</div>;
};

export default MainBox;