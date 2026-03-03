import CircuitBreaker from "opossum";
import axios from "axios";

async function fetchPrice(coin: string) {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
  );
  return response.data;
}

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
};

export const breaker = new CircuitBreaker(fetchPrice, options);