async function Main(){
    const GamesList = await WaitForClass("game-home-page-container")

    const [ContainerHeader, SeeAllButton] = CreateContainerHeader("Playtime", "https://roblox.com/discover#/sortName?sort=Playtime")
    const GameCarousel = CreateGameCarousel()

    const [ContinueTitle, ContinueRow] = await SearchForRow(GamesList, "/sortName/v2/Friend%20Activity")
    GamesList.insertBefore(GameCarousel, ContinueTitle)
    GamesList.insertBefore(ContainerHeader, GameCarousel)

    const [DropdownList, List, DropdownButton, CloseList] = CreateDropdownList("All Time")
    ContainerHeader.appendChild(DropdownList)

    let FetchInt = [0]

    async function FetchGames(Params){
        FetchInt[0]++
        const CacheFetchInt = FetchInt[0]

        while (GameCarousel.firstChild) GameCarousel.removeChild(GameCarousel.lastChild)
        
        const Spinner = CreateSpinner()
        GameCarousel.appendChild(Spinner)

        const [Success, Games] = await RequestFunc(`${WebServerEndpoints.Playtime}all?${Params}`, "GET")
        if (FetchInt[0] !== CacheFetchInt) return

        function Fail(Text){
            const FailedText = document.createElement("p")
            FailedText.innerText = Text
            GameCarousel.appendChild(FailedText)

            Spinner.remove()
        }

        if (!Success) {
            Fail("Failed to load playtime")
            return
        }

        Games.sort(function(a, b){
            return b.Playtime - a.Playtime
        })

        CreateGameCardsFromPlaytime(Games.slice(0, Math.min(Games.length, 6)), GameCarousel, CacheFetchInt, FetchInt, Fail, Spinner)
    }

    function CreateButton(Title, Params){
        const [ButtonContainer, Button] = CreateDropdownButton(Title)
        List.appendChild(ButtonContainer)

        Button.addEventListener("click", function(){
            DropdownButton.innerText = Title
            FetchGames(Params)
            CloseList()
        })
    }

    CreateButton("Past Day", "time=1")
    CreateButton("Past Week", "time=7")
    CreateButton("Past Month", "time=30")
    CreateButton("Past Year", "time=365")
    CreateButton("All Time", "time=all")

    FetchGames("time=all")
}

IsFeatureEnabled("Playtime").then(function(Enabled){
    if (Enabled) Main()
})