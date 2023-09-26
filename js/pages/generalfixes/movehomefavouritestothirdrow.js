async function SearchForRow(Container, SortId){
    while (true){
        const Children = Container.children

        for (let i = 0; i < Children.length; i++){
            const Child = Children[i]
            if (Child.nodeType !== Node.ELEMENT_NODE) continue

            if (Child.className === "container-header"){
                const href = Child.getElementsByTagName("h2")[0].getElementsByTagName("a")[0].href
                if (href.includes("sortId="+SortId)){
                    return [Child, Children[i+1]]
                }
            }
        }

        await sleep(50)
    }
}   

IsFeatureEnabled("MoveHomeFavouritesToThirdRow").then(async function(Enabled){
    if (Enabled) return

    let GamesList = await WaitForClass("game-home-page-container")
    if (await IsFeatureEnabled("TemporaryHomePageContainerFix")) GamesList = (await WaitForClassPath(GamesList, "game-carousel")).parentNode
    const [FavTitle, FavRow] = await SearchForRow(GamesList, 100000001)
        //const [RecommendedTitle, _] = await SearchForRow(Container, "Recommended")
    const ThirdTitle = GamesList.children[4]
    
    GamesList.insertBefore(FavRow, ThirdTitle)
    GamesList.insertBefore(FavTitle, FavRow)
})