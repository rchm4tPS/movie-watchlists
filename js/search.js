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
    // need to use https protocol instead of http when deployed!
    // The new URL points to OUR serverless function, not OMDb
    // const baseURL = "https://www.omdbapi.com/"

    const fullUrl = `/api/getFilm?title=${title}`;

    const response = await fetch(fullUrl)
    const dataRetrieved = await response.json()

    return dataRetrieved
}