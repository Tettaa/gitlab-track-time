import { useQuery, gql, useMutation } from '@apollo/client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ApolloFetchError from './ApolloFetchError';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default function TimeRegModal({dayIssues, setDayIssues, userName}) {

    const handleClose = () => {
        setDayIssues({...dayIssues, show:false});
    };


    let timelogs = gql`
    query ($startDate: Time , $endDate: Time, $username: String!){
        timelogs(startDate: $startDate, username: $username, endDate: $endDate) {
        nodes {
            id
            spentAt
            timeSpent
            issue {
                id
                title
                }
            project{
                id
                name
            }
        }
        }
    }`;


   const { loading, error, data, client  } =  useQuery(timelogs, {
    fetchPolicy: 'network-only',
    variables:{
        startDate: dayIssues.day,
        endDate: dayIssues.day,
        username: userName,
        }
    });


    const deleteTimeReg = (id) => {
        console.log("cancello");
    }


    useEffect(() => {
        console.log("render TimeRegModal");         
        
    },[])



    return (
        <>
        
        <Modal show={dayIssues.show} onHide={handleClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Modal heading {dayIssues.giId}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          {(error || loading) && 
            
             <ApolloFetchError loading={loading} error={error}/>
         }

          {!(error || loading)
            &&
            

            
            <table className="table">

            <tbody>
            {Array.from(data.timelogs.nodes).map((node) => (
                
                            node.issue.id == dayIssues.gId ?
                             <tr key={node.issue.id}>
                                <td>  { node.issue.title }</td>
                                <td>  
                                    <a href='' onClick={(e) => {e.preventDefault(); deleteTimeReg(node.id);}}>Delete</a></td>

                            </tr>:""
                
                
            ))}
            
            </tbody>
            </table>
        }

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
      )


}

