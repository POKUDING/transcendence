

import { redirect } from 'next/navigation';
import axios from 'axios';

import Signup from './signup';
import CookieControl from './cookie_control';



export default async function Login ({searchParams}:any) {

  console.log('code:', searchParams.code);

  let status = false;
  const code = searchParams.code;

  let response;
  let access_token;
  let userData:any;
  let cookie_control = false;
  if (code)
  {
      try
      {
          response = await axios.post('https://api.intra.42.fr/oauth/token', {
          code: code,
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
          client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
          redirect_uri: `${process.env.NEXT_PUBLIC_FRONT_URL}login`,
          grant_type: 'authorization_code'
          });

          console.log('42api responses:', response.data);

      } catch (error) {

          if (error.response)
          {

          }
          else if (error.request)
          {
            console.log('Login - error occured');
            return (
             <></>
            );
          }
      }
  }

  try
  {
    userData = await axios.post( `${process.env.NEXT_PUBLIC_FRONT_URL}api/user_check`, {
      access_token: response?.data.access_token
    });

    console.log('user_check response - ', userData);
    // access_token = userData.data.access_token;
    // status = userData.data.status;


    // NextResponst.json() 문법을 잘 모르겠다. data를 두 겹으로 넣게 되어버림.
   
    // console.log('user_check response - ', userData);
    access_token = userData.data.data.access_token;
    status = userData.data.data.status;


    if (access_token == undefined
      || access_token == null)
      {
        throw new Error ('to entrance');
      }


  }
  catch (error)
  {
      console.log(error);
      redirect('/entrance');
  }


  if (userData?.data.data.refresh_token != undefined
    && userData?.data.data.refresh_token != null)
  {
      console.log('user_check success to cookie control');
      cookie_control = true
  }

  return (
    <div>
      {cookie_control? (
      <div>
        <p>this is server component - 42api.</p>
          <CookieControl access_token={userData?.data.data.access_token} refresh_token={userData?.data.data.refresh_token} />
      </div>
      ) : (
      <div>
        <p>this is server component - 42api.</p>
          <Signup access_token={access_token} />
      </div>
    )}
    </div>
  )


  // 이미 등록된 상태에서 동기화 문제로 인해 원하는 렌더링이 안됨.

  // return (
  //   <div>
  //     <p>this is server component - 42api.</p>
  //         <Signup access_token={access_token} />
  //     {/* <p>this is server component - 42api.</p> */}
  //         {/* <CookieControl access_token={userData?.data.access_token} refresh_token={userData?.data.refresh_token}/> */}
  //   </div>
  // );

}
