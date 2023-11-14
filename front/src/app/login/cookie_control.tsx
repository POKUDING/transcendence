'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import axios from 'axios';


export default function CookieControl ({res}: {res: any}) {
    const router = useRouter();
    const { access_token, refresh_token, nick_name, user_id } = res;

    let   response_error = false;

    // if (otp)
    // {
    //     //do modal for otp
    //     //input 6 digit number and send to server
    // }
    console.log('cookie_control - res - ', res);
    async function CookieSetter (access_token:any, refresh_token:any, nick_name:any, user_id:any)
    {
        await axios.post(`${process.env.NEXT_PUBLIC_FRONT_URL}api/set_cookie`, {
            access_token: access_token,
            refresh_token: refresh_token,
            nick_name: nick_name,
            user_id: user_id
        })
        .then((res) => {
            console.log('cookie_control - respone - ', res.data);
            return (res);
        })
        .catch((err) => {
            console.log('cookie_control - error - ', err);
            throw new Error ('Cookie set fail');
        });
        // try
        // {
        //     const response = await axios.post(`${process.env.NEXT_PUBLIC_FRONT_URL}api/set_cookie`, {
        //         access_token: access_token,
        //         refresh_token: refresh_token,
        //         nick_name: nick_name,
        //         user_id: user_id
        //     });
        
        //     console.log('cookie_control - respone - ', response.data);
        //     return (response);
        // }
        // catch
        // {
        //     throw new Error ('Cookie set fail');
        // }
    }

    useEffect(() => {
        
        try
        {
            CookieSetter(access_token, refresh_token, nick_name, user_id);
            console.log('cookie set done');

            
            router.replace('/main_frame');

        }
        catch (error)
        {
            console.log('/login/cookie_control - fail to set cookie');
            response_error = true;
            router.replace("/entrance");
        }

    }, []);

    console.log('in useEffect');

    return (
        <div>
            <div>Cookie Control</div>
            {/* {otp && <otpModal />} */}
        </div>
      );
}
