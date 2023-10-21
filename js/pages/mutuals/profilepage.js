IsFeatureEnabled("Mutuals2").then(async function(Enabled){
    if (!Enabled || (await GetUserId() == GetTargetId())) return

    const HeadersList = await WaitForClass("details-info")
    const TargetId = GetTargetId()

    const [List, Count] = CreateMututalHeader(TargetId)

    Count.title = "..."
    Count.innerText = "..."
    HeadersList.insertBefore(List, HeadersList.firstChild)

    const [Success, Mutuals] = await GetMutualFriendsCount(TargetId)

    if (!Success){
        Count.title = "ERR"
        Count.innerText = "ERR"
        return
    }

    Count.title = Mutuals
    Count.innerText = Mutuals
})