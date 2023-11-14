import { NextRequest, NextResponse } from "next/server";

import { cookies } from 'next/headers';

import { permanentRedirect } from "next/navigation";

import axios from 'axios';

// 직렬화 주의
// NextResponse를 반환해야함.
// axios.post 대신, fetch 사용한 다음, 상태에 따라 동작 분화하는게 맞을 것 같음.

// NextRespons를 생성할 때, 해당 response의 쿠키를 설정하거나 반환할 redirect도 지정할 수 있음.

export async function POST (request: NextRequest)
{
    let response;
    let error_status;

    try
    {
        const   data = await request.json();

        console.log('api/user_create - data: ', data);

        response = await axios.post(process.env.NEXT_PUBLIC_API_URL + 'auth/signup', {
            access_token: data.access_token,
            nick_name: data.nick_name,
            // img_name: data.img_name
        });
        // created 201
        console.log("===============tettettettettettettettettettettettet");
        console.log(typeof response.data.userdata.user_id)
    }
    catch (err)
    {
        console.log('api/user_create failed');
        console.log('error response -', err?.response);
        error_status = err?.response.data.statusCode;

        console.log('error status - ', error_status);
        // error response 만들어야함.
        // error 분석 필요 - 닉네임 중복, 
        return (NextResponse.json({ error: 'api/user_create Error'}, { status: error_status}));
    }
    // 성공 시 main_frame으로 이동. cookie는 어떻게하는게 맞을까? 일단 access_token, refresh_token 보관은 필요함.
    // 실패 시 실패를 알리기 위한 구조를 반환하고 동작 처리

    if (response.data.token.status == true)
    {
        const cookieBox = cookies();
        console.log('status:', response.data.status);
        cookieBox.set('access_token', response.data.token.access_token, {
            path: '/',
            maxAge: 60 * 60 * 3,
            // httpOnly: true,
        });
        cookieBox.set('refresh_token', response.data.token.refresh_token, {
            path: '/',
            maxAge: 60 * 60 * 3,
            // httpOnly: true,
        });
        cookieBox.set('nick_name', response.data.userdata.nick_name, {
            path: '/',
            maxAge: 60 * 60 *3,
            // httpOnly: true,
        });
        cookieBox.set('user_id', response.data.userdata.user_id, {
            path: '/',
            maxAge: 60 * 60 * 3,
            // httpOnly: true,
        });
        // permanentRedirect('/main_frame');
        // 왜 나중에 다시 login 쪽으로 돌아가는가?
    }
    // 여기까지 수행하면 router handler의 헤더에 set-cookie는 설정될 것이다.

        return (NextResponse.json({
            status: response?.data.token.status,
            access_token: response?.data.token.access_token,
            refresh_token: response?.data.token.refresh_token
        },
        {
            status: response?.status
        }
        ));
}
