// /pages/api/shopify/getProduct.js
import ShopifyProducts from "@/models/ShopifyProducts";
import connectDB from "@/utils/connectDB";
import axios from "axios";

export default async function handler(req, res) {
  await connectDB();

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allows all origins; use specific origin in production for security
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "PUT") {
      const { id, title, handle, status, variants, productUrl, productId, accessToken, shopUrl, product } = req.body;

      // Step 1: Check if the product already exists in MongoDB
      const existingProduct = await ShopifyProducts.findOne({ productId: id });
      if (existingProduct) {
        return res.status(200).json({ message: "Product already exists" });
      }

      // Step 2: Safely extract the variants array
      const variantArray = variants?.edges?.map((edge) => {
        const variantNode = edge?.node;
        return variantNode
          ? {
            variantId: variantNode.id,
            price: variantNode.price,
            barcode: variantNode.barcode,
            createdAt: variantNode.createdAt,
          }
          : null;
      }).filter(variant => variant !== null); // Filter out any null entries

      // Step 3: Create a new product instance in MongoDB
      const newProduct = new ShopifyProducts({
        productId: id,
        productUrl,
        title,
        handle,
        status,
        variants: variantArray,
      });

      // Save the new product
      await newProduct.save();

      // Step 4: Add metafield for verification to Shopify
      try {
        const metafield = {
          namespace: "verification",
          key: "verificationStatus",
          value: "pending",
          type: "single_line_text_field",
        };

        const metafieldResponse = await axios.post(
          `https://${shopUrl}/admin/api/2023-07/products/${productId}/metafields.json`,
          { metafield: metafield, },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": accessToken,
            },
          }
        );

        console.log("Metafield added response:", metafieldResponse.data);

        const updatedProduct = {
          ...product, // Spread existing product details
        };

        const updateProductResponse = await axios.put(`https://${shopUrl}/admin/api/2023-07/products/${productId}.json`, {
          product: updatedProduct,
        }, {
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
        });

        console.log("Update response:", updateProductResponse.data);

      } catch (metafieldError) {
        console.error("Error adding metafield:", metafieldError.response ? metafieldError.response.data : metafieldError.message);
        return res.status(500).json({ error: "Failed to add metafield to Shopify" });
      }

      // Return success response
      return res.status(201).json({ message: "Product saved and metafield added successfully" });
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
