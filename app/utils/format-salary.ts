export default function formatSalary(salary: string | number) {
    const value =
        typeof salary === "string"
            ? Number(salary.replace(/[^0-9.-]+/g, ""))
            : salary;
    const normalized = Number.isFinite(Number(value)) ? Number(value) : 0;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(normalized);
}