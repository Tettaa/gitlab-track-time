import { useQuery, gql } from '@apollo/client';
import moment from 'moment';
import { toHuman } from './utils';
import { useEffect, useState } from 'react';
import ApolloFetchError from './ApolloFetchError';


const Today = ({username}) => {
    const [effortMap, setEffortMap] = useState(new Map());
    const [totalToday,setTotalToday]  = useState(0);
    const [totalWeek, setTotalWeek] = useState(0);


    var now = moment();
    var monday = now.clone().weekday(1);
    var friday = now.clone().weekday(7);

    
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
    
    

    return (
        <>

            {(error || loading) && 
            
                <ApolloFetchError loading={loading} error={error}/>
            }

            {!(error || loading) && 
            <div>
                <h2>Today {toHuman(totalToday)} h</h2>
                <h2>This week {toHuman(totalWeek)} h</h2>
                <a className="btn btn-primary m-2" onClick={() => {chrome.tabs.create({ url: document.URL });}} href='#'>Open Extension in a tab</a>
            </div>
            }

        </>
    )
}

export default Today