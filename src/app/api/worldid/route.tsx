import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const {proof } = await request.json();

 
  try {
    const response = await fetch(
        'https://developer.worldcoin.org/api/v1/verify/app_staging_696c70b863a8fefb5305a02877b7e0f4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...proof, action: "hotspots-ethglobal-login"}),
        }
      );
        if (!response.ok) {
            const { code, detail } = await response.json();
             throw new Error(`Error Code ${code}: ${detail}`);
        }
        const verified  = await response.json();
    return NextResponse.json(verified);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
