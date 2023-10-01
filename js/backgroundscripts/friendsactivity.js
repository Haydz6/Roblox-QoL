const LastFriendsActivity = {}

function CanUpdateFriendActivity(Presence, LastActivity){
    if (!Presence.universeId) return false
    if (Presence.userPresenceType !== 2) return false
    if (LastActivity && LastActivity.userPresenceType === 2 && LastActivity.universeId === Presence.universeId){
        if (LastActivity.userPresenceType === 2){
            return false
        }
    }

    return true
}

async function UpdateFriendsActivity(Friends){
    if (!await IsFeatureEnabled("FriendsActivity")) return

    const [Success, Result] = await RequestFunc("https://presence.roblox.com/v1/presence/users", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: Friends}), true)
    if (!Success) return

    const Presences = Result.userPresences
    const FriendsToUniverseId = []
    let Updated = false

    for (let i = 0; i < Presences.length; i++){
        const Presence = Presences[i]
        const LastActivity = LastFriendsActivity[Presence.userId]
        LastFriendsActivity[Presence.userId] = Presence

        if (CanUpdateFriendActivity(Presence, LastActivity)){
            if (!FriendsToUniverseId.includes(Presence.universeId)) FriendsToUniverseId.push(Presence.universeId)
            Updated = true
        }
    }

    if (Updated) RequestFunc(WebServerEndpoints.Friends+"sort", "POST", {"Content-Type": "application/json"}, JSON.stringify(FriendsToUniverseId))
}