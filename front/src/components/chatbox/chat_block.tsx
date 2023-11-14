'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';

import Chat from './chat';
import ChatRoomCreate from './chat_room_create';

import { styled } from '@mui/system';
import ChatRoomList from './chat_rooms';

import { useCookies } from 'next-client-cookies'

// chatroomlist에서 요청의 결과로 받은 응답에 채팅방의 데이터가 들어있는가?
// chat에서 한 번 더 요청하여 채팅방의 데이터를 받아오는가?

export default function ChatBlock(props: any) {
	const cookies = useCookies();
	const [renderMode, setRenderMode] = useState(0);

	const handleRenderMode = (mode :number) => {
		// 요청을 보내서 방에 넣는다.

		setRenderMode(mode);

	}

	async function getUserData() {
		await axios.get(`${process.env.NEXT_PUBLIC_API_URL}user/getdata/nickname/${cookies.get("nick_name")}`) 
		.then((res) => {
		if (res.data.userData.roomuser !== null)
		{
			if (res.data.userData.roomuser.chatroom_id)
			console.log("ChatBlock - user is in chatroom");
			setRenderMode(2);
		}
		else
		{
			console.log("user is not in chat room");
			setRenderMode(0);
			// setInRoom(true);
		}
		})
	}

	useEffect(() => {

		// 조건에 맞으면 handleinRoom
			// 나 자신이 채팅방에 들어가있는지 확인
			// 로그인할 때 user_data 받는데, 그걸 넘겨주면 될 수도 있음.
				// 근데 이렇게 넘겨주면, 나중에 자신이 소속된 방이 변경될 떄 어디서 받아서 어디서 저장하는가가 중요해짐
		if (renderMode !== 1)
			getUserData();
	}, [])

	const { setMTbox } = props;

	// 채널 리스트
	
	// AppBar 다루는 방법 고민해보기. 공용 컴포넌트로 만들고 동작 함수를 밑에 넣는다?
		// 채팅방일 때, 채팅방 목록일 때의 동작 차이 이야기해보기

	if (renderMode === 0)
	{
		return (
			<ChatRoomList handleRenderMode={handleRenderMode} />
		);
	}
	else if (renderMode === 1)
	{
		return (
			<ChatRoomCreate handleRenderMode={handleRenderMode} />
		);
	}
	else if (renderMode === 2)
	{
		return (
			<Chat setMTbox={setMTbox} />
		);
	}
}

