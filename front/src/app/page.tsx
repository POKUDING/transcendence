// import { permanentRedirect } from 'next/navigation';

import {redirect} from 'next/navigation';

export default async function entrance () {

//   const cookies = new Cookies();
//   const token = cookies.get('access_token');
//   const refresh_token = cookies.get('refresh_token');
//     if (token && refresh_token)
//       redirect('/main');
//     else
    // 쿠키 확인해서 그대로 main으로 보낼 수도 있음

    // permanentRedirect('/index');
    redirect('/entrance');
}