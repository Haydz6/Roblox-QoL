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

    const [DropdownList, List, DropdownButton, CloseList] = CreateDropdownList("All Time")
    DropdownList.style = "width: 150px; display: inline-table; float: revert; margin-left: 20px;"
    Title.appendChild(DropdownList)

    let FetchInt = [0]
    let AllGames
    let CurrentCursor = 0
    
    const LoadMoreButton = CreateLoadMoreButton()
    LoadMoreButton.style = "display: none;"
    GameCarousel.parentElement.appendChild(LoadMoreButton)

    function RemoveAllChildren(){
        while (GameGrid.firstChild) GameGrid.removeChild(GameGrid.lastChild)
    }

    async function GetNextGames(){
        if (!AllGames) return

        const Spinner = CreateSpinner()
        GameGrid.appendChild(Spinner)

        let Failed = false

        function Fail(Text){
            Failed = true
        }

        LoadMoreButton.setAttribute("disabled", "disabled")

        const CacheFetchInt = FetchInt[0]
        CreateGameCardsFromPlaytime(AllGames.slice(CurrentCursor, Math.min(AllGames.length, CurrentCursor+100)), GameGrid, CacheFetchInt, FetchInt, Fail, Spinner).then(function(){
            if (FetchInt[0] == CacheFetchInt) LoadMoreButton.removeAttribute("disabled")
            if (!Failed){
                CurrentCursor += 100
                if (CurrentCursor >= AllGames.length) LoadMoreButton.style = "display: none;"
            }
        })
    }

    async function FetchGames(Params){
        FetchInt[0]++
        const CacheFetchInt = FetchInt[0]

        RemoveAllChildren()
        LoadMoreButton.style = "display: none;"
        
        const Spinner = CreateSpinner()
        GameGrid.appendChild(Spinner)

        const [Success, Games] = await RequestFunc(`${WebServerEndpoints.Playtime}all?${Params}&type=${Type}`, "GET")
        if (FetchInt[0] !== CacheFetchInt) return

        function Fail(Text){
            const FailedText = document.createElement("p")
            FailedText.innerText = Text
            GameGrid.appendChild(FailedText)

            Spinner.remove()
        }

        if (!Success) {
            Fail("Failed to load playtime")
            return
        }

        Games.sort(function(a, b){
            return b.Playtime - a.Playtime
        })

        AllGames = Games

        CurrentCursor = 100
        await CreateGameCardsFromPlaytime(Games.slice(0, Math.min(Games.length, 100)), GameGrid, CacheFetchInt, FetchInt, Fail, Spinner)

        if (Games.length > 100) LoadMoreButton.style = ""
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

    LoadMoreButton.addEventListener("click", GetNextGames)

    FetchGames("time=all")
})