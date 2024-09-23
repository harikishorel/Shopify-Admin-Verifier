// pages/api/Seller/deleteproduct.js

import connecttodb from '@/utils/connectDB';
import Products from '@/models/seller/Products';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    try {
      await connecttodb();

      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is missing' });
      }

      // Assuming there is a deleteOne method in your model
      const deletedProduct = await Products.deleteOne({ _id: productId });

      if (!deletedProduct.deletedCount) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
