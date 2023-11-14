
"use client"

import React, { memo, createContext, useContext, useEffect, useState } from 'react';
import { Socket } from "socket.io-client"

import { useCookies } from "next-client-cookies"
import { io } from "socket.io-client";


const ChatSocketContext = createContext<Socket>(null);


export const useChatSocket = () => {
  return useContext(ChatSocketContext);
};

export function ChatSocket ({ children }: any) {
  const cookies = useCookies();
  const [socket, setSocket] = useState<Socket>();

  console.log("ChatSocket");

  useEffect(() => {

      console.log('user_id cookie - ', cookies.get('user_id'));

      const tmpSocket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`,
      {
        query: {
            user_id: cookies.get('user_id'),
        },
        extraHeaders: {
            token: cookies.get('access_token'),
        },
      });

      tmpSocket.on("connect" , () => {
        console.log('socket connected - ', tmpSocket.id); // value
      })
    
      tmpSocket.on("disconnect", () => {
        console.log('socket diconnected - ', tmpSocket.id); // undefined
      });

      setSocket(tmpSocket);

      return () => {
          tmpSocket.disconnect();
      }
  
  }, []);

  return (
    <ChatSocketContext.Provider value={socket}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export const memoChatSocket = memo(ChatSocket);

export default ChatSocket;


