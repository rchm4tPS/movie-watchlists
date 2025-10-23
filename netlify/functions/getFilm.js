export async function handler (event) {
    // Get movie title string
    const movieTitle = event.queryStringParameters.title
    const apiKey = process.env.OMDB_API_KEY

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&t=${movieTitle.replace(/\s+/,"+")}&plot=full`;

    try {
        const response = await fetch(url)
        const data = await response.json()

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch movie data!" })
        }
    }
}