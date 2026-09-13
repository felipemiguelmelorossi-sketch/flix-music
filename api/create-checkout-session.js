export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método não permitido"
        });
    }

    try {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

        if (!stripeSecretKey) {
            return res.status(500).json({
                error: "STRIPE_SECRET_KEY não configurada na Vercel."
            });
        }

        const priceId =
            "price_1UEytf7g4ILCasqvAhCe9d2a";

        const body = new URLSearchParams();

        body.append(
            "mode",
            "subscription"
        );

        body.append(
            "line_items[0][price]",
            priceId
        );

        body.append(
            "line_items[0][quantity]",
            "1"
        );

        body.append(
            "success_url",
            `${req.headers.origin}/?pro=success`
        );

        body.append(
            "cancel_url",
            `${req.headers.origin}/?pro=cancel`
        );

        body.append(
            "allow_promotion_codes",
            "true"
        );

        const response = await fetch(
            "https://api.stripe.com/v1/checkout/sessions",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${stripeSecretKey}`,

                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body
            }
        );

        const session =
            await response.json();

        if (!response.ok) {
            console.error(
                "Stripe error:",
                session
            );

            return res.status(
                response.status
            ).json({
                error:
                    session.error?.message ||
                    "Erro ao criar checkout."
            });
        }

        return res.status(200).json({
            url: session.url
        });

    } catch (error) {

        console.error(
            "Checkout error:",
            error
        );

        return res.status(500).json({
            error:
                "Erro interno ao criar checkout."
        });
    }
}
