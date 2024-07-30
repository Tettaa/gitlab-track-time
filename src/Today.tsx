
import { useQuery, gql } from '@apollo/client';
import moment from 'moment';
import { toHuman } from './utils';

const Today = () => {


    let now = moment().format('YYYY-MM-DD');
    let tomorrow = moment().add(1,'days').format('YYYY-MM-DD');
    

    let timelogs = gql`
         query {
            timelogs(startDate:"${now}", endDate:"${tomorrow}", username: "t145626") {
            totalSpentTime
            }
        }`;

    const { loading, error, data } = useQuery(timelogs);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;


    

    return (
        <>
            <h1>Today {toHuman(data.timelogs.totalSpentTime)}</h1>
        </>
    )
}

export default Today