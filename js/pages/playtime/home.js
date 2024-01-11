let PlaytimeBatchRequests = []

function RequestPlaytimeBatchFetch(Type, ShouldFetch){
    return new Promise(async(resolve, reject) => {
        PlaytimeBatchRequests.push({resolve: resolve, Type: Type})
        if (ShouldFetch === false) return

        if (PlaytimeBatchRequests.length >= 2) {
            const [Success, Games] = await RequestFunc(`${WebServerEndpoints.Playtime}all?time=all&type=Play,Edit&show=Some`, "GET")

            if (!Success) {
                for (let i = 0; i < PlaytimeBatchRequests.length; i++){
                    PlaytimeBatchRequests[i].resolve([Success, Games])
                }
            }
            else {
                for (let i = 0; i < PlaytimeBatchRequests.length; i++){
                    const Request = PlaytimeBatchRequests[i]
                    Request.resolve([Success, Games[Request.Type]])
                }
            }
        }
    })
}

async function CreateHomeRow(GamesList, Name, Type, ShowIfEmpty){
    const [ContainerHeader, SeeAllButton] = CreateContainerHeader(Name, `https://www.roblox.com/discover#/sortName?sort=Playtime&type=${Type}`)
    if (!ShowIfEmpty) ContainerHeader.style = "display: none;"
    const GameCarousel = CreateGameCarousel()

    const [ContinueTitle, ContinueRow] = await SearchForRow(GamesList, 100000003)
    
    GamesList.insertBefore(GameCarousel, ContinueRow.nextSibling)
    GamesList.insertBefore(ContainerHeader, GameCarousel)

    const [DropdownList, List, DropdownButton, CloseList] = CreateDropdownList("All Time")
    ContainerHeader.appendChild(DropdownList)

    let FetchInt = [0]
    let FirstRequest = true

    async function FetchGames(Params){
        FetchInt[0]++
        const CacheFetchInt = FetchInt[0]

        while (GameCarousel.firstChild) GameCarousel.removeChild(GameCarousel.lastChild)
        
        const Spinner = CreateSpinner()
        GameCarousel.appendChild(Spinner)

        let Success, Games, Result
        if (FirstRequest){
            FirstRequest = false
            ;([Success, Games, Result] = await RequestPlaytimeBatchFetch(Type))
        } else [
            ([Success, Games, Result] = await RequestFunc(`${WebServerEndpoints.Playtime}all?${Params}&type=${Type}&show=Some`, "GET"))
        ]

        if (Params === "time=all" && !ShowIfEmpty && Games.length === 0){
            ContainerHeader.remove()
            GameCarousel.remove()
            return
        } else {
            ContainerHeader.style = ""
        }

        if (FetchInt[0] !== CacheFetchInt) return

        function Fail(Text){
            const FailedText = document.createElement("p")
            FailedText.innerText = Text
            GameCarousel.appendChild(FailedText)

            Spinner.remove()
        }

        if (!Success) {
            Fail(`Failed to load playtime (${Result?.status || ""} ${Result?.statusText || "HTTP Failed"}. ${Games?.Result || ""})`)
            return
        }

        Games.sort(function(a, b){
            return b.Playtime - a.Playtime
        })

        CreateGameCardsFromUniverseIds(Games.slice(0, Math.min(Games.length, 6)), GameCarousel, CacheFetchInt, FetchInt, Fail, Spinner)
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

IsFeatureEnabled("Playtime").then(async function(Enabled){
    if (!Enabled) return

    let GamesList = await WaitForClass("game-home-page-container")
    if (await IsFeatureEnabled("TemporaryHomePageContainerFix")) GamesList = (await WaitForClassPath(GamesList, "game-carousel")).parentNode

    const [PlaytimeHide, EdittimeHide] = await Promise.all([IsFeatureEnabled("HidePlayTime"), IsFeatureEnabled("HideEditTime")])
    console.log(PlaytimeHide, EdittimeHide)
   
    if (!EdittimeHide) CreateHomeRow(GamesList, "Studio Sessions", "Edit", false)
    else RequestPlaytimeBatchFetch("Edit", false)

    if (!PlaytimeHide) CreateHomeRow(GamesList, "Playtime", "Play", false)
    else RequestPlaytimeBatchFetch("Play", false)
})