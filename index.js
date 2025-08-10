/**
 * JS/TS wrapper for Campay API
 * @author Bless Darah
 * @license MIT
 */
export default class Campay {
    static DEFAULT_BASE_URL = "https://demo.campay.net/api";
    config;
    token;
    tokenExpiresAt; // timestamp in milliseconds
    constructor(config) {
        this.config = {
            appKey: config.appKey,
            appSecret: config.appSecret,
            baseUrl: config.baseUrl || Campay.DEFAULT_BASE_URL,
        };
    }
    buildUrl(path) {
        return `${this.config.baseUrl}/${path}`;
    }
    /*
     * Get token - check expiration before using cached tokens
     */
    async getToken() {
        const now = Date.now();
        // Check if token exists and is still valid (with 5-minute buffer)
        if (this.token &&
            this.tokenExpiresAt &&
            now < this.tokenExpiresAt - 300000) {
            return this.token;
        }
        // Refresh token
        return this.refreshToken();
    }
    /*
     * Refresh token
     * If token is already set, return it
     * Otherwise, get token from server
     */
    async refreshToken() {
        const res = await fetch(this.buildUrl("token/"), {
            method: "POST",
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify({
                username: this.config.appKey,
                password: this.config.appSecret,
            }),
        });
        const tokenData = (await res.json());
        this.token = tokenData.token;
        this.tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
        return this.token;
    }
    async getHeaders() {
        const token = await this.getToken();
        return {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        };
    }
    /*
     * Collect money from user
     */
    async collect(data) {
        const response = await fetch(this.buildUrl("collect/"), {
            method: "POST",
            headers: await this.getHeaders(),
            body: JSON.stringify(data),
        });
        return await response.json();
    }
    /*
     * Get transaction status
     */
    async getTransactionStatus(reference) {
        const response = await fetch(this.buildUrl(`transaction/${reference}/`), {
            method: "GET",
            headers: await this.getHeaders(),
        });
        return await response.json();
    }
    /*
     * Withdraw
     **/
    async withdraw(data) {
        const response = await fetch(this.buildUrl("withdraw/"), {
            method: "POST",
            headers: await this.getHeaders(),
            body: JSON.stringify(data),
        });
        return await response.json();
    }
    /*
     * Get balance of registered app
     **/
    async getAppBalance() {
        const response = await fetch(this.buildUrl("balance/"), {
            method: "GET",
            headers: await this.getHeaders(),
        });
        return await response.json();
    }
    /*
     * Get application transaction history given start and end dates
     **/
    async getTransactionHistory(startDate, endDate) {
        const response = await fetch(this.buildUrl("history/"), {
            method: "POST",
            headers: await this.getHeaders(),
            body: JSON.stringify({
                start_date: startDate,
                end_date: endDate,
            }),
        });
        return await response.json();
    }
    /*
     * Get payment link
     * If payment link is already set, return it
     * Otherwise, get payment link from server
     */
    async getPaymentLink(data) {
        const response = await fetch(this.buildUrl("get_payment_link/"), {
            method: "POST",
            headers: await this.getHeaders(),
            body: JSON.stringify(data),
        });
        return await response.json();
    }
}
