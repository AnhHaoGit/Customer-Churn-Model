import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGODB_DB_NAME || "customer_churn_db");
  }
  return db;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const db = await connectDB();
        const user = await db.collection("users").findOne({
          email: credentials.email,
        });

        if (!user) throw new Error("User not found");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) throw new Error("Invalid password");

        return { id: user._id.toString(), email: user.email };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const db = await connectDB();
        const existingUser = await db.collection("users").findOne({
          email: user.email,
        });

        if (!existingUser) {
          const newUser = {
            email: user.email,
            name: user.name || "",
            image: user.image || "",
            provider: "google",
            createdAt: new Date(),
          };
          const result = await db.collection("users").insertOne(newUser);
          // Gán id vào user để jwt callback dùng
          user.id = result.insertedId.toString();
        } else {
          user.id = existingUser._id.toString();
        }
      }
      return true;
    },

    // Save user data into token
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          const db = await connectDB();
          const existingUser = await db.collection("users").findOne({
            email: user.email,
          });

          if (existingUser) {
            token.id = existingUser._id.toString();
          }
        } else {
          // For Credentials login, id is already available
          token.id = user.id;
        }
      }

      return token;
    },

    // Save token into session for client use
    async session({ session, token }) {
      const db = await connectDB();

      session.user.id = token.id;

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
