async function SearchForRow(Container, URL){
    while (true){
        const Children = Container.children

        for (let i = 0; i < Children.length; i++){
            const Child = Children[i]
            if (Child.nodeType !== Node.ELEMENT_NODE) continue

            if (Child.className === "container-header"){
                const href = Child.getElementsByTagName("h2")[0].getElementsByTagName("a")[0].href
                if (href.search(URL) > -1){
                    return [Child, Children[i+1]]
                }
            }
        }

        await sleep(50)
    }
}

IsFeatureEnabled("MoveHomeFavouritesToThirdRow").then(async function(Enabled){
    if (!Enabled) return

    const Container = await WaitForClass("game-home-page-container")
    const [FavTitle, FavRow] = await SearchForRow(Container, "Favorites")
    //const [RecommendedTitle, _] = await SearchForRow(Container, "Recommended")
    const ThirdTitle = Container.children[4]

    Container.insertBefore(FavTitle, ThirdTitle)
    Container.insertBefore(FavRow, ThirdTitle)
})