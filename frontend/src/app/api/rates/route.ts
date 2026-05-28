import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=kes,usd,eur,gbp,ngn",
      { next: { revalidate: 300 } },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch rates" },
        { status: 502 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch rates" },
      { status: 500 },
    );
  }
}
