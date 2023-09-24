let HaveFetchedGroupShouts = false
let GroupShouts = {}

async function GetGroupShouts(){

}

function SaveGroupShouts(){

}

async function CheckForNewGroupShouts(){
    const WatchingGroups = await IsFeatureEnabled("GroupShoutNotifications")
    if (WatchingGroups.length === 0) return
    await GetGroupShouts()

    const UserId = await GetCurrentUserId()
    if (!UserId) return
    
    
}