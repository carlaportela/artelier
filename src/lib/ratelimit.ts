//Limitador de número de peticiones para evitar abuso

import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "~/env";

type RateLimiter = { limit: (id: string) => Promise<{ success: boolean }> };

const noopLimiter: RateLimiter = {
  limit: async () => ({ success: true }),
};

function makeRedis(): Redis | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn(
      "[Artelier] Upstash Redis no configurado: UPSTASH_REDIS_REST_URL y/o " +
        "UPSTASH_REDIS_REST_TOKEN ausentes. Rate limiting desactivado.",
    );
    return null;
  }
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function createLimiter(requests: number, window: Duration): RateLimiter {
  const redis = makeRedis();
  if (!redis) return noopLimiter;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

//Limites de peticiones de autenticación, mensajes, checkout y disputas.
export const authLimiter = createLimiter(10, "60 s");
export const messageLimiter = createLimiter(30, "60 s");
export const orderStatusLimiter = createLimiter(30, "60 s");
export const checkoutLimiter = createLimiter(5, "60 s");
export const disputeLimiter = createLimiter(5, "1 h");
//Subida de imágenes, creación de conversaciones y onboarding de Stripe Connect.
export const uploadLimiter = createLimiter(20, "60 s");
export const conversationLimiter = createLimiter(10, "60 s");
export const stripeConnectLimiter = createLimiter(5, "5 m");
