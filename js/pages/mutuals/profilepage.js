IsFeatureEnabled("Mutuals").then(async function(Enabled){
    if (!Enabled) return

    const HeadersList = await WaitForClass("details-info")
    const TargetId = GetTargetId()

    const [List, Count] = CreateMututalHeader(TargetId)

    Count.title = "..."
    Count.innerText = "..."
    HeadersList.insertBefore(List, HeadersList.firstChild)

    const [Success, Mutuals] = await GetMutualFriends(TargetId)

    if (!Success){
        Count.title = "ERR"
        Count.innerText = "ERR"
        return
    }

    Count.title = Mutuals.length
    Count.innerText = Mutuals.length
})