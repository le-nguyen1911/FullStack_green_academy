const fail = (status, message) => {
    const err = new Error(message);
    err.status = status;
    throw err;
};

const cents = (value) => {
    if (typeof value !== "string" || !/^(0|[1-9]\d{0,12})(\.\d{1,2})?$/.test(value)) {
        fail(400, "Cần DECIMAL dạng chuỗi từ mysql2");
    }
    const [whole, frac = ""] = value.split(".");
    return BigInt(whole) * 100n + BigInt(frac.padEnd(2, "0"));
};

const money = (amountCents) => {
    const value = typeof amountCents === "bigint" ? amountCents : BigInt(amountCents);
    const sign = value < 0n ? "-" : "";
    const abs = value < 0n ? -value : value;
    const whole = abs / 100n;
    const frac = String(abs % 100n).padStart(2, "0");
    return `${sign}${whole.toString()}.${frac}`;
};

module.exports = { cents, money };