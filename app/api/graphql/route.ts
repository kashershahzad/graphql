// pages/api/graphql.ts
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

// Create a global prisma instance to reuse connections
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances during development
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

const typeDefs = `
  type Query {
    getMessages: [Message]
    getMessageById(id: String!): Message
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: String!, input: MessageInput): Message
    deleteMessage(id: String!): Message
  }

  input MessageInput {
    name: String
    content: String
  }

  type Message {
    id: String
    name: String
    content: String
  }
`;

const resolvers = {
  Query: {
    getMessages: async () => {
      try {
        return await prisma.message.findMany();
      } catch (error) {
        throw new Error("Failed to fetch messages");
      }
    },
    getMessageById: async (_: unknown, { id }: { id: string }) => {
      try {
        return await prisma.message.findUnique({
          where: { id },
        });
      } catch (error) {
        throw new Error("Failed to fetch message by ID");
      }
    },
  },
  Mutation: {
    createMessage: async (_: unknown, { input }: { input: { name: string; content: string } }) => {
      try {
        return await prisma.message.create({
          data: input,
        });
      } catch (error) {
        throw new Error("Failed to create message");
      }
    },
    updateMessage: async (_: unknown, { id, input }: { id: string; input: { name: string; content: string } }) => {
      try {
        return await prisma.message.update({
          where: { id },
          data: input,
        });
      } catch (error) {
        throw new Error("Failed to update message");
      }
    },
    deleteMessage: async (_: unknown, { id }: { id: string }) => {
      try {
        return await prisma.message.delete({
          where: { id },
        });
      } catch (error) {
        throw new Error("Failed to delete message");
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    return { req, prisma };
  },
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}