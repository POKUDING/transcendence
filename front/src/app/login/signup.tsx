'use client'
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation'

export default function Signup (props:any) {
  const [profileImage, setFile] = useState<File>();
  const [nickname, setNickname] = useState('');
  const [ImageUrl, setImageUrl] = useState<string | null>(null);

  const router = useRouter();
  const formData = new FormData()
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    formData.append('nick_name', nickname);
    if (profileImage) {
      formData.append('file', profileImage);
    }
    const response = await fetch( `${process.env.NEXT_PUBLIC_FRONT_URL}api/user_create`, {
      method: 'POST',
      body: JSON.stringify({
        access_token: props.access_token,
        nick_name: nickname,
      }),
      // headers: {
      //   Authorization: `Bearer ${props.access_token}`,
      // },
    });

    if (!response.ok) {
      console.log('signup login/api fail', response);
    }

    const res_img = await axios.post(`${process.env.NEXT_PUBLIC_FRONT_URL}api/send_image`, formData)

    if (res_img.data.success == true) {
      router.replace('/main_frame');
    } else {
      console.log('Image upload failed', res_img);
    }
  
  };


  return (
      <div>
          <div>this is server component - SendImage.</div>
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