import { useQuery, gql, useMutation } from '@apollo/client';
import moment from 'moment';
import { toHuman } from './utils';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as bootstrap from 'bootstrap';
import ApolloFetchError from './ApolloFetchError';
import { type IssueData } from './Types';

function Dashboard({username}) {
    
    let modalStateEmpty = {
        open: false,
        issueId: '',
        issueTitle: '',
        projectTitle:'',
    };
    const [modalState, setModalState] = useState(modalStateEmpty);
    
    var now = moment().add(-9,'days');
    var monday = now.clone().weekday(1);
    var friday = now.clone().weekday(7);

    useEffect(() => {
        console.log("render Dashboard");        
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

    const { loading, error, data, refetch, client  } =  useQuery(timelogs, {
        fetchPolicy: 'network-only',
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



    function Modal ({modalState, setModalState, refetch}) {
        const ref = useRef("dashboardModal");
        const[time, setTime] = useState();
        const[date, setDate] = useState();
        const[summary, setSummary] = useState();

        useEffect(() => {
            console.log("render Modal");         
            const myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(ref.current))
            if(modalState.open) {
                myModal.show();
                //console.log("show Modal");    
            }else{
                myModal.hide();
                //console.log("hide Modal");
            }            
        },[])


        function handleSubmit (e) {
            e.preventDefault();
            //Validate input


            //create mutation
          let createTimeLog  = gql`
            mutation c{
                timelogCreate (input: {
                    issuableId:"gid://gitlab/Issue/151349433",
                    timeSpent:"${time}",
                    spentAt:"${date}",
                    summary:"${summary}"
                }){
                    errors
                }
                }
            `;

            const myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(ref.current))
            myModal.hide();
            setModalState({...modalStateEmpty,  open:false})
            refetch();
        }

        return (
          <>           
            <div className="modal fade" id="dashboardModal"  aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" >{modalState.projectTitle} -  {modalState.issueTitle}</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                    <div className="mb-3">
                        <label  className="form-label">Hours</label>
                        <input  className="form-control" placeholder="1h 30m" value={time} onChange={e => setTime(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label  className="form-label">Date</label>
                        <input  className="form-control" type='date' value={date} onChange={e => setDate(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label  className="form-label">Summary</label>
                        <textarea className="form-control" rows={3} value={summary} onChange={e => setSummary(e.target.value)}></textarea>
                    </div>
                    </div>
                    <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal"  >Close</button>
                    <button type="submit" className="btn btn-primary">Save time</button>
                    </div>
                </form>

              </div>
            </div>
          </div>
          </>
        )
      }


    function Table({apolloData}) {
        const [effortMap, setEffortMap] = useState(new Map());
        const [totalWeek, setTotalWeek] = useState(0);

        useEffect(()=>{
            let tMap = new Map();
            let tt = 0;
            let tw = 0;
      
            apolloData.timelogs.nodes.forEach((node) => {
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
              console.log("render Table"); 
              setEffortMap(tMap);
              setTotalWeek(tw);
        },[]);


        return(
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
        )


    }  



    return (
        <>

            <Modal 
                modalState={modalState}
                setModalState={setModalState} 
                refetch={refetch}
            />


            {(error || loading) && 
            
                <ApolloFetchError loading={loading} error={error}/>
            }



            {!(error || loading) && 
            <div>

                <Table apolloData={data}/>

                <a onClick={() => {chrome.tabs.create({ url: document.URL });}} href='#'>Open in tab</a>


            </div>
            }

        </>
    )
}

export default Dashboard;