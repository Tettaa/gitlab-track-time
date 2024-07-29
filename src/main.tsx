import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Today from './Today.tsx'
import TodayEffort from './TodayEffort.tsx'
import 'bootstrap/dist/css/bootstrap.css';
import './index.css'

import { ApolloClient, createHttpLink, InMemoryCache, ApolloProvider  } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'https://gitlab.ti.ch/api/graphql',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = "glpat-dz7bddNJGtz5Zns6_Hyg";
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});



ReactDOM.createRoot(document.getElementById('root')!).render(

     <App />
)
/*
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
     <Today />
  </ApolloProvider>,
)
  */
