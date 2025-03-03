import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

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
      return await prisma.message.findMany();
    },
    getMessageById: async (_: unknown, { id }: { id: string }) => {
      return await prisma.message.findUnique({
        where: { id },
      });
    },
  },
  Mutation: {
    createMessage: async (_: unknown, { input }: { input: { name: string; content: string } }) => {
      return await prisma.message.create({
        data: input,
      });
    },
    updateMessage: async (_: unknown, { id, input }: { id: string; input: { name: string; content: string } }) => {
      return await prisma.message.update({
        where: { id },
        data: input,
      });
    },
    deleteMessage: async (_: unknown, { id }: { id: string }) => {
      return await prisma.message.delete({
        where: { id },
      });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    // Provide the context with the request and Prisma instance.
    return { req, prisma };
  },
});

// In Next.js 15, the route context parameter's "params" property is a Promise.
// We update the GET and POST handlers to reflect this requirement.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  await params; // Awaiting to ensure correct type resolution
  return handler(request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  await params;
  return handler(request);
}
