import connectDB from "@/utils/connectDB";
import Products from "@/models/seller/Products";
import Payment from "@/models/seller/payment";

export default async (req, res) => {
  try {
    const db = await connectDB();
    const ProductsModel = Products;

    // Search the Payment model for entries with returnStatus: "Closed"
    const closedPayments = await Payment.find({ returnStatus: "Closed" });
    // Extract product IDs from closed payments
    const productIdsFromClosedPayments = closedPayments.map(payment => payment.productId);
    // Modify the query to filter products where soldStatus is true and the product ID is in the list from closed payments
    const soldProducts = await ProductsModel.find({ soldStatus: true, _id: { $in: productIdsFromClosedPayments } });

    // Calculate the total price of sold products
    const totalPrice = soldProducts.reduce((total, product) => total + product.discountPrice, 0);

    // Get the count of sold products
    const productCount = soldProducts.length;
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    // Get the end of the day
    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999);

    // Modify the query to filter products where soldStatus is true and sold on the current date
    const soldProductsToday = await ProductsModel.find({
      soldStatus: true,
      soldDate: { $gte: currentDate, $lte: endDate },
    });

    // Calculate the total price of sold products today
    const totalPriceToday = soldProductsToday.reduce((total, product) => total + product.price, 0);

    const monthlySales = await ProductsModel.aggregate([
      {
        $match: { soldStatus: true },
      },
      {
        $group: {
          _id: { $month: "$soldDate" },
          totalSale: { $sum: "$price" },
        },
      },
    ]);

    res.status(200).json({ totalPrice, productCount, totalPriceToday, monthlySales });
  } catch (error) {
    console.error("Get total price and count of sold products error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
