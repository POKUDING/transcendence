import { NextRequest, NextResponse } from "next/server";

import { permanentRedirect } from "next/navigation";

import axios from 'axios';

// 직렬화 주의
// NextResponse를 반환해야함.
// axios.post 대신, fetch 사용한 다음, 상태에 따라 동작 분화하는게 맞을 것 같음.

// NextRespons를 생성할 때, 해당 response의 쿠키를 설정하거나 반환할 redirect도 지정할 수 있음.

export async function POST (request: NextRequest)
{
    let response;
    let json_res;
    let data;
    let json_data;

    try
    {
        data = await request.json();

        console.log('api/user_check - data: ', data);

        response = await axios.post( `${process.env.NEXT_PUBLIC_API_URL}auth/login`, {  
            access_token: data.access_token,
        });

        console.log('---------------------------------------------------');
        console.log('/auth/login response.data -', response.data);
        console.log('---------------------------------------------------');
    }
    catch (error)
    {
        if (error.response)
        {
            return (NextResponse.json({
                error: 'user_check response error',
                error_status: response?.status,
                status: data.status,
                access_token: data.access_token
            }))
        }
        else if (error.request)
        {
            return (NextResponse.json({
                error: 'user_check request error'
            },{
                status: response?.status
            }))
        }
    }

    if (response?.data.status == false)
    {
        console.log('api/user_check failed');
        // 예외 처리
        return (NextResponse.json(
            {
                status: response?.data.status,
                access_token: response?.data.access_token
            },
            {status: 201, statusText: 'new user need to be created'}));
    }

    console.log('newResponse============================================');
    console.log('response.data -', response.data);

    const newResponse = NextResponse.json(
        {
            status: response?.data.token.status,
            twoFAPass: response?.data.twoFAPass,
            access_token: response?.data.token.access_token,
            refresh_token: response?.data.token.refresh_token,
            nick_name: response?.data.userdata.nick_name,
            user_id: response?.data.userdata.user_id

        },
        {
            status: 200,
            statusText: "will be redirected to main_frame",
            //headers:
        },
    );



    return (newResponse);

}
