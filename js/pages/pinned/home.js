IsFeatureEnabled("PinnedGames").then(async function(Enabled){
    if (!Enabled) return

    const GamesList = await WaitForClass("game-home-page-container")
    
    const [Success, Games] = await RequestFunc(WebServerEndpoints.Pinned+"all?type=Some", "GET")
    if (!Success){
        GameCarousel.innerText = "Failed to fetch"
        Spinner.remove()
        return
    }
    if (Games.length === 0) return

    const [ContainerHeader] = CreateContainerHeader("📌 Pinned Games", `https://roblox.com/discover#/sortName?sort=PinnedGames`)
    const GameCarousel = CreateGameCarousel()

    const Spinner = CreateSpinner()
    GameCarousel.appendChild(Spinner)

    GamesList.insertBefore(GameCarousel, GamesList.children[0])
    GamesList.insertBefore(ContainerHeader, GameCarousel)

    CreateGameCardsFromUniverseIds(Games, GameCarousel, null, null, null, Spinner)
})