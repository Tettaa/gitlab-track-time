import { useState } from 'react'
import { type UserData } from './Types';
import { isEmpty } from './utils';

function GitLabDataForm({setUserData}) {

    let defaultObject = {
      url: '',
      token: '',
      userName: '',
    }

    if (localStorage.getItem("url")) {
      defaultObject.url = localStorage.getItem("url");
    }
    if (localStorage.getItem("token")) {
      defaultObject.token = localStorage.getItem("token");
    }
    if (localStorage.getItem("userName")) {
      defaultObject.userName = localStorage.getItem("userName");
    }


    const [formErrors, setFormErrors] = useState( {} )
    const [tempUserData, setTempUserData] = useState( defaultObject );

  let handleSubmit = (e) => {
    e.preventDefault();
    let cformsErrors = {};

    console.log(tempUserData);
    if(tempUserData.url.trim().length === 0) {
      cformsErrors['url'] = 'form-error-field';
    }
    if(tempUserData.token.trim().length === 0) {
      cformsErrors['token'] = 'form-error-field';
    }
    if(tempUserData.userName.trim().length === 0) {
      cformsErrors['userName'] = 'form-error-field';
    }

    if(isEmpty(cformsErrors)){
      console.info("Save data into storage");

      let userData : UserData = {
        url: tempUserData.url,
        token: tempUserData.token,
        userName: tempUserData.userName
      } 

      localStorage.setItem("url",tempUserData.url);
      localStorage.setItem("token",tempUserData.token);
      localStorage.setItem("userName",tempUserData.userName);

      setUserData(userData);

    }else{
      console.info("Data missing");
      setFormErrors(cformsErrors);
    }
  }


  let handleChange = (e) => {
    setTempUserData(t => {            
      return {...t,[e.target.name] : e.target.value};
    });
  }

    return (
    <>
        <h2>Gitlab data.</h2>
        <p>Please provide the following data.</p>
        <form onSubmit={handleSubmit} method='POST' >
                <div className="mb-3">
                    <label className="form-label">Url</label>
                    <input type="text" className={"form-control " + (formErrors['url'] !== undefined ? formErrors['url'] : ""  )} name='url' onChange={(e) => handleChange(e)} value={tempUserData.url}  />
                </div>
                <div className="mb-3">
                    <label className="form-label">Token</label>
                    <input type="text" className={"form-control " + (formErrors['token'] !== undefined ? formErrors['token'] : ""  )} name='token' onChange={(e) => handleChange(e)} value={tempUserData.token}  />
                </div>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" className={"form-control " + (formErrors['userName'] !== undefined ? formErrors['userName'] : ""  )} name='userName' onChange={(e) => handleChange(e)} value={tempUserData.userName}  />
                </div>
            
                <button type="submit"  className="btn btn-primary">Salva</button>
            </form> 
    </>)
  
}




export default GitLabDataForm;
