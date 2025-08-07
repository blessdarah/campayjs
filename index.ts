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
  datetime: string; // Datetime
  code: string; // Transaction code
  operator_tx_code: string; // Operator transaction code
  operator: string; // Operator
  phone_number: string; // Phone number
  description: string; // Transaction description
  external_user: string; // External user
  amount: number; // Amount in cents
  charge_amount: number; // Charge amount in cents
  debit: number; // Debit amount in cents
  credit: number; // Credit amount in cents
  status: "SUCCESSFUL" | "FAILED" | "PENDING"; // Transaction status
  reference_uuid: string; // Unique reference for the transaction
};

export default class Campay {
  private static readonly DEFAULT_BASE_URL = "https://demo.campay.net/api";

  private config: Config;
  private token: string;
  private tokenExpiresAt: number; // timestamp in milliseconds

  constructor(config: Config) {
    this.config = {
      appKey: config.appKey,
      appSecret: config.appSecret,
      baseUrl: config.baseUrl || Campay.DEFAULT_BASE_URL,
    };
  }

  buildUrl(path: string) {
    return `${this.config.baseUrl}/${path}`;
  }

  /*
   * Get token - check expiration before using cached tokens
   */
  private async getToken(): Promise<string> {
    const now = Date.now();

    // Check if token exists and is still valid (with 5-minute buffer)
    if (
      this.token &&
      this.tokenExpiresAt &&
      now < this.tokenExpiresAt - 300000
    ) {
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
  private async refreshToken(): Promise<string> {
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

    const tokenData = (await res.json()) as {
      token: string;
      expires_in: number;
    };

    this.token = tokenData.token;
    this.tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;

    return this.token;
  }

  private async getHeaders() {
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
  async collect(data: CollectionData): Promise<{
    reference: string; // Unique reference for the transaction
    ussd_code: string; // USSD code to send to user
    operator: "MTN" | "ORANGE";
  }> {
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
  async getTransactionStatus(reference: string): Promise<{
    reference: string; // Unique reference for the transaction
    external_reference?: string; // Unique reference for the transaction
    status: "SUCCESS" | "FAILED" | "PENDING"; // Transaction status
    amount: number; // Amount in cents
    currency: string; // Currency
    operator: "MTN" | "ORANGE"; // Operator
    code: string; // Transaction code
    operator_reference: string; // Operator reference
    description: string; // Transaction description
    external_user: string | null; // External user
    reason: string; // Reason for transaction failure
    phone_number: string; // Phone number
  }> {
    const response = await fetch(this.buildUrl(`transaction/${reference}/`), {
      method: "GET",
      headers: await this.getHeaders(),
    });
    return await response.json();
  }

  /*
   * Withdraw
   **/
  async withdraw(data: WithdrawData) {
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
  async getAppBalance(): Promise<TBalanceResponse> {
    const response = await fetch(this.buildUrl("balance/"), {
      method: "GET",
      headers: await this.getHeaders(),
    });
    return await response.json();
  }

  /*
   * Get application transaction history given start and end dates
   **/
  async getTransactionHistory(
    startDate: string,
    endDate: string
  ): Promise<THistoryResponse[]> {
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
  async getPaymentLink(data: CollectionData): Promise<any> {
    const response = await fetch(this.buildUrl("get_payment_link/"), {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  }
}
