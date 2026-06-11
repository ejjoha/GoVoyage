import { NextRequest, NextResponse } from "next/server";

function getWeatherLabel(code?: number | null) {
    if (code === undefined || code === null) return "Weather available";

    if (code === 0) return "Clear sky";
    if ([1, 2, 3].includes(code)) return "Partly cloudy";
    if ([45, 48].includes(code)) return "Fog";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";

    return "Weather available";
}

export async function GET(request: NextRequest) {
    const destination = request.nextUrl.searchParams.get("destination");

    if (!destination) {
        return NextResponse.json(null, { status: 400 });
    }

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            destination
        )}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoUrl, {
            next: { revalidate: 60 * 60 },
        });

        if (!geoResponse.ok) {
            return NextResponse.json(null);
        }

        const geoData = await geoResponse.json();
        const location = geoData?.results?.[0];

        if (!location) {
            return NextResponse.json(null);
        }

        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,precipitation,weather_code&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto`;

        const forecastResponse = await fetch(forecastUrl, {
            next: { revalidate: 30 * 60 },
        });

        if (!forecastResponse.ok) {
            return NextResponse.json(null);
        }

        const forecastData = await forecastResponse.json();

        const temperature = forecastData?.current?.temperature_2m ?? null;
        const precipitationProbability =
            forecastData?.daily?.precipitation_probability_max?.[0] ?? null;
        const weatherCode = forecastData?.current?.weather_code ?? null;

        return NextResponse.json({
            locationName: `${location.name}${location.country ? `, ${location.country}` : ""}`,
            temperature,
            precipitationProbability,
            weatherLabel: getWeatherLabel(weatherCode),
            weatherCode,
        });
    } catch (error) {
        console.error("Weather summary API failed", error);
        return NextResponse.json(null);
    }
}