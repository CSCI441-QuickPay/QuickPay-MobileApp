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
 * Recipient lookup (robust dev version)
 * - Supports path lookup:  GET /api/recipients/:phone
 * - Supports query lookup: GET /api/recipients?phone=...
 * - Normalizes incoming phone by removing non-digits and matching on last 10 digits
 * - Logs requests and returned payloads for easier debugging
 * - Returns both camelCase and snake_case fields for compatibility
 *
 * Replace or expand the DB lookup section for production use.
 */
async function recipientLookupHandler(req, res) {
  try {
    // Support both /api/recipients/:phone and /api/recipients?phone=...
    const rawPhone = (req.params && req.params.phone) || req.query?.phone || "";
    if (!rawPhone) return res.status(400).json({ error: "phone required" });

    // Normalize: remove non-digits and use last 10 digits for matching
    const digits = rawPhone.toString().replace(/\D/g, "");
    const normalized = digits.length > 10 ? digits.slice(-10) : digits;

    console.log(`[recipients] lookup rawPhone="${rawPhone}" digits="${digits}" normalized="${normalized}"`);

    // Quick mock for local testing (keep this for dev)
    if (normalized === "5502494860" || rawPhone.toString().endsWith("5502494860")) {
      const mockRecipient = {
        // camelCase (frontend preferred)
        accountNumber: "5502494860",
        firstName: "Test",
        lastName: "Recipient",
        email: "test.recipient@example.com",
        profilePicture: null,
        // snake_case (compatibility)
        account_number: "5502494860",
        first_name: "Test",
        last_name: "Recipient",
        profile_picture: null,
      };
      console.log("[recipients] returning mock recipient for", rawPhone);
      return res.json({ recipient: mockRecipient });
    }

    // Example DB lookup placeholder (async-friendly):
    // const row = await UsersModel.findByAccountOrPhone(normalized || rawPhone);
    // if (row) {
    //   const normalizedRow = {
    //     accountNumber: row.accountNumber ?? row.account_number,
    //     firstName: row.firstName ?? row.first_name,
    //     lastName: row.lastName ?? row.last_name,
    //     email: row.email,
    //     profilePicture: row.profilePicture ?? row.profile_picture,
    //   };
    //   console.log('[recipients] found DB recipient for', rawPhone, normalizedRow);
    //   return res.json({ recipient: normalizedRow });
    // }

    console.log("[recipients] no recipient found for", rawPhone);
    return res.status(404).json({ message: "Recipient not found" });
  } catch (err) {
    console.error("Error in /api/recipients lookup:", err);
    return res.status(500).json({ error: "internal" });
  }
}

// Register two routes that use the same handler (avoid using optional param syntax)
app.get("/api/recipients", recipientLookupHandler);           // query param: /api/recipients?phone=...
app.get("/api/recipients/:phone", recipientLookupHandler);    // path param:  /api/recipients/5502494860

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