import connectToDb from "@/utils/connectDB";
import Products from "@/models/seller/Products";
import { S3Client, PutObjectCommand,GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { IncomingForm } from "formidable";
import fs from "fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
export const config = {
  api: {
    bodyParser: false, // Disable the built-in body parsing
  },
};

export default async function handler(req, res) {
  const s3Client = new S3Client({
    region: process.env.REGION_NAME,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,  
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });
 // console.log(s3Client)
  async function uploadFileToS3(buffer,fileName,sellerId,productName) {
    console.log(fileName);
   
    try {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `Products/${sellerId}/${productName}/${fileName}`,
        Body: buffer,
       
      };

      const upload = new Upload({
        client: s3Client,
        params,

        // Corrected property access
      });

      await upload.done();
      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      console.log("File uploaded successfully:", fileName);
      return fileName;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error; // Rethrow the error to propagate it up the call stack
    }
  }

  async function getUrl(fileName, sellerId,productName) {
    try {
     

     const signedUrl= await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: `Products/${sellerId}/${productName}/${fileName}`,
        }),
        {expiresIn: 36000})
      // const command = new GetObjectCommand(params);
      // const signedUrl = await s3Client.getSignedUrl(command, { expiresIn: 3600 }); // Adjust expiresIn as needed

      console.log("Signed URL generated successfully:", signedUrl);
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw error;
    }
  }

  if (req.method === "POST") {
    try {
      await connectToDb();
      const form = new IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).json({ error: "Error parsing form data" });
        }
        const sellerId = "656472f7ab20a85a81147488";
        // console.log(fields);
        const fileKeys = Object.keys(files);
        const {
          productName,
         
          price,
          discountPrice,
          sareeColour,
          borderColour,
          description,
          verificationStatus,
        } = fields;

        const convertedData = {
          productName: productName[0],

          price: parseFloat(price[0]),
          discountPrice: parseFloat(discountPrice[0]),
         sareeColour: sareeColour[0],
          borderColour: borderColour[0],
          description: description[0],
          verificationStatus: verificationStatus[0],
        };

        console.log("productData", convertedData);

        // const savedProduct = new Products({
        //   productName: convertedData.productName,
        //   price: convertedData.price,
        //   material: convertedData.material,
        //   fabric: convertedData.fabric,
        //   colour: convertedData.colour,
        //   sellerId: sellerId,
        //   verificationStatus: convertedData.verificationStatus,
        //   description: convertedData.description,
        // });

        // const prod = await savedProduct.save();

        // console.log("dbproducts ", prod);

        if (fileKeys.length === 0) {
          console.error("No files found in form data");
          return res.status(400).json({ error: "No files found." });
        }

        const uploadedFiles = [];

        for (const key of fileKeys) {
          const fileArray = files[key];

          if (!fileArray || fileArray.length === 0) {
            console.error(`No files found for key: ${key}`);
            continue;
          }

          for (const file of fileArray) {
            const buffer = await new Promise((resolve, reject) => {
              const chunks = [];
              console.log(file.newFilename)
              if (file._writeStream.path) {
                const readStream = fs.createReadStream(file._writeStream.path);

                readStream.on("data", (chunk) => chunks.push(chunk));
                readStream.on("end", () => resolve(Buffer.concat(chunks)));
                readStream.on("error", reject);
              } else {
                reject(new Error("File path is undefined"));
              }
            });
            console.log(file.originalFilename)
           // const fileName = await uploadFileToS3(buffer,file.newFilename);

           const fileName=await uploadFileToS3(buffer,file.originalFilename,sellerId,convertedData.productName)
           const signedUrl = await getUrl(fileName, sellerId,convertedData.productName);



            console.log(signedUrl)
           
            uploadedFiles.push({ key, fileName,signedUrl });
          }
          console.log(uploadedFiles.length)
          
          
        }
        const savedProduct = new Products({
          productName: convertedData.productName,
          price: convertedData.price,
         discountPrice: convertedData.discountPrice,
          sareeColour: convertedData.sareeColour,
          borderColour: convertedData.borderColour,
          sellerId: sellerId,
          verificationStatus: convertedData.verificationStatus,
          description: convertedData.description,
          imageUrls: {
            mainImage: uploadedFiles[0].signedUrl,
            sideImage1: uploadedFiles[1].signedUrl,
            sideImage2: uploadedFiles[2].signedUrl,
          },
        });
        
        const prod = await savedProduct.save();
        console.log("dbproducts ", prod);
        

        return res.status(201).json({ success: true, uploadedFiles });
      });
    } catch (error) {
      console.error("Error saving product:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === 'PUT') {
    try {
      await connectToDb();

      const { productId, updatedProductData } = req.body;

      if (!productId || !updatedProductData) {
        return res.status(400).json({ error: 'Product ID or updated data is missing' });
      }

      // Assuming there is a findOneAndUpdate method in your model
      const updatedProduct = await Products.findOneAndUpdate(
        { _id: productId },
        updatedProductData,
        { new: true } // Return the modified document
      );

      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

