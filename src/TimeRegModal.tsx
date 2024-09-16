import { useQuery, gql, useMutation } from '@apollo/client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { toHuman } from './utils';
import ApolloFetchError from './ApolloFetchError';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default function TimeRegModal({dayIssues, setDayIssues, userName, onClose}) {

    const handleClose = () => {
        setDayIssues({...dayIssues, show:false});
        onClose();
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


   const { loading, error, data,  refetch  } =  useQuery(timelogs, {
    fetchPolicy: 'network-only',
    variables:{
        startDate: dayIssues.day,
        endDate: dayIssues.day,
        username: userName,
        }
    });



        let deleteTimelog  = gql`
        mutation timelogDelete($id: TimelogID!) {
            timelogDelete (input: {
                id: $id
            }){
                errors
            }
          }
        `;

    const [deleteTimelogFn, { data: dataMutation , loading: loadingMutation, error: errorMutation }] = useMutation(deleteTimelog, {
      onCompleted: (data) => {
       console.log('cancellata');
       refetch();
      },
      onError: (error) => {
        console.log(error);
      },
    });



    const deleteTimeReg = (id) => {
        deleteTimelogFn(  {
                variables: {
                  id: id,
          }, 
        }         
      );
    }



    return (
        <>
        
        <Modal show={dayIssues.show} onHide={handleClose} size="lg" >
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
            <thead>
              <tr>
                  <th>Title</th>
                  <th>Time spent</th>
                  <th>Action</th>
              </tr>

            </thead>
            <tbody>
            {Array.from(data.timelogs.nodes).map((node, index) => (
                
                            node.issue.id == dayIssues.gId ?
                             <tr key={index+"_del"}>
                                <td>  { node.issue.title }</td>
                                <td className='text-right'>  { toHuman(node.timeSpent) }</td>
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

