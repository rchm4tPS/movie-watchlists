export const navbar = (pageType="index") => {
    return (
        `
        <nav>
            <div class="nav-container">
            ${ (pageType === "index") 
                ? '<h1 class="logo">Find your film</h1><a href="/pages/watchlist.html"><p class="menu">My Watchlist</p></a>' 
                : (pageType === "watchlist") 
                    ? '<h1 class="logo">My Watchlist</h1><a href="/index.html"><p class="menu">Search for movies</p></a>' 
                    : '<h1 class="logo">Default Logo Text</h1>' }
            </div>
        </nav>
        `
    )
}