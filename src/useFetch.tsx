import { useEffect, useState } from "react"
import axios from "axios"


export default function useFetch(url: string, gitLabToken: string, graphQL: string){

    const [data,setData] = useState(null)
    const [error,setError] = useState(null)
    const [loading,setLoading] = useState(false)

    useEffect(() => {
        (
            async function(){
                let config = {
                    headers: {
                    "Cache-Control": "no-cache",
                      'Authorization': `Bearer ${gitLabToken}`,
                      "Access-Control-Allow-Origin": true
                    }
                  }
                try{
                    setLoading(true)
                    const response = await axios.post(
                        url,
                        graphQL, 
                        config)
                        console.log(response.data)
                    setData(response.data)
                }catch(err){
                    setError(err)
                }finally{
                    setLoading(false)
                }
            }
        )()
    }, [url])

    return { data, error, loading }

}