import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { title, goal } = await request.json();

    // Call Lambda function via API Gateway
    const response = await fetch(process.env.BEDROCK_API_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, goal })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
