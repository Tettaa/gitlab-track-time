import { useState } from 'react'
import './App.css'
import { ApolloClient, createHttpLink, InMemoryCache, ApolloProvider  } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Today from './Today';
import { type UserData } from './Types';
import GitLabDataForm from './GitLabDataForm';


function App() {

  
  let uData : UserData = {};
  if (localStorage.getItem("url")) {
    uData.url = localStorage.getItem("url");
  }
  if (localStorage.getItem("token")) {
    uData.token = localStorage.getItem("token");
  }
  if (localStorage.getItem("userName")) {
    uData.userName = localStorage.getItem("userName");
  }
  const [userData, setUserData] = useState<UserData>( uData )
  
  


  if(!userData.url || !userData.token || !userData.userName ) {

    return (
    <>
      <GitLabDataForm userData={userData} setUserData={setUserData}></GitLabDataForm> 
    </>)
  }


  const httpLink = createHttpLink({
    uri: userData.url,
  });
  
  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = userData.token;
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

  return (
    <>
      <ApolloProvider client={client}>
        <Today />
      </ApolloProvider>
    </>
  )
}

export default App
