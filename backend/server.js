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

/**
 * Quick mock recipient lookup (local dev / smoke test)
 * GET /api/recipients/:phone
 * - Returns a mock recipient object when phone === '5502494860'
 * - Otherwise returns 404
 *
 * Replace or remove this when you add a real DB-backed lookup.
 */
app.get("/api/recipients/:phone", (req, res) => {
  const phone = req.params.phone;
  if (!phone) return res.status(400).json({ error: "phone required" });

  if (phone === "5502494860" || phone.endsWith("5502494860")) {
    const mockRecipient = {
      accountNumber: "5502494860",
      firstName: "Test",
      lastName: "Recipient",
      email: "test.recipient@example.com",
      profilePicture: null,
    };
    return res.json({ recipient: mockRecipient });
  }

  return res.status(404).json({ message: "Recipient not found" });
});

// Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { amount, currency = "usd", favoriteId, favoriteName, return_url } = req.body;

    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "Provide amount as number (in cents)." });
    }

    const publicRoot = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 4242}`;

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

// Verify Checkout Session
app.get("/verify-checkout-session", async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: "session_id required" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId.toString());
    return res.json({
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    });
  } catch (err) {
    console.error("Error retrieving session:", err);
    return res.status(500).json({ error: err.message || "failed to retrieve session" });
  }
});

// Webhook endpoint (kept for future use)
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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("Checkout session completed:", session.id, "metadata:", session.metadata);
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