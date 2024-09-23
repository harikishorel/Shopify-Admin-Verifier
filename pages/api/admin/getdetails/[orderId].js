// pages/api/admin/getOrderDetails.js
import connectDB from "@/utils/connectDB";
import Orders from "@/models/seller/prodorders";
import Product from "@/models/seller/Products";
import Customer from "@/models/seller/Customer";
import Seller from "@/models/seller/Seller";

export default async function getOrderDetails(req, res) {
  if (req.method === "GET") {
    try {
      await connectDB();

      const orderId = req.query.orderId;

      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is missing' });
      }

      // Find the order by ID
      const order = await Orders.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Extracting IDs from the order
      const productId = order.productID;
      const customerId = order.customerID;
      const sellerId = order.sellerID;

      // Fetch details from respective models
      const product = await Product.findById(productId);
      const customer = await Customer.findById(customerId);
      const seller = await Seller.findById(sellerId);

      // Combine order details with product, customer, and seller details
      const orderDetails = {
        order,
        product,
        customer,
        seller,
      };

      res.status(200).json(orderDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
