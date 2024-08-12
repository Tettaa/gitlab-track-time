export default function ApolloFetchError({loading,error}) {
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;
}

