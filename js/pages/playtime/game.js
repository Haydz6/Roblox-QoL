async function GetUniverseId(){
    const Metadata = await WaitForId("game-detail-meta-data")
    let UniverseId

    while (!UniverseId){
        UniverseId = Metadata.getAttribute("data-universe-id")
        await sleep(20)
    }

    return parseInt(UniverseId)
}

IsFeatureEnabled("Playtime").then(async function(Enabled){
    if (!Enabled) return

    const TitleContainer = await WaitForClass("game-title-container")
    const [Container, PlaytimeValue] = CreateGamePlaytime()

    const [DropdownList, List, DropdownButton, CloseList] = CreateDropdownList("All Time")
    DropdownList.style = "width: 120px; display: inline-table; right: 0px; position: absolute;"
    DropdownButton.parentElement.style = "border-color: transparent; width: 100%;"
    DropdownButton.style = "font-size: 12px;"

    Container.appendChild(DropdownList)

    TitleContainer.appendChild(Container)

    const UniverseId = await GetUniverseId()

    let FetchInt = 0

    async function GetPlaytime(Time){
        FetchInt ++
        const CacheFetchInt = FetchInt

        PlaytimeValue.innerText = "..."
        const [Success, Result] = await RequestFunc(`${WebServerEndpoints.Playtime}?time=${Time}&universeId=${UniverseId}`)
        if (FetchInt === CacheFetchInt) PlaytimeValue.innerText = Success && SecondsToLengthShort(Result.Playtime, true, true) || "???"
    }

    function CreateButton(Title, Params){
        const [ButtonContainer, Button] = CreateDropdownButton(Title)
        List.appendChild(ButtonContainer)

        Button.addEventListener("click", function(){
            DropdownButton.innerText = Title
            GetPlaytime(Params)
            CloseList()
        })
    }

    CreateButton("Past Day", "1")
    CreateButton("Past Week", "7")
    CreateButton("Past Month", "30")
    CreateButton("Past Year", "365")
    CreateButton("All Time", "all")

    GetPlaytime("all")
})