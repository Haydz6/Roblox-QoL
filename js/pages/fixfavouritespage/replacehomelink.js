IsFeatureEnabled("FixFavouritesPage").then(async function(Enabled){
    if (!Enabled) return

    setTimeout(async function(){
        let GamesList = await WaitForClass("game-home-page-container")
        if (await IsFeatureEnabled("TemporaryHomePageContainerFix")) GamesList = (await WaitForClassPath(GamesList, "game-carousel")).parentNode
        const [Title] = await SearchForRow(GamesList, 100000001)
        const SeeAll = await WaitForClassPath(Title, "see-all-link-icon")
        SeeAll.href = "https://www.roblox.com/discover#/sortName?sort=Favorites"
    }, 0)
})