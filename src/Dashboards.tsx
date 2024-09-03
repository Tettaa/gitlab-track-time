import { useQuery, gql, useMutation } from '@apollo/client';
import moment, { Moment } from 'moment';
import { toHuman } from './utils';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as bootstrap from 'bootstrap';
import ApolloFetchError from './ApolloFetchError';
import { type IssueData } from './Types';


function Dashboard({username, fromDate, toDate}) {

    let modalStateEmpty = {
        open: false,
        issueId: '',
        issueTitle: '',
        projectTitle:'',
    };
    const [modalState, setModalState] = useState(modalStateEmpty);


    useEffect(() => {
        console.log("render Dashboard"); 
        console.log("startTime", fromDate);
        console.log("endTime", toDate);      
    },[fromDate,toDate])
    

    let timelogs = gql`
         query ($startDate: Time , $endDate: Time, $username: String!){
            timelogs(startDate: $startDate, endDate: $endDate, username: $username) {
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
                    webUrl
                }
                }
            }
        }`;

    const { loading, error, data, refetch, client  } =  useQuery(timelogs, {
        fetchPolicy: 'network-only',
        variables:{
            startDate: fromDate,
            endDate: toDate,
            username: username,
        }
    });
    


     const showModal = (key) => {
        let found = false;  
        data.timelogs.nodes.forEach((node) => {
            if(node.issue.id == key && !found) {
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



     


    function AddTimeModal ({modalState, setModalState, refetch}) {
        const ref = useRef("dashboardModal");
        const[time, setTime] = useState<string>();
        const[date, setDate] = useState<string>();
        const[summary, setSummary] = useState<string>();
        const[errorFieldsState, setErrorFieldsState] = useState<any>({
            timef: false,
            datef: false
        });


        //create mutation
        let createTimeLog  = gql`
            mutation createTimelog($gitlabIssueId: IssuableID!, $timeSpent: String!, $spentAt: Time, $summary: String!) {
                timelogCreate (input: {
                    issuableId: $gitlabIssueId,
                    timeSpent: $timeSpent,
                    spentAt: $spentAt,
                    summary: $summary
                }){
                    errors
                }
                }
            `;

        const [createTimeFn, { data, loading, error }] = useMutation(createTimeLog);

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
            if(!time) {
                setErrorFieldsState((errors) => {
                    return {...errors,time:true};
                })
            }
            if(!date) {
                setErrorFieldsState((errors) => {
                    return {...errors,date:true};
                })
            }

            if(!time || !date) {
                return;
            }


            let variables = {
                variables: {
                        gitlabIssueId: modalState.issueId,
                        timeSpent: time,
                        spentAt: date,
                        summary: typeof summary == "undefined" ? "":summary
                    }                
                
            };
            createTimeFn( {
                    variables: {
                            gitlabIssueId: modalState.issueId,
                            timeSpent: time,
                            spentAt: date,
                            summary: typeof summary == "undefined" ? "":summary
                    },           
                },  
            );
            
            const myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(ref.current))
            myModal.hide();
            setModalState({...modalStateEmpty,  open:false})
           //I dont like it.
            setTimeout(()=> {
                refetch();
            },900)
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
                        <p className={'invalid-feedback '+ (errorFieldsState.time ? 'd-block':'') }>Please fill time field</p>
                    </div>
                    <div className="mb-3">
                        <label  className="form-label">Date</label>
                        <input  className="form-control" type='date' value={date} onChange={e => setDate(e.target.value)} /> 
                        <p className={'invalid-feedback '+ (errorFieldsState.date ? 'd-block':'')}>Please fill the date field</p>
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
        const [issues, setIssues] = useState<IssueData[]>();
        const [weekDates, setWeekDates] = useState<string[]>();
        const [effortMap, setEffortMap] = useState<any[][]>();
        const [totalWeek, setTotalWeek] = useState(0);

        useMemo(()=> {
            console.log("init Table"); 
            let tt = 0;
            let tw = 0;

            
            let mapData = new Map();
            apolloData.timelogs.nodes.forEach((node) => {
                let issueData : IssueData = {
                    gitlabId: '',
                    title: '',
                    projectTitle: ''
                };                
                issueData.gitlabId = node.issue.id;
                issueData.title = node.issue.title;
                issueData.projectTitle = node.project.name;
                issueData.projectWebUrl =  node.project.webUrl;
                mapData.set(node.issue.id,issueData);
            });
            
            setIssues([...mapData.values()]
                .sort((n1,n2) => n1.title > n2.title ? -1:1)
                .sort((n1,n2) => n1.projectTitle > n2.projectTitle ? -1:1)
            );

            let matrix: any[][] = [];

            apolloData.timelogs.nodes.forEach((node) => {
                const spentDate = moment(node.spentAt);
                if (spentDate.isSame(moment() , 'day')) {
                    tt += node.timeSpent;
                }
                tw += node.timeSpent;
                
                if(typeof matrix[node.issue.id] == "undefined"){
                    matrix[node.issue.id] = [];
                    matrix[node.issue.id][spentDate.format('DD.MM.YYYY')] = node.timeSpent;
                }else{
                    if(typeof matrix[node.issue.id][spentDate.format('DD.MM.YYYY')] == "undefined"){
                        //matrix[node.issue.id] = [];
                        matrix[node.issue.id][spentDate.format('DD.MM.YYYY')] = node.timeSpent;
                    }else{
                        matrix[node.issue.id][spentDate.format('DD.MM.YYYY')] += node.timeSpent;
                    }
                }

              });


              apolloData.timelogs.nodes.forEach((node) => {
                let day = moment(node.spentAt).format('DD.MM.YYYY')
               
                if(typeof matrix['day_total'] == "undefined"){
                    matrix['day_total'] = [];
                    matrix['day_total'][day] = node.timeSpent;
                }else{
                    if(typeof matrix['day_total'][day] == "undefined"){
                        matrix['day_total'][day] = 0;
                    }
                    matrix['day_total'][day] += node.timeSpent;
                    
                }
            })
            

              let weekdays: string[] = [];
              let tmp = moment(fromDate);
              for(let x = 0;x < 7 && tmp.format('DD.MM.YYYY') != toDate;x++, tmp=tmp.add(1,'days')) {
                weekdays.push(tmp.format('DD.MM.YYYY'));
              }
              setWeekDates(weekdays);
              setEffortMap(matrix);
              setTotalWeek(tw);            
              console.log("render Table"); 
        },[])




        function retrieveValue(x,y){
            if(typeof effortMap[x] == "undefined"){
                return "0";
            }
            if(typeof effortMap[x][y] == "undefined"){
                return "0";
            }
            return toHuman(effortMap[x][y]);

        }


        return(

            <>
                { weekDates && effortMap &&
                    <table className="table">
                        <thead>
                        <tr>
                            <th>
                                Project
                            </th>
                            <th>
                                Issue
                            </th>

                            {
                                Array.from(weekDates).map((dateFormat) => (
                                    <th key={dateFormat}>{dateFormat}</th>
                                ))
                            }
                            <th>Effort</th>
                        </tr>
                        </thead>

                        <tbody>
                        {
                             Array.from(issues).map((i) => (
                                <tr key={i.gitlabId}>
                                <td> <a href='#' onClick={(e) => window.open(i.projectWebUrl+"/-/issues", "_blank")}>{i.projectTitle}</a> </td>
                                <td>
                                    <a href='' onClick={(e) => {e.preventDefault(); showModal(i.gitlabId)}}>{i.title}</a>
                                </td>
                                {
                                    weekDates.map((dateFormat) => (
                                        <td key={dateFormat}>{retrieveValue(i.gitlabId,dateFormat) != "0" ?  <b>{retrieveValue(i.gitlabId,dateFormat)}</b> : 0  }</td>
                                    ))
                                }
                                </tr>
                            ))
                        }
                        
                            <tr>
                                <td ><b>Totale</b></td><td></td>
                                {
                                    Array.from(weekDates).map((dateFormat) => (
                                        <td key={dateFormat}>{effortMap.hasOwnProperty('day_total')  && effortMap['day_total'][dateFormat] != "0" ?  <b>{toHuman(effortMap['day_total'][dateFormat])}</b> : 0  }</td>
                                        
                                    ))
                                }

                            </tr>
            
                        </tbody>                    
                    </table> 
                    }

            </>
            
        )
    }  



    return (
        <>

            <AddTimeModal 
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