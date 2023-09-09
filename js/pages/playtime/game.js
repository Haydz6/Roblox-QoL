async function GetUniverseId(){
    const Metadata = await WaitForId("game-detail-meta-data")
    let UniverseId

    while (!UniverseId){
        UniverseId = Metadata.getAttribute("data-universe-id")
        await sleep(20)
    }

    return parseInt(UniverseId)
}

async function CreateTypeTime(UniverseId, Type, Name, Icon){
    const TitleContainer = await WaitForClass("game-title-container")
    const [Container, PlaytimeValue] = CreateGamePlaytime(Type, Name, Icon)

    const [DropdownList, List, DropdownButton, CloseList] = CreateDropdownList("All Time")
    DropdownList.style = "width: 120px; display: inline-table; right: 0px; position: absolute;"
    DropdownButton.parentElement.style = "border-color: transparent; width: 100%;"
    DropdownButton.style = "font-size: 12px;"

    Container.appendChild(DropdownList)

    TitleContainer.appendChild(Container)

    let FetchInt = 0

    async function GetPlaytime(Time){
        FetchInt ++
        const CacheFetchInt = FetchInt

        PlaytimeValue.innerText = "..."
        const [Success, Result] = await RequestFunc(`${WebServerEndpoints.Playtime}?time=${Time}&universeId=${UniverseId}&type=${Type}`)

        if (FetchInt === CacheFetchInt) PlaytimeValue.innerText = Success && SecondsToLengthShort(Result.Playtime, true, true) || "???"
    }

    function CreateButton(Title, Params){
        const [ButtonContainer, Button] = CreateDropdownButton(Title)
        List.appendChild(ButtonContainer)

        Button.addEventListener("click", function(){
            DropdownButton.innerText = Title
            DropdownButton.title = Title
            CloseList()
            GetPlaytime(Params)
        })
    }

    CreateButton("Past Day", "1")
    CreateButton("Past Week", "7")
    CreateButton("Past Month", "30")
    CreateButton("Past Year", "365")
    CreateButton("All Time", "all")

    GetPlaytime("all")
}

IsFeatureEnabled("Playtime").then(async function(Enabled){
    if (!Enabled) return
    const UniverseId = await GetUniverseId()

    CreateTypeTime(UniverseId, "Play")

    const [Success, EditInfo] = await RequestFunc(`https://develop.roblox.com/v1/universes/${UniverseId}/permissions`, "GET", undefined, undefined, true)
    if (Success && (EditInfo.canManage || EditInfo.canCloudEdit)){
        CreateTypeTime(UniverseId, "Edit", "Edited")
    }
})