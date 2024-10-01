import { useQuery, gql, useMutation } from '@apollo/client';
import moment, { Moment } from 'moment';
import { toHuman } from './utils';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as bootstrap from 'bootstrap';
import ApolloFetchError from './ApolloFetchError';
import { type IssueData } from './Types';
import Dashboard from './Dashboards';


export default function DashboardControl({username}) {

    const [fromDate, setFromDate] = useState<string>(moment().weekday(1).format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState<string>(moment().weekday(7).format('YYYY-MM-DD'));

    const moveWeek = (num:number) => {
        var nextDate = moment(fromDate);
        nextDate = num < 0 ? nextDate.subtract(8,'days') : nextDate.add(7,'days');
        var monday = nextDate.clone().weekday(1);
        var friday = nextDate.clone().weekday(7);
        setFromDate(monday.format('YYYY-MM-DD'));
        setToDate(friday.format('YYYY-MM-DD'));
    } 

    const currentWeek = () => {
        var nextDate = moment();
        var monday = nextDate.clone().weekday(1);
        var friday = nextDate.clone().weekday(7);
        setFromDate(moment().weekday(1).format('YYYY-MM-DD'));
        setToDate(moment().weekday(7).format('YYYY-MM-DD'));
    } 




    return(
            <>

                        <div className='d-flex justify-content-end'>
                            <button className='btn btn-primary m-2' onClick={()=> moveWeek(-1)}>Previous week</button>
                            <button className='btn btn-success m-2' onClick={()=> currentWeek()}>Current week</button>
                            <button className='btn btn-primary m-2' onClick={()=> moveWeek(1)}>Next week</button>
                        </div>

                        <Dashboard username={username} fromDate={fromDate} toDate={toDate}/>

            </>

    )



};