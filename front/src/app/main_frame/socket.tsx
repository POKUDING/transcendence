import { io } from "socket.io-client";
import { getCookie } from 'cookies-next';


const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`,
{
  query: {
      user_id: getCookie('user_id'),
  },
  extraHeaders: {
      token: getCookie('access_token'),
  },
});

export default socket;