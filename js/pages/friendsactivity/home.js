IsFeatureEnabled("FriendsActivity").then(async function(Enabled){
    if (!Enabled) return

    let GamesList = await WaitForClass("game-home-page-container")
    if (await IsFeatureEnabled("TemporaryHomePageContainerFix")) GamesList = (await WaitForClassPath(GamesList, "game-carousel")).parentNode
    
    const [Success, Games] = await RequestFunc(WebServerEndpoints.Friends+"sort?type=Some", "GET")
    if (!Success){
        GameCarousel.innerText = "Failed to fetch"
        Spinner.remove()
        return
    }
    if (Games.length === 0) return

    const [ContainerHeader, _, HeaderButton] = CreateContainerHeader("Friends Activity", `https://roblox.com/discover#/sortName?sort=FriendsActivity`)
    HeaderButton.innerText = "Friends Activity"

    const GameCarousel = CreateGameCarousel()

    const Spinner = CreateSpinner()
    GameCarousel.appendChild(Spinner)

    const [RecommendedTitle] = await SearchForRow(GamesList, 100000000)

    GamesList.insertBefore(GameCarousel, RecommendedTitle)
    GamesList.insertBefore(ContainerHeader, GameCarousel)

    CreateGameCardsFromUniverseIds(Games, GameCarousel, null, null, null, Spinner)
})