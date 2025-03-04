import { gql } from "@apollo/client";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

const typeDefs = gql`
type Query {
getMessages: [Message]
}

type Message {
  id: String!
  name: String!
  content: String!
}

type Mutation {
createMessage(input:MessageInput): Message
deleteMessage(id: String!): Message
updateMessage(id: String!, input: MessageInput): Message
}

input MessageInput {
  name: String!
  content: String!
}
`
const resolvers = {
  Query: {
    getMessages: async () => {
      return await prisma.message.findMany();
    },
  },
  Mutation: {
    createMessage: async (_: any, args: { input: { name: string; content: string } }) => {
      try {
        return await prisma.message.create({
          data: {
            name: args.input.name,
            content: args.input.content,
          },
        });
      } catch (error) {
        throw new Error("Failed to create message");
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
  },

};


const server = new ApolloServer({
  typeDefs,
  resolvers
})

const handler = startServerAndCreateNextHandler(server)

export async function POST(request: NextRequest) {
  return handler(request);
}

export async function GET(request: NextRequest) {
  return handler(request);
}


