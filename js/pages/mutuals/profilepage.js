async function Main(){
    const HeadersList = await WaitForClass("details-info")

    const [List, Count] = CreateMututalHeader(TargetId)

    Count.title = "..."
    Count.innerText = "..."
    HeadersList.insertBefore(List, HeadersList.firstChild)

    const [Success, Mutuals] = await GetMutualFriends(GetTargetId())

    if (!Success){
        Count.title = "ERR"
        Count.innerText = "ERR"
        return
    }

    Count.title = Mutuals.length
    Count.innerText = Mutuals.length
}

IsFeatureEnabled("Mutuals").then(function(Enabled){
    if (Enabled){
        Main()
    }
})