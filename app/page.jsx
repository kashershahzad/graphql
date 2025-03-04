'use client'

import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import React from 'react';

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
  const { loading, error, data, refetch } = useQuery(GET_MESSAGES);
  const [createMessage] = useMutation(CREATE_MESSAGE);
  const [updateMessage] = useMutation(UPDATE_MESSAGE);
  const [deleteMessage] = useMutation(DELETE_MESSAGE);
  const [form, setForm] = useState({ id: '', name: '', content: '' });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleSubmit = async () => {
    if (form.id) {
      await updateMessage({ variables: { id: form.id, input: { name: form.name, content: form.content } } });
    } else {
      await createMessage({ variables: { input: { name: form.name, content: form.content } } });
    }
    setForm({ id: '', name: '', content: '' });
    refetch();
  };

  const handleDelete = async (id) => {
    await deleteMessage({ variables: { id } });
    refetch();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="border p-2 mr-2"
        />
        <button onClick={handleSubmit} className="bg-blue-500 text-white p-2">
          {form.id ? 'Update' : 'Create'}
        </button>
      </div>
      <ul>
        {data.getMessages.map((msg) => (
          <li key={msg.id} className="flex items-center justify-between p-2 border-b">
            <span>{msg.name}: {msg.content}</span>
            <div>
              <button
                onClick={() => setForm({ id: msg.id, name: msg.name, content: msg.content })}
                className="bg-yellow-500 text-white p-2 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(msg.id)}
                className="bg-red-500 text-white p-2"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
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