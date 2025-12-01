// backend/server.js
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());

// Validate env
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error("Missing STRIPE_SECRET_KEY in environment. Copy .env.example to .env and set STRIPE_SECRET_KEY.");
  process.exit(1);
}

const stripe = Stripe(stripeKey, { apiVersion: "2022-11-15" });

// Save raw body for webhook verification; JSON for other endpoints
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.get("/", (req, res) => res.send("QuickPay Stripe backend"));

// Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { amount, currency = "usd", favoriteId, favoriteName, return_url } = req.body;

    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "Provide amount as number (in cents)." });
    }

    const publicRoot = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 4242}`;

    // If client provided return_url, use it for success redirect (useful for deep links to app)
    // return_url should be a base URL / scheme (e.g., quickpay://transfer/success)
    const successUrl = return_url
      ? `${return_url}?session_id={CHECKOUT_SESSION_ID}`
      : `${publicRoot}/success?session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl = return_url ? `${return_url}?cancelled=true` : `${publicRoot}/cancel`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Send money to ${favoriteName || "recipient"}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        favoriteId: favoriteId ?? "",
        favoriteName: favoriteName ?? "",
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

// Verify Checkout Session (no webhook approach)
// GET /verify-checkout-session?session_id=cs_...
app.get("/verify-checkout-session", async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: "session_id required" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId.toString());
    // Optionally retrieve payment_intent for more details:
    // const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
    return res.json({
      id: session.id,
      payment_status: session.payment_status, // 'paid' is successful
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    });
  } catch (err) {
    console.error("Error retrieving session:", err);
    return res.status(500).json({ error: err.message || "failed to retrieve session" });
  }
});

// Webhook endpoint (kept for future use, verifies signature if secret set)
app.post("/webhook", bodyParser.raw({ type: "application/json" }), (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET not configured — webhook signature verification will be skipped. Configure for production.");
    return res.status(400).send("Webhook secret not configured");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("Checkout session completed:", session.id, "metadata:", session.metadata);
      // TODO: mark transfer complete in DB
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Simple pages for manual testing
app.get("/success", (req, res) => res.send("<h2>Payment Successful</h2><p>Close this window to return to the app.</p>"));
app.get("/cancel", (req, res) => res.send("<h2>Payment Cancelled</h2><p>No changes were made.</p>"));

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Stripe backend listening on port ${PORT}`));