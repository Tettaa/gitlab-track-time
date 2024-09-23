import { useRef, useState } from 'react'
import './App.css'
import { ApolloClient, createHttpLink, InMemoryCache, ApolloProvider  } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Today from './Today';
import { type UserData } from './Types';
import GitLabDataForm from './GitLabDataForm';
import * as bootstrap from 'bootstrap';
import Dashboard from './Dashboards';
import {
  createBrowserRouter,
  Link,
  NavLink,
  Route,
  RouterProvider,
  BrowserRouter,
  Routes,
  Outlet,
  createMemoryRouter,
  Navigate
} from "react-router-dom";
import DashboardControl from './DashboardControl';


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
  


  const updateUserData = (data: UserData) =>  {
    setUserData(data);
  }



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



    function Layout() {
      return (
        <>

        <nav className="navbar navbar-expand-lg bg-body-tertiary gitlab-color d-none d-sm-block mb-3">
          <div className="container-fluid">
            <NavLink to='/today' className='nav-link'>Today effort</NavLink>
            <NavLink to='/dashboard' className='nav-link'>Dashboard</NavLink>
          {/*   <NavLink to='/my-issue' className='nav-link'>My issue</NavLink> */}
            <NavLink to='/settings' className='nav-link'>Settings</NavLink>
          </div>
        </nav>
    <div>
      <Outlet />
    </div>
    </>
        
      );
    }




  function Navigation() {
    // `BrowserRouter` component removed, but the <Routes>/<Route>
    // component below are unchanged
    return (
        <Routes>
          <Route index element={<Navigate to="today" />} />
          <Route path="" element={<Layout />}>
            <Route path="today" element={ <Today username={userData.userName}/>} />
            <Route path="dashboard" element={<DashboardControl username={userData.userName}/>} />
            <Route path="settings" element={<GitLabDataForm setUserData={updateUserData} />} />      
          </Route>
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

    </>
  )
}

export default App
