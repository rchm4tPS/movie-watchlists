export function renderSearchComponent() {
    return (`
        <section class="search-area">
            <div class="search-icon-img">
                <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <input type="text" name="movie_title" id="movie_title" placeholder="Enter film title" />
            <button type="submit">Search</button>
        </section>
    `)
}

export async function getFilmData(title) {
    const cleanedTitle = title.replace(/\s+/,"+")

    const baseURL = "https://www.omdbapi.com/"
    const fullUrl = `${baseURL}?apikey=${import.meta.env.VITE_OMDB_API_KEY}&t=${cleanedTitle}&plot=full`

    const response = await fetch(fullUrl)
    const dataRetrieved = await response.json()

    return dataRetrieved
}