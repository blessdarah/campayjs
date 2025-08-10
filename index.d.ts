/**
 * JS/TS wrapper for Campay API
 * @author Bless Darah
 * @license MIT
 */
type Config = {
    appKey: string;
    appSecret: string;
    baseUrl?: string;
};
type CollectionData = {
    amount: number;
    currency: string;
    from: string;
    description: string;
    reference?: string;
    external_reference?: string;
};
type WithdrawData = {
    amount: number;
    currency: string;
    to: string;
    description: string;
    external_reference?: string;
};
type TBalanceResponse = {
    total_balance: number;
    mtn_balance: number;
    orange_balance: number;
    currency: string;
    utility_balance: number;
    utility_commission_balance: number;
};
type THistoryResponse = {
    datetime: string;
    code: string;
    operator_tx_code: string;
    operator: string;
    phone_number: string;
    description: string;
    external_user: string;
    amount: number;
    charge_amount: number;
    debit: number;
    credit: number;
    status: "SUCCESSFUL" | "FAILED" | "PENDING";
    reference_uuid: string;
};
export default class Campay {
    private static readonly DEFAULT_BASE_URL;
    private config;
    private token;
    private tokenExpiresAt;
    constructor(config: Config);
    buildUrl(path: string): string;
    private getToken;
    private refreshToken;
    private getHeaders;
    collect(data: CollectionData): Promise<{
        reference: string;
        ussd_code: string;
        operator: "MTN" | "ORANGE";
    }>;
    getTransactionStatus(reference: string): Promise<{
        reference: string;
        external_reference?: string;
        status: "SUCCESS" | "FAILED" | "PENDING";
        amount: number;
        currency: string;
        operator: "MTN" | "ORANGE";
        code: string;
        operator_reference: string;
        description: string;
        external_user: string | null;
        reason: string;
        phone_number: string;
    }>;
    withdraw(data: WithdrawData): Promise<any>;
    getAppBalance(): Promise<TBalanceResponse>;
    getTransactionHistory(startDate: string, endDate: string): Promise<THistoryResponse[]>;
    getPaymentLink(data: CollectionData & {
        first_name?: string;
        last_name?: string;
        email?: string;
        redirect_url?: string;
        failure_url?: string;
        payment_options?: "MOMO" | "CARD";
        paymer_can_pay_more?: "yes" | "no";
    }): Promise<{
        link: string;
    }>;
}
export {};
