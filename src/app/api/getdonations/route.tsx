import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const {portalId } = await request.json();

 const query =`query MyQuery {
  donations(where: {portalId: "${portalId}"}) {
    amount
    datepaid
    portalId
    subscriber
    symbol
    token
  }
}`

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_GOLDSKY_ENDPOINT, { method: 'POST',headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query }),})

        if (!response.ok) {
          const errorData = await response.json();
          return NextResponse.json(errorData, { status: response.status });
        }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
