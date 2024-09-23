import connectDB from "@/utils/connectDB";
import Payments from "@/models/seller/payment";
import Product from "@/models/seller/Products";
import Customer from "@/models/seller/Customer";
import Seller from "@/models/seller/Seller";

export default async (req, res) => {
  try {
    const db = await connectDB();
    const paymentModel = Payments;

    // Modify the query to filter payments where returnStatus is 'Initiated'
    const refunds = await paymentModel.find({ returnStatus: { $in: ['Seller Accepted', 'Refunded'] } });

    // Extracting IDs from refunds
    const productIds = refunds.map(refund => refund.productId);
    const customerIds = refunds.map(refund => refund.customerId);
    const sellerIds = refunds.map(refund => refund.sellerId);

    // Fetch details from respective models
    const products = await Product.find({ _id: { $in: productIds } });
    const customers = await Customer.find({ _id: { $in: customerIds } });
    const sellers = await Seller.find({ _id: { $in: sellerIds } });

    // Create a map for faster access
    const productMap = new Map(products.map(product => [product._id.toString(), product]));
    const customerMap = new Map(customers.map(customer => [customer._id.toString(), customer]));
    const sellerMap = new Map(sellers.map(seller => [seller._id.toString(), seller]));

    // Combine refund details with product, customer, and seller details
    const combinedRefunds = refunds.map(refund => {
      const productId = refund.productId.toString();
      const customerId = refund.customerId.toString();
      const sellerId = refund.sellerId.toString();

      return {
        refund: refund,
        product: productMap.get(productId),
        customer: customerMap.get(customerId),
        seller: sellerMap.get(sellerId),
      };
    });

    res.status(200).json({ combinedRefunds });
  } catch (error) {
    console.error("Get refund details with associated product, customer, and seller error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
