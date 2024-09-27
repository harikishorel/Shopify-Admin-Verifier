import ShopifyProducts from "@/models/ShopifyProducts";
import connectDB from "@/utils/connectDB";
import axios from "axios";

export default async function handler(req, res) {
    await connectDB();

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins; use a specific origin in production for security
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight (OPTIONS) requests
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === "POST") {
        try {
            const qrUrl = process.env.QR_URL

            const { accessToken, shopUrl, products } = req.body;

            // Step 1: Retrieve products with verificationStatus = "verified"
            const verifiedProducts = await ShopifyProducts.find({ "verificationStatus": "verified" });

            if (verifiedProducts.length === 0) {
                return res.status(404).json({ message: "No verified products found" });
            }

            // Step 2: Extract the productIds from the verified products
            const verifiedProductIds = verifiedProducts.map(product => product.productId);
            const verifiedProductIdsMap = new Map(
                verifiedProducts.map(vp => [vp.productId.split('/').pop(), vp._id]) // Create a map with extracted ID and corresponding _id
            );
            // console.log("Verified product IDs:", verifiedProductIds);

            // Step 3: Filter incoming products based on whether their ID matches a verified productId
            const matchedProducts = products.filter(product =>
                verifiedProductIds.includes(product.id)
            );

            // console.log("Matched products:", matchedProducts);

            if (matchedProducts.length === 0) {
                return res.status(404).json({ message: "No matching verified products found in the provided data" });
            }
            // Step 4: Loop through each matched product and update/add the metafields
            for (const product of matchedProducts) {
                const productId = product.id.split('/').pop(); // Extract the numeric productId from Shopify ID
                // Check if the productId exists in the verifiedProductIdsMap
                const isVerifiedProduct = verifiedProductIdsMap.has(productId);
                // Retrieve the _id from our map
                const mongoDbId = verifiedProductIdsMap.get(productId);

                if (isVerifiedProduct) {

                    try {
                        // Update the verificationStatus metafield to "verified"
                        // const updateVerificationStatusResponse = await axios.put(
                        //     `https://${shopUrl}/admin/api/2023-07/products/${productId}/metafields.json`,
                        //     {
                        //         metafield: {
                        //             namespace: "verification",
                        //             key: "verificationStatus",
                        //             value: "verified",
                        //             type: "single_line_text_field",
                        //         },
                        //     },
                        //     {
                        //         headers: {
                        //             "Content-Type": "application/json",
                        //             "X-Shopify-Access-Token": accessToken,
                        //         },
                        //     }
                        // );

                        // console.log(`Updated verificationStatus for product ${productId}:`, updateVerificationStatusResponse.data);

                        // Add the new qrUrl metafield
                        const qrCodeUrl = `${qrUrl}/trace/${mongoDbId}`; // Replace with actual QR URL generation logic
                        console.log("QR-URL===", qrUrl)
                        const addQrUrlResponse = await axios.post(
                            `https://${shopUrl}/admin/api/2023-07/products/${productId}/metafields.json`,
                            {
                                metafield: {
                                    namespace: "verification",
                                    key: "qrUrl",
                                    value: qrCodeUrl,
                                    type: "single_line_text_field",
                                },
                            },
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    "X-Shopify-Access-Token": accessToken,
                                },
                            }
                        );
                        console.log(`Added qrUrl for product ${productId}:`, addQrUrlResponse.data);
                    } catch (error) {
                        console.error(`Error updating product ${productId}:`, error.response ? error.response.data : error.message);
                    }
                } else {
                    console.warn(`No verified product found in MongoDB for productId: ${productId}`);
                }
            }
            return res.status(201).json({ message: "Product saved and metafield added successfully" });
        } catch (error) {
            console.error("Error processing product:", error.response ? error.response.data : error.message);
            return res.status(500).json({ error: "Failed to process product" });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}