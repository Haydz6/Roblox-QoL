function IsPlaytimePage(){
    return window.location.href.split("#")[1]?.includes("/sortName?sort=Playtime")
}

function GetPlaytimeType(){
    return window.location.href.split("type=")[1].split("&")[0]
}

IsFeatureEnabled("Playtime").then(async function(Enabled){
    if (!Enabled || !IsPlaytimePage()) return

    const Type = GetPlaytimeType()
    const GameCarousel = await WaitForId("games-carousel-page")

    const [SortContainer, GameGrid, Title] = CreateSortDiscover(Type == "Edit" && "Studio Sessions" || "Playtime")
    GameCarousel.appendChild(SortContainer)

    ChildRemoved(GameCarousel, function(Child){
        if (Child === SortContainer) {
            GameCarousel.appendChild(SortContainer)
        }
    })

    const [DropdownList, List, DropdownButton, CloseList] = CreateDropdownList("All Time")
    DropdownList.style = "width: 150px; display: inline-table; float: revert; margin-left: 20px;"
    Title.appendChild(DropdownList)

    let FetchInt = [0]
    let AllGames
    let CurrentCursor = 0
    let CurrentPage = 0
    let CurrentParams
    
    const LoadMoreButton = CreateLoadMoreButton()
    LoadMoreButton.style = "display: none;"
    GameCarousel.parentElement.appendChild(LoadMoreButton)

    function RemoveAllChildren(){
        while (GameGrid.firstChild) GameGrid.removeChild(GameGrid.lastChild)
    }

    // async function GetNextGames(){
    //     if (!AllGames) return

    //     const Spinner = CreateSpinner()
    //     GameGrid.appendChild(Spinner)

    //     let Failed = false

    //     function Fail(Text){
    //         Failed = true
    //     }

    //     LoadMoreButton.setAttribute("disabled", "disabled")

    //     const CacheFetchInt = FetchInt[0]
    //     CreateGameCardsFromUniverseIds(AllGames.slice(CurrentCursor, Math.min(AllGames.length, CurrentCursor+100)), GameGrid, CacheFetchInt, FetchInt, Fail, Spinner).then(function(){
    //         if (FetchInt[0] == CacheFetchInt) LoadMoreButton.removeAttribute("disabled")
    //         if (!Failed){
    //             CurrentCursor += 100
    //             if (CurrentCursor >= AllGames.length) LoadMoreButton.style = "display: none;"
    //         }
    //     })
    // }

    async function NextPage(){
        FetchInt[0]++
        const CacheFetchInt = FetchInt[0]

        CurrentPage ++
        LoadMoreButton.setAttribute("disabled", "disabled")

        const Spinner = CreateSpinner()
        GameGrid.appendChild(Spinner)

        const [Success, Games, Result] = await RequestFunc(`${WebServerEndpoints.Playtime}all?${CurrentParams}&type=${Type}&page=${CurrentPage}`, "GET")
        if (FetchInt[0] !== CacheFetchInt) return

        function Fail(Text){
            const FailedText = document.createElement("p")
            FailedText.innerText = Text
            GameGrid.appendChild(FailedText)

            Spinner.remove()
        }

        if (!Success) {
            Fail(`Failed to load playtime (${Result?.statusText || "HTTP Failed"}. ${Games?.Result || ""})`)
            return
        }

        Games.sort(function(a, b){
            return b.Playtime - a.Playtime
        })

        if (!AllGames) AllGames = Games
        else AllGames.concat(Games)

        CurrentCursor = 100
        await CreateGameCardsFromUniverseIds(Games.slice(0, Math.min(Games.length, 100)), GameGrid, CacheFetchInt, FetchInt, Fail, Spinner)

        LoadMoreButton.removeAttribute("disabled")
        if (Games.length == 100) LoadMoreButton.style = ""
        else LoadMoreButton.style = "display: none;"
    }

    async function FetchGames(Params){
        RemoveAllChildren()
        AllGames = undefined
        CurrentParams = Params
        LoadMoreButton.style = "display: none;"
        
        NextPage()
    }

    function CreateButton(Title, Params){
        const [ButtonContainer, Button] = CreateDropdownButton(Title)
        List.appendChild(ButtonContainer)

        Button.addEventListener("click", function(){
            DropdownButton.innerText = Title
            DropdownButton.title = Title
            FetchGames(Params)
            CloseList()
        })
    }

    CreateButton("Past Day", "time=1")
    CreateButton("Past Week", "time=7")
    CreateButton("Past Month", "time=30")
    CreateButton("Past Year", "time=365")
    CreateButton("All Time", "time=all")

    LoadMoreButton.addEventListener("click", NextPage)

    FetchGames("time=all")
})