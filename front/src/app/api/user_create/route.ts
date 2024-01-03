import { NextRequest, NextResponse } from "next/server";

import { cookies } from 'next/headers';

import { permanentRedirect } from "next/navigation";

import axios from 'axios';
import https from 'https';


export async function POST (request: NextRequest)
{
    let response;
    let error_status;

    try
    {
        console.log('user_create req ================\n', request);
        const   data = await request.json();
        // console.log('user_create data=================\n', data);

        // console.log('====nick_name====\n', data.nick_name);
        // console.log('====password====\n', data.password);

        response = await axios.post(process.env.NEXT_PUBLIC_API_DIRECT_URL + 'auth/signup', {
            // access_token: data.access_token,
            nick_name: data.nick_name,
            password: data.password
            // img_name: data.img_name
        });

        console.log('after signup ======\n ', response);

    }
    catch (err: any)
    {
        console.log('auth/signup error ==========IN\n');
        console.log(err);
        error_status = err?.response?.data?.status;

        console.log('auth/signup error ==========\n', err);

        return (NextResponse.json({ error: 'api/user_create Error'}, { status: error_status}));
        // return;
    }
    if (response.data.status == true && response.data.token.status == true)
    {
        const cookieBox = cookies();

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
    }
    else {
        return (NextResponse.json({
            status: false,
            message: response.data.message,
        },
        {
            status: 201
        }
        ));
    }

    return (NextResponse.json({
        status: response.data.token.status,
        access_token: response.data.token.access_token,
        refresh_token: response.data.token.refresh_token
    },
    {
        status: response.status
    }
    ));
}
