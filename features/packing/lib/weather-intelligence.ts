export type ClimateOption = "Hot" | "Cold" | "Rainy";

export type TripWeatherSummary = {
    locationName: string;
    temperature: number | null;
    precipitationProbability: number | null;
    weatherLabel: string;
    suggestedProfiles: ClimateOption[];
};
export async function getTripWeatherSummary(
    destination: string
): Promise<TripWeatherSummary | null> {
    if (!destination) return null;

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            destination
        )}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) return null;

        const geoData = await geoResponse.json();
        const location = geoData?.results?.[0];

        if (!location) return null;

        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,precipitation,weather_code&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto`;

        let forecastResponse: Response;

        try {
            forecastResponse = await fetch(forecastUrl);
        } catch (error) {
            console.error("Failed to fetch weather forecast", error);
            return null;
        }

        if (!forecastResponse.ok) return null;

        const forecastData = await forecastResponse.json();

        const currentTemperature = forecastData?.current?.temperature_2m ?? null;
        const precipitationProbability =
            forecastData?.daily?.precipitation_probability_max?.[0] ?? null;

        const suggestedProfiles: ClimateOption[] = [];

        if (typeof currentTemperature === "number" && currentTemperature >= 24) {
            suggestedProfiles.push("Hot");
        }

        if (typeof currentTemperature === "number" && currentTemperature <= 8) {
            suggestedProfiles.push("Cold");
        }

        if (
            typeof precipitationProbability === "number" &&
            precipitationProbability >= 50
        ) {
            suggestedProfiles.push("Rainy");
        }

        return {
            locationName: `${location.name}${location.country ? `, ${location.country}` : ""}`,
            temperature: currentTemperature,
            precipitationProbability,
            weatherLabel: getWeatherLabel(forecastData?.current?.weather_code),
            suggestedProfiles,
        };
    } catch (error) {
        console.error("Failed to load trip weather summary", error);
        return null;
    }
}

function getWeatherLabel(code?: number) {
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