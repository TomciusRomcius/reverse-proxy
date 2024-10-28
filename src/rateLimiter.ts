export default class RateLimiter {
  private tokens: number = 0;
  private maxTokens: number;
  private refillRate: number; // tokens/second
  private lastRefill: number;

  public constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  public async tryRequest() {
    this.requestRefill();
    if (this.tokens > 0) {
      this.tokens--;
    } else {
      await this.delayUntilNextRequest();
    }
  }

  private requestRefill() {
    const seconds = (Date.now() - this.lastRefill) / 1000;
    const netTokens = Math.floor(this.refillRate * seconds);
    if (netTokens >= 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + netTokens);
      this.lastRefill = Date.now();
    }
  }

  public async delayUntilNextRequest() {
    const delay = 1000 / this.refillRate;
    await new Promise((resolve) => setTimeout(() => resolve(null), delay));
  }
}
