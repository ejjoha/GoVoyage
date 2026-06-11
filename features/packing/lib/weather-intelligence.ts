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
        const response = await fetch(
            `/api/weather-summary?destination=${encodeURIComponent(destination)}`
        );

        if (!response.ok) return null;

        const data = await response.json();

        if (!data) return null;

        const suggestedProfiles: ClimateOption[] = [];

        if (typeof data.temperature === "number" && data.temperature >= 24) {
            suggestedProfiles.push("Hot");
        }

        if (typeof data.temperature === "number" && data.temperature <= 8) {
            suggestedProfiles.push("Cold");
        }

        if (
            typeof data.precipitationProbability === "number" &&
            data.precipitationProbability >= 50
        ) {
            suggestedProfiles.push("Rainy");
        }

        return {
            locationName: data.locationName,
            temperature: data.temperature,
            precipitationProbability: data.precipitationProbability,
            weatherLabel: data.weatherLabel,
            suggestedProfiles,
        };
    } catch (error) {
        console.error("Failed to load trip weather summary", error);
        return null;
    }
}