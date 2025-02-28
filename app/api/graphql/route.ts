import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";

const gql = String.raw

const typeDefs = gql``
const resolvers = {}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

const handler = startServerAndCreateNextHandler(server)

export {handler as GET , handler as POST}