import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe('your_publishable_key');