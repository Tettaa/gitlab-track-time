
import useFetch from './useFetch'

const TodayEffort = () => {

    let time =

      {
        "query": "query {timelogs(startDate:\"2024-05-20\", endDate:\"2024-06-31\", username: \"t130606\") {totalSpentTime}}\n",
        "variables": null
      };
      
      const {data,loading,error} = useFetch('https://gitlab.ti.ch/api/graphql','glpat-dz7bddNJGtz5Zns6_Hyg',time)
      



    return (
        <>
            <h1>Ciao</h1>
        </>
    )


}

export default TodayEffort