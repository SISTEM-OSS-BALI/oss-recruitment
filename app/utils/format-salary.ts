export default function formatSalary(
    min?: number | null,
    max?: number | null,
) {
    const formatValue = (value?: number | null) => {
        if (value === null || value === undefined) return "-";
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return "-";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(numeric);
    };

    if (
        min !== null &&
        min !== undefined &&
        max !== null &&
        max !== undefined &&
        min !== max
    ) {
        return `${formatValue(min)} - ${formatValue(max)}`;
    }

    return formatValue(min ?? max);
}
