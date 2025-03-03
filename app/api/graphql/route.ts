import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

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
      console.log('Fetching messages...');
      try {
        const messages = await prisma.message.findMany();
        console.log('Messages fetched:', messages);
        return messages;
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw new Error("Failed to fetch messages");
      }
    },
    getMessageById: async (_: unknown, { id }: { id: string }) => {
      console.log(`Fetching message with ID: ${id}`);
      try {
        const message = await prisma.message.findUnique({
          where: { id },
        });
        console.log('Message fetched:', message);
        return message;
      } catch (error) {
        console.error('Error fetching message by ID:', error);
        throw new Error("Failed to fetch message by ID");
      }
    },
  },
  Mutation: {
    createMessage: async (_: unknown, { input }: { input: { name: string; content: string } }) => {
      console.log('Creating message:', input);
      try {
        const message = await prisma.message.create({
          data: input,
        });
        console.log('Message created:', message);
        return message;
      } catch (error) {
        console.error('Error creating message:', error);
        throw new Error("Failed to create message");
      }
    },
    updateMessage: async (_: unknown, { id, input }: { id: string; input: { name: string; content: string } }) => {
      console.log(`Updating message with ID: ${id}`, input);
      try {
        const message = await prisma.message.update({
          where: { id },
          data: input,
        });
        console.log('Message updated:', message);
        return message;
      } catch (error) {
        console.error('Error updating message:', error);
        throw new Error("Failed to update message");
      }
    },
    deleteMessage: async (_: unknown, { id }: { id: string }) => {
      console.log(`Deleting message with ID: ${id}`);
      try {
        const message = await prisma.message.delete({
          where: { id },
        });
        console.log('Message deleted:', message);
        return message;
      } catch (error) {
        console.error('Error deleting message:', error);
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