'use client'

import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import React from 'react';

interface Message {
  id: string;
  name: string;
  content: string;
}

interface FormState {
  id: string;
  name: string;
  content: string;
}


const client = new ApolloClient({
  uri: '/api/graphql',
  cache: new InMemoryCache(),
  headers: {
    'Content-Type': 'application/json',
  },
});


const GET_MESSAGES = gql`
  query GetMessages {
    getMessages {
      id
      name
      content
    }
  }
`;

const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: MessageInput) {
    createMessage(input: $input) {
      id
      name
      content
    }
  }
`;

const UPDATE_MESSAGE = gql`
  mutation UpdateMessage($id: String!, $input: MessageInput) {
    updateMessage(id: $id, input: $input) {
      id
      name
      content
    }
  }
`;

const DELETE_MESSAGE = gql`
  mutation DeleteMessage($id: String!) {
    deleteMessage(id: $id) {
      id
    }
  }
`;

function App() {
  const { loading, error, data, refetch } = useQuery<{ getMessages: Message[] }>(GET_MESSAGES);
  const [createMessage] = useMutation(CREATE_MESSAGE);
  const [updateMessage] = useMutation(UPDATE_MESSAGE);
  const [deleteMessage] = useMutation(DELETE_MESSAGE);
  const [form, setForm] = useState<FormState>({ id: '', name: '', content: '' });

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-600">Error: {error.message}</p>;

  const handleSubmit = async () => {
    if (form.id) {
      await updateMessage({ variables: { id: form.id, input: { name: form.name, content: form.content } } });
    } else {
      await createMessage({ variables: { input: { name: form.name, content: form.content } } });
    }
    setForm({ id: '', name: '', content: '' });
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteMessage({ variables: { id } });
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {form.id ? 'Update Message' : 'Create Message'}
          </button>
        </div>
        <ul>
          {data?.getMessages.map((msg) => (
            <li key={msg.id} className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0">
              <div>
                <p className="text-lg font-semibold text-gray-800">{msg.name}</p>
                <p className="text-gray-600">{msg.content}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setForm({ id: msg.id, name: msg.name, content: msg.content })}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}