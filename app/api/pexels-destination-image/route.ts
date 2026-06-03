import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { imageUrl: null, error: "Missing PEXELS_API_KEY" },
            { status: 500 }
        );
    }

    const { destination } = await request.json();

    if (!destination || typeof destination !== "string") {
        return NextResponse.json(
            { imageUrl: null, error: "Missing destination" },
            { status: 400 }
        );
    }

    const query = encodeURIComponent(`${destination} travel destination`);

    const response = await fetch(
        `https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape`,
        {
            headers: {
                Authorization: apiKey,
            },
            cache: "no-store",
        }
    );

    if (!response.ok) {
        return NextResponse.json(
            { imageUrl: null, error: "Pexels lookup failed" },
            { status: 500 }
        );
    }

    const data = await response.json();
    const photo = data.photos?.[0];

    const imageUrl =
        photo?.src?.large2x || photo?.src?.large || photo?.src?.original || null;

    return NextResponse.json({ imageUrl });
}