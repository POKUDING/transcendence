import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import CommentIcon from '@mui/icons-material/Comment';
import { useEffect, useState } from 'react';
import { useCookies } from 'next-client-cookies';
import axios from 'axios';


export default function FriendListPanel() {
  const [redering, setRendering] = useState('');
  const [hasFriend, setHasFriend] = useState(true);
  const [apiResponse, setApiResponse] = useState([]);
  const cookies = useCookies();
  
  useEffect(() => {
    const sseEvents = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}event/friendlist/${cookies.get('user_id')}`);
    
    sseEvents.onopen = function() {
    }
    
    sseEvents.onerror = function (error) {
    }
    
    sseEvents.onmessage = function (stream) {
      setRendering(stream.data);
    }
    return () => {
      sseEvents.close();
    };

  }, [])
  
  useEffect(() => {
    const fetchData = async () => {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}social/getFriendList/${cookies.get('user_id')}`)
      .then((response) => {
        if (response.data.status) {
          console.log('friend list=======');
          console.log(response);
          setHasFriend(true);
          setApiResponse(response.data.data);
        }
        else
          setHasFriend(false);
      })
    };

    fetchData();
  }, [redering]);

  const handleChat = (id: any) => () => {
    console.log("chat to " + id);
  };

  const handleProfile = (id: any) => () => {
    console.log('profile to ' + id);
  }
  
  const imageLoader = ({ src }: any) => {
    return `${process.env.NEXT_PUBLIC_API_URL}user/getimg/nickname/${src}`
  }
  
  return (
    <div>
      {hasFriend ? (
        <List dense sx={{ width: '100%', maxWidth: 400, maxHeight: 580,bgcolor: 'background.paper', overflow: 'auto'}}>
          {apiResponse.map((user) => {
            const labelId = `comment-list-secondary-label-${user.followed_user_id}`
            return (
              <ListItem
                key={user.followed_user_id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="comments"
                    onClick={handleChat(user.followed_user_nickname)}
                  >
                    <CommentIcon />
                  </IconButton>
                }
                disablePadding
              >
                <ListItemButton onClick={handleProfile(user.followed_user_nickname)}>
                  <ListItemAvatar>
                    <Avatar
                      src={user.followed_user_nickname ? imageLoader({src: user.followed_user_nickname}) : null}
                    />
                  </ListItemAvatar>
                  <ListItemText id={labelId} primary={`${user.followed_user_nickname}`} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      ) : (
        <p>친구가 없습니다.</p>
      )}
    </div>
  );
}