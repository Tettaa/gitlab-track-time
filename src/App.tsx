import { useRef, useState } from 'react'
import './App.css'
import { ApolloClient, createHttpLink, InMemoryCache, ApolloProvider  } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Today from './Today';
import { type UserData } from './Types';
import GitLabDataForm from './GitLabDataForm';
import * as bootstrap from 'bootstrap';

import {
  createBrowserRouter,
  Link,
  Route,
  RouterProvider,
  BrowserRouter,
  Routes,
  Outlet,
  createMemoryRouter
} from "react-router-dom";


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
      <GitLabDataForm setUserData={setUserData}></GitLabDataForm> 
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


  function About() {

    const openATab = () => {
      chrome.tabs.create({ url: document.URL });
    }

    return (
      <div>
        <h2>About</h2>
        <Link to='/dashboard' className='btn btn-primary'>Vai alla dash</Link><br/>
        <a onClick={openATab} href='#'>Apri</a>

      </div>
    );
  }
  
  function Dashboard() {
    
    return (
      <div>
        <h2>Dashboard</h2>
        <Link to='/about' className='btn btn-primary'>Vai all'about</Link><br/>

        <Modal/>

      </div>
    );
  }



  function Modal () {
    const showModal = () => {
      const bsModal = new bootstrap.Modal("#modalId", {
          backdrop: 'static',
          keyboard: true
      })
      bsModal.show()
    }

    const hideModal = () => {
      const bsModal= bootstrap.Modal.getInstance("#modalId")
      bsModal.hide()
  }

    return (
      <>
        <button type="button" className="btn btn-primary" onClick={showModal}>Add Employee</button>
        <div className="modal fade" id="modalId" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              ...
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={hideModal}>Close</button>
              <button type="button" className="btn btn-primary">Save changes</button>
            </div>
          </div>
        </div>
      </div>
      </>


    )
  }


  function Navigation() {
    // `BrowserRouter` component removed, but the <Routes>/<Route>
    // component below are unchanged
    return (
        <Routes>
          <Route path="" element={<About />}/> 
          <Route path="about" element={<About />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<GitLabDataForm setUserData={setUserData} />} />      
        </Routes>
    );
  }

  const router = createMemoryRouter([
    { path: "*", Component: Navigation },
  ]);



  return (
    <>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>

        


      {/* <ApolloProvider client={client}>
       
          <RouterProvider router={router} />
        
      </ApolloProvider> */}
    </>
  )
}

export default App
