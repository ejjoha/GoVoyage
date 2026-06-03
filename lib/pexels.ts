export async function getDestinationImage(destination: string) {
    const response = await fetch("/api/pexels-destination-image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ destination }),
    });

    if (!response.ok) {
        console.error("Destination image lookup failed:", response.status);
        return null;
    }

    const data = await response.json();

    return data.imageUrl || null;
}