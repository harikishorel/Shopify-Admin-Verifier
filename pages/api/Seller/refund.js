// Import necessary modules
import connecttodb from "@/utils/connectDB";

// Function to get all orders
export default async function getAllOrders(req, res) {
  //   let mongoose;

  try {
    // Connect to the MongoDB database
    // mongoose = await connecttodb();

    // Fetch all orders from the database
    const ReturnRefund = [
      {
        OrderId: "dwdw",
        CustomerName: "Kandrol Sarkar",
        SellerName: "Darkness",
        RefundDate: "21/11/2023",
        CompletionDate: "22/11/2023",
        status: "Refunded",
      },
      {
        OrderId: "fefef",
        CustomerName: "Saurav Sarkar",
        SellerName: "Selva Kumar",
        RefundDate: "21/11/2023",
        CompletionDate: "22/11/2023",
        status: "Returned",
      },
      {
        OrderId: "wommd",
        CustomerName: "Saurav Sarkar",
        SellerName: "Selva Kumar",
        RefundDate: "21/11/2023",
        CompletionDate: "22/11/2023",
        status: "Returned",
      },
    ];

    // const returnrefund = await ReturnRefund.find({});

    // Respond with the retrieved orders
    res.status(200).json(ReturnRefund);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
