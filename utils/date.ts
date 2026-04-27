export function formatTripDateRange(start?: string, end?: string) {
    if (!start || !end) return "";

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return "";
    }

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    const startMonth = startDate.toLocaleDateString("en-GB", { month: "short" });
    const endMonth = endDate.toLocaleDateString("en-GB", { month: "short" });

    if (startMonth === endMonth) {
        return `${startDay}–${endDay} ${startMonth}`;
    }

    return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
}