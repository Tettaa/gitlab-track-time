import { useState } from 'react'
import './App.css'
import { ApolloClient, createHttpLink, InMemoryCache, ApolloProvider  } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Today from './Today';

type UserData = {
  url?: string,
  token?: string;
  userName?: string;
};

function App() {
  const [userData, setUserData] = useState<UserData>( {} )
  const [formErrors, setFormErrors] = useState<UserData>( {} )


  const [tempUserData, setTempUserData] = useState( {
    url: '',
    token: '',
    userName: '',
  } );


  let handleSubmit = (e) => {
    e.preventDefault();
    let cformsErrors = {};
    if(tempUserData.url.trim().length === 0) {
      cformsErrors.url = 'form-error-field';
    }
    if(tempUserData.token.trim().length === 0) {
      cformsErrors.token = 'form-error-field';
    }
    if(tempUserData.userName.trim().length === 0) {
      cformsErrors.userName = 'form-error-field';
    }

    if(!cformsErrors.length){
      console.log("salvo i dati evviva");
    }else{
      console.log("Qualcosa non funziona");
    }

    setFormErrors(cformsErrors);
    console.log("handleSubmit");
    console.log(tempUserData);


  }
  let handleChange = (e) => {
    setTempUserData(t => {
      //console.log(t);
      return {...t,[e.target.name] : e.target.value};
    });

  }


  console.log(userData);
  if(!userData.url || !userData.token || !userData.userName ) {

    return (
    <>

        <h2>Vital data missing.</h2>
        <p>Please provide the following data.</p>
        <form onSubmit={handleSubmit} method='POST' >
                <div className="mb-3">
                    <label className="form-label">Url</label>
                    <input type="text" className={"form-control " + formErrors.url} name='url' onChange={(e) => handleChange(e)} value={tempUserData.url}  />
                </div>
                <div className="mb-3">
                    <label className="form-label">Token</label>
                    <input type="text" className={"form-control " + formErrors.token} name='token' onChange={(e) => handleChange(e)} value={tempUserData.token}  />
                </div>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" className={"form-control " + formErrors.userName} name='userName' onChange={(e) => handleChange(e)} value={tempUserData.userName}  />
                </div>
            
                <button type="submit"  className="btn btn-primary">Salva</button>
            </form> 
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
      </ApolloProvider>,
    </>
  )
}

export default App
