
import connectDb from "@/utils/connectDB";
import Admin from "@/models/Admin";
import Verifier from "@/models/Verifier";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const { email, password, route } = credentials;

        try {
          await connectDb();

          // Check Admin collection if the route is /Admin/Login
          if (route === "/Admin/Login") {
            const adminData = await Admin.findOne({ email, password });
            if (adminData) {
              // console.log(adminData.id);
              // return adminData;
              const token = {
                email: adminData.id,
                name: adminData.name,
                image: "admin",
                // Add more properties as needed
              };
              console.log("Token", token);
              return token;
            }
          }

          // Check Verifier collection if the route is /Verifier/Login
          if (route === "/Verifier/Login") {
            const verifierData = await Verifier.findOne({ email, password });

            if (verifierData && verifierData.status) {
              const token = {
                email: verifierData.id,
                name: verifierData.name,
                image: verifierData.verifiertype.join(','),
                // Add more properties as needed
              };
              console.log("Token", token);
              return token;
            } else {
              // Verifier is inactive, handle accordingly (e.g., return an error)
              console.log("Verifier is inactive");
              // Handle accordingly, for example, return an error response
              return null;
            }
          }

          return null; // If not found in either collection or invalid route
        } catch (error) {
          console.log("Error: ", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 10 * 1000,
  },
  secret: process.env.NEXTAUTH_SECRET,
});
