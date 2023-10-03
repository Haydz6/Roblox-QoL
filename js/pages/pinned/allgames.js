function IsPinnedGamesPage(){
    return window.location.href.split("#")[1]?.includes("/sortName?sort=PinnedGames")
}

IsFeatureEnabled("PinnedGames").then(async function(Enabled){
    if (!Enabled || !IsPinnedGamesPage()) return

    const GameCarousel = await WaitForId("games-carousel-page")

    const [SortContainer, GameGrid, Title] = CreateSortDiscover("📌 Pinned Games")
    GameCarousel.appendChild(SortContainer)

    ChildRemoved(GameCarousel, function(Child){
        if (Child === SortContainer) {
            GameCarousel.appendChild(SortContainer)
        }
    })

    const Spinner = CreateSpinner()
    GameGrid.appendChild(Spinner)

    const [Success, Games, Result] = await RequestFunc(WebServerEndpoints.Pinned+"all?type=All", "GET")

    function Fail(Text){
        const FailedText = document.createElement("p")
        FailedText.innerText = Text
        GameGrid.appendChild(FailedText)

        Spinner.remove()
    }

    if (!Success) {
        Fail(`Failed to load pinned games (${Result?.statusText || "HTTP Failed"}. ${Games?.Result || ""})`)
        return
    }

    CreateGameCardsFromUniverseIds(Games, GameGrid, null, null, Fail, Spinner)
})