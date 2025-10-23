import { navbar } from "./js/navbar";
import { renderSearchComponent, getFilmData } from "./js/search";

const body = document.body;
const pageName = body.dataset.page;

let movieDatas = [];
let movieLocalStorage = JSON.parse(localStorage.getItem("watchlist")) || [];
let watchlistListenerAttached = false;

// This function will be called by the onerror attribute in the img tag
function handleImgError(imgElement) {
    const placeholderHTML = `
        <div class="movie-img-placeholder">
            <i class="fa-solid fa-film"></i>
            <p>Poster Not Found</p>
        </div>`;
    // Replace the entire content of the parent container (.movie-img-container)
    imgElement.parentElement.innerHTML = placeholderHTML;
}
// Make it available on the window object so the inline handler can find it.
window.handleImgError = handleImgError;

function addSearchEventListener() {
    const searchBtn = document.querySelector('button[type="submit"]');

    if (searchBtn) {
        searchBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            const movieTitleInput = document.getElementById("movie_title").value;
            if (movieTitleInput) {
                try {
                    const searchResultData = await getFilmData(movieTitleInput);

                    // --- START OF FIX for BUG-002 ---
                    if (!searchResultData.Error) {
                        // Wipe the previous search results for a clean UI
                        movieDatas = []
                        movieDatas.unshift(searchResultData);
                    }
                    // --- END OF FIX for BUG-002 ---
                    else throw new Error(searchResultData.Error);

                    renderListView("index");
                } catch (error) {
                    console.error("Failed to fetch or render movie data:", error);
                }
            }
        });
    }
}

// Attach single delegated listener to movie list container
function addToWatchlistEventListener() {
    const moviesContainer = document.querySelector(".movie-list-container");

    if (!moviesContainer || watchlistListenerAttached) return;

    moviesContainer.addEventListener("click", (e) => {
        const watchlistBtn = e.target.closest(".watchlist-interaction");
        if (!watchlistBtn) return;

        const movieCard = watchlistBtn.closest(".movie-card");
        if (!movieCard) return;

        const movieId = movieCard.dataset.movieId;

        // Decide source array based on page (index/search shows movieDatas; watchlist page shows stored list)
        const sourceArray = pageName === "watchlist" ? movieLocalStorage : movieDatas;
        const movieData = sourceArray.find((m) => m.imdbID === movieId);

        if (!movieData) {
            console.error("Could not find movie data for ID:", movieId);
            return;
        }

        toggleMovieInWatchlist(movieData);
        // Re-render the list. This will preserve the movie data in the DOM and update the button text.
        renderListView(pageName);
    });

    watchlistListenerAttached = true;
}

// Storage helpers
function getWatchlistFromStorage() {
    return JSON.parse(localStorage.getItem("watchlist")) || [];
}

function setWatchlistToStorage(list) {
    localStorage.setItem("watchlist", JSON.stringify(list));
    movieLocalStorage = list;
}

function isMovieInWatchlist(imdbID) {
    const list = getWatchlistFromStorage();
    return list.some((m) => m.imdbID === imdbID);
}

function addMovieToWatchlist(movieData) {
    const list = getWatchlistFromStorage();
    if (!list.some((m) => m.imdbID === movieData.imdbID)) {
        // create a leaner version of data to be stored in localStorage
        const essentialMovieData = {
            imdbID: movieData.imdbID,
            Title: movieData.Title,
            Poster: movieData.Poster,
            imdbRating: movieData.imdbRating,
            Runtime: movieData.Runtime,
            Genre: movieData.Genre,
            Plot: movieData.Plot
        }
        list.unshift(essentialMovieData);
        setWatchlistToStorage(list);
    }
}

function removeMovieFromWatchlist(imdbID) {
    let list = getWatchlistFromStorage();
    list = list.filter((m) => m.imdbID !== imdbID);
    setWatchlistToStorage(list);
}

function toggleMovieInWatchlist(movieData) {
    if (isMovieInWatchlist(movieData.imdbID)) {
        removeMovieFromWatchlist(movieData.imdbID);
    } else {
        addMovieToWatchlist(movieData);
    }
}

// Render function: uses storage state to decide what the watchlist button shows
function renderListView(pageName) {
    const movieContainer = document.querySelector(".movie-list-container");
    if (!movieContainer) return;

    const source = pageName === "watchlist" ? movieLocalStorage : movieDatas;

    if (source.length > 0) {
        movieContainer.innerHTML = source
            .map((movie, index) => {
                const inWatchlist = isMovieInWatchlist(movie.imdbID);
                const btnClass = inWatchlist ? "added-to-watchlist" : "";
                const iconClass = inWatchlist ? "fa-circle-minus" : "fa-circle-plus";
                const btnText = inWatchlist ? "Remove from Watchlist" : "Add to Watchlist";

                // --- START OF FIX for BUG-001 ---
                const posterHTML = movie.Poster !== "N/A"
                    ? `<img 
                            class="movie-img" 
                            src="${movie.Poster}" 
                            alt="Poster of movie title '${movie.Title}'" 
                            loading="${index < 2 ? 'eager' : 'lazy'}"
                            onerror="handleImgError(this)"
                       >`
                    : `<div class="movie-img-placeholder">
                        <i class="fa-solid fa-film"></i>
                        <p>No Poster Available</p>
                    </div>`;
                // --- END OF FIX for BUG-001 ---

                return `
                    <div class="movie-card" data-movie-id="${movie.imdbID}">
                            <div class="movie-img-container">
                                ${posterHTML}
                            </div>
                            <div class="movie-information">
                                <div class="data-row">
                                    <h2 class="movie-title">${movie.Title}</h2>
                                    <span>
                                            <i class="fa-solid fa-star"></i>
                                            <p class="rating-number">${movie.imdbRating}</p>
                                    </span>
                                </div>
                                <div class="data-row">
                                    <p class="runtime">${movie.Runtime}</p>
                                    <p class="genre-list">${movie.Genre}</p>
                                    <div class="watchlist-interaction ${btnClass}">
                                            <i class="fa-solid ${iconClass}"></i>
                                            <p>${btnText}</p>
                                    </div>
                                </div>
                                <p class="plot">${movie.Plot}</p>
                            </div>
                    </div>
                `;
            })
            .join("");
    } else {
        if (pageName === "index") {
            movieContainer.innerHTML = `<h3>Start exploring</h3>`
        }
        else if (pageName === "watchlist") {
            movieContainer.innerHTML = `<h3>Your watchlist is looking a little empty...</h3>`
        }
    }

    // Ensure the event listener is attached (idempotent)
    addToWatchlistEventListener();
}

function initPageRender() {
    try {
        if (!pageName) throw new Error("the body tag doesn't have data-page attribute!");
    
        let initHTML = navbar(pageName);
    
        initHTML += `<div class='retrieval-container'>
                <section class="movie-list-container"></section>
        </div>`;
    
        body.innerHTML += initHTML;
    
        const retrievalContainer = document.querySelector(".retrieval-container");
    
        if (pageName === "index" && retrievalContainer) {
            retrievalContainer.insertAdjacentHTML("afterbegin", renderSearchComponent());
            addSearchEventListener();
        }
    
        // initial render (empty lists will simply show nothing)
        renderListView(pageName);
    } catch (e) {
        console.error(e)
    }
}

initPageRender();