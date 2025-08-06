type Config = {
  appUsername: string;
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
  private config: Config;
  private headers = new Headers();
  private token: string;
  private demoUrl = "https://demo.campay.net/api";
  // private demoUrl = "https://campay.net/api";

  constructor(config: Config) {
    this.config = {
      appUsername: config.appUsername,
      appSecret: config.appSecret,
      baseUrl: config.baseUrl || this.demoUrl,
    };
    this.headers.append("accept", "application/json");
    this.headers.append("Content-Type", "application/json");
  }

  buildUrl(path: string) {
    return `${this.config.baseUrl}/${path}`;
  }

  /*
   * Get token
   * If token is already set, return it
   * Otherwise, get token from server
   */
  private async getToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }
    const res = await fetch(this.buildUrl("token/"), {
      method: "POST",
      headers: this.headers,
      redirect: "follow",
      body: JSON.stringify({
        username: this.config.appUsername,
        password: this.config.appSecret,
      }),
    });
    const tokenData = (await res.json()) as {
      token: string;
      expires_in: number;
    };
    this.token = tokenData.token;
    return this.token;
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${await this.getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${await this.getToken()}`,
      },
    });
    return response.json();
  }

  /*
   * Withdraw
   **/
  async withdraw(data: WithdrawData) {
    const response = await fetch(this.buildUrl("withdraw/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${await this.getToken()}`,
      },
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${await this.getToken()}`,
      },
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${await this.getToken()}`,
      },
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${await this.getToken()}`,
        body: JSON.stringify(data),
      },
    });
    return await response.json();
  }
}
