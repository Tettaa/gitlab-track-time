import { useQuery, gql } from '@apollo/client';
import moment from 'moment';
import { toHuman } from './utils';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as bootstrap from 'bootstrap';
import ApolloFetchError from './ApolloFetchError';

function Dashboard({username}) {
    const [effortMap, setEffortMap] = useState(new Map());
    const [totalToday,setTotalToday]  = useState(0);
    const [totalWeek, setTotalWeek] = useState(0);

    let modalStateEmpty = {
        open: false,
        issueId: '',
        issueTitle: '',
        projectTitle:'',
    };
    const [modalState, setModalState] = useState(modalStateEmpty);
    const [modalObject, setModalObject] = useState();
    const ref = useRef("dashboardModal");
    const modalTitle = useRef();



    var now = moment().add(-5,'days');
    var monday = now.clone().weekday(1);
    var friday = now.clone().weekday(7);

    useEffect(() => {
        console.log("render Dashboard");
     
            console.log("render Dashboard");
            console.log("x is "+document.getElementById('dashboardModal'));
            const myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(ref.current))
            //setModalObject(myModal)
        
    },[])


    
    let timelogs = gql`
         query {
            timelogs(startDate:"${monday.format('YYYY-MM-DD')}", endDate:"${friday.format('YYYY-MM-DD')}", username: "${username}") {
            totalSpentTime
            nodes {
                id
                spentAt
                timeSpent
                issue {
                    id
                    title
                    description
                    }
                project{
                    id
                    name
                }
                }
            }
        }`;


    const { loading, error, data } =  useQuery(timelogs, {
        fetchPolicy: 'network-only',
        onCompleted: data => {
            let tMap = new Map();
            let tt = 0;
            let tw = 0;

            data.timelogs.nodes.forEach((node) => {
                const id = `${node.issue.title}#${node.project.name}`;
                const spentDate = moment(node.spentAt);
            
                if (spentDate.isSame(now , 'day')) {
                    tt += node.timeSpent;
                }
                tw += node.timeSpent;
            
                if (!tMap.has(id)) {
                    tMap.set(id, node.timeSpent);
                } else {
                    tMap.set(id, tMap.get(id) + node.timeSpent);
                }
              });

              setTotalToday(tt);
              setTotalWeek(tw);
              setEffortMap(tMap);

          },
    });
    

    const showModal = (key) => {
        let found = false;  
        data.timelogs.nodes.forEach((node) => {
             let id = `${node.issue.title}#${node.project.name}`;
            if(id == key && !found) {
                 setModalState({
                    ...modalStateEmpty,                   
                    issueId: node.issue.id,
                    issueTitle: node.issue.title,
                    projectTitle:node.project.name,  
                    open:true,                   
                  }); 
                  found = true;                 
            }
          });

      }


    function Modal ({modalState}) {
        useEffect(() => {
            console.log("render Modal");         
            const myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(ref.current))
            if(modalState.open) {
                myModal.show();
            }else{
                myModal.hide();
            }            
        },[])
        return (
          <>           
            <div className="modal fade" id="dashboardModal"  aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" >{modalState.projectTitle} -  {modalState.issueTitle}</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  
                <div className="mb-3">
                    <label  className="form-label">Hours</label>
                    <input  className="form-control" placeholder="1h 30m"/>
                </div>
                <div className="mb-3">
                    <label  className="form-label">Date</label>
                    <input  className="form-control" />
                </div>
                <div className="mb-3">
                    <label  className="form-label">Example textarea</label>
                    <textarea className="form-control" rows={3} ></textarea>
                </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" >Close</button>
                  <button type="button" className="btn btn-primary">Save changes</button>
                </div>
              </div>
            </div>
          </div>
          </>
        )
      }

    return (
        <>

            <Modal modalState={modalState} />


            {(error || loading) && 
            
                <ApolloFetchError loading={loading} error={error}/>
            }



            {!(error || loading) && 
            <div>

                <table className="table">
                    <thead>
                    <tr>
                        <th>
                            Issue#Project
                        </th>
                        <th>Effort</th>
                    </tr>
                    </thead>

                    <tbody>
                    {
                        Array.from(effortMap.entries()).map(([key, value]) => (

                            
                            <tr key={key}>
                            <td>

                                <a href='' onClick={(e) => {e.preventDefault(); showModal(key)}}>{key}</a>

                            </td>
                            <td>{toHuman(value)}</td>
                            </tr>
                        ))
                    }
                    <tr>
                        <td>
                            Totals
                        </td>
                        <td>{toHuman(totalWeek)}</td>
                    </tr>
                    </tbody>                    
                </table>

                

                <a onClick={() => {chrome.tabs.create({ url: document.URL });}} href='#'>Open in tab</a>


            </div>
            }

        </>
    )
}

export default Dashboard;