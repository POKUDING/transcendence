"use client"

import axios from 'axios';

import { useState } from 'react';
import { useRouter } from 'next/navigation'


export default function Signup (props:any) {
  const [profileImage, setFile] = useState<File>();
  const [nickname, setNickname] = useState('');
  const [ImageUrl, setImageUrl] = useState<string | null>(null);

  const router = useRouter();
  const formData = new FormData()
  
  let success = false;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("\n\n==============================file==============================\n\n", file); // kyeonkim
    if (file) {
      setFile(file);
      const imageURL = URL.createObjectURL(file);
      setImageUrl(imageURL)
    }
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  const handleSetData = async () => {
    if (profileImage) {
      // formData.append('nick_name', nickname);
      formData.append('file', profileImage);
    }
    const response = await fetch('http://10.13.8.1:3000/api/user_create', {
      method: 'POST',
      body: JSON.stringify({
        access_token: props.access_token,
        nick_name: nickname,
      }),
      headers: {
        Authorization: `Bearer ${props.access_token}`,
      },
    });

    if (!response.ok) {
      console.log('signup login/api fail', response);
      // router.replace('entrance');
    }

    // const res_img = await fetch('http://10.13.9.4:4242/user/upload', {
    //   method: 'POST',
    //   body: FormData,
    // });

    // console.log('profile: ', formData);

    for (let key of formData.keys()) {
      console.log(key);
    }  

    for (let value of formData.values()) {
    console.log(value);
    }

    const res_img = await axios.post('http://10.13.8.1.:3000/api/send_image',
    formData,
    {
      headers: {
      'Content-Type': 'multipart/form-data',
    }}
    );
    
    // console.log('profile: ', profileImage);
    // const res_img = await axios.post('http://10.13.8.1.:3000/api/send_image',
    // profileImage,
    // {
    //   headers: {
    //   'Content-Type': 'multipart/form-data',
    // }}
    // );

    // {
      // file: profileImage,
      // nick_name: nickname,
    // });

    // // api wrapper
    // const res_img = await fetch('http://10.13.8.1.:3000/api/send_image', {
    //   method: 'POST',
    //   // body: formData,
    //   body: {
    //     file: profileImage
    //   }
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   }
    // })
    // console.log('profile: ', formData);
    // console.log('after res_img - ', res_img);

    // if (res_img.ok)

    if (res_img.data.success == true)
    {
      router.replace('/main_frame');
    } else {
      console.log('Image upload failed', res_img);
    }
  
  };


  return (
      <div>
          <p>this is server component - SendImage.</p>
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>Set User</h1>
          <div style={{ marginBottom: '20px' }}>
              <label htmlFor="profileImage">Image: </label>
              <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageUpload}
              />
          </div>
          {profileImage && (
              <div>
              <img
                  src={ImageUrl}
                  alt="프로필 사진"
                  style={{ width: '150px', height: '150px', borderRadius: '50%' }}
              />
              </div>
          )}
      <div style={{ marginTop: '20px' }}>
          <label htmlFor="nickname">Nickname: </label>
          <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={handleNicknameChange}
          />
      </div>
      <div style={{ marginTop: '20px' }}>
          <button onClick={handleSetData}>
          저장
          </button>
      </div>
    </div>
    </div>
  );
  
}