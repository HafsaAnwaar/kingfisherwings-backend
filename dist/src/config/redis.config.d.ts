declare const _default: (() => {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
    keyPrefix: string;
    ttl: {
        default: number;
        session: number;
        permissions: number;
        exchangeRates: number;
        masters: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    password: string | undefined;
    db: number;
    keyPrefix: string;
    ttl: {
        default: number;
        session: number;
        permissions: number;
        exchangeRates: number;
        masters: number;
    };
}>;
export default _default;
