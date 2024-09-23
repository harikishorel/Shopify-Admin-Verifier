const Razorpay = require("razorpay");
const shortid = require("shortid");

export default async function handler(req, res) {
    const { taxAmt, paymentId } = req.body; // Include paymentId in the request body
    // console.log('taxAmt', taxAmt * 100);

    if (req.method === "POST") {
        // Initialize razorpay object
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        // Create an order -> generate the OrderID -> Send it to the Front-end
        // Also, check the amount and currency on the backend (Security measure)
        const payment_capture = 1;
        const amount = taxAmt;
        const currency = "INR";
        const options = {
            amount: (amount * 100).toString(),
            currency,
            receipt: shortid.generate(),
            payment_capture,
        };

        try {
            const response = await razorpay.orders.create(options);

            // Refund part
            const refundAmount = "100"; // Change this to the desired refund amount
            const refundOptions = {
                amount: refundAmount,
                speed: "normal",
                notes: {
                    notes_key_1: "Beam me up Scotty.",
                    notes_key_2: "Engage",
                },
                receipt: "Receipt No. 31",
            };

            const refundResponse = await razorpay.payments.refund(paymentId, refundOptions);

            // Send the refund response to the front end or handle as needed
            console.log("Refund Response:", refundResponse);

            res.status(200).json({
                id: response.id,
                currency: response.currency,
                amount: response.amount,
            });
            console.log("sssssssssssssssssssssssssssssssssss", res.status);
        } catch (err) {
            // console.log(err);
            res.status(400).json(err);
        }
    } else {
        // Handle any other HTTP method
    }
}
