IsFeatureEnabled("Mutuals2").then(async function(Enabled){
    if (!Enabled || (await GetUserId() == GetTargetId())) return

    const ProfileHeader = await WaitForQuerySelector(".profile-header:not(.hidden)")
    const HeadersList = await WaitForClassPath(ProfileHeader, "details-info")
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