IsFeatureEnabled("PinnedGames").then(async function(Enabled){
    if (!Enabled) return

    let GamesList = await WaitForClass("game-home-page-container")
    if (await IsFeatureEnabled("TemporaryHomePageContainerFix")) GamesList = (await WaitForClassPath(GamesList, "game-carousel")).parentNode
    
    const [Success, Games] = await RequestFunc(WebServerEndpoints.Pinned+"all?type=Some", "GET")
    if (!Success){
        GameCarousel.innerText = "Failed to fetch"
        Spinner.remove()
        return
    }
    if (Games.length === 0) return

    const [ContainerHeader, _, HeaderButton] = CreateContainerHeader("Pinned Games", `https://roblox.com/discover#/sortName?sort=PinnedGames`)
    HeaderButton.innerHTML = `<img style="height: 24px;" src="${chrome.runtime.getURL("img/pushpin.png")}"> Pinned Games`

    const GameCarousel = CreateGameCarousel()

    const Spinner = CreateSpinner()
    GameCarousel.appendChild(Spinner)

    GamesList.insertBefore(GameCarousel, GamesList.children[0])
    GamesList.insertBefore(ContainerHeader, GameCarousel)

    CreateGameCardsFromUniverseIds(Games, GameCarousel, null, null, null, Spinner)
})