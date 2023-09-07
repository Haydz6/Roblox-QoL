let TargetId

function GetTargetId(){
    if (!TargetId) TargetId = parseInt(window.location.href.split("users/")[1].split("/")[0])
    return TargetId
}

async function GetMutualFriends(TargetId){
    // const [Success, Result] = await RequestFunc("https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: [TargetId], count: 200}))
    
    // if (!Success) return [false]

    // return [true, Result.userInsights[0].profileInsights.mutualFriendInsight.mutualFriends]

    // const [Success, Friends] = await RequestFunc(`https://friends.roblox.com/v1/users/${await GetUserId()}/friends`)

    // if (!Success){
    //     return [false]
    // }
    const Friends = await chrome.runtime.sendMessage({type: "GetCachedFriends"})

    const [TargetSuccess, TargetFriends] = await RequestFunc(`https://friends.roblox.com/v1/users/${TargetId}/friends`)

    if (!TargetSuccess) return [false]

    const FriendsMap = {}
    const TargetData = TargetFriends.data

    const Mutuals = []

    for (let i = 0; i < Friends.length; i++){
        FriendsMap[Friends[i]] = true
    }

    for (let i = 0; i < TargetData.length; i++){
        const Friend = TargetData[i]

        if (!FriendsMap[Friend.id]) continue

        Mutuals.push(Friend)
    }

    return [true, Mutuals]
}

async function GetMutualFriendsCount(TargetId){
    //const [Success, Result, Response] = await RequestFuncCORSBypass("https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: [TargetId], count: 200}), true)
    
    //if (!Success){
        //if (Response?.status == 404){
    const [Success, Result] = await GetMutualFriends(TargetId)

    if (!Success) return [false]
    return [true, Result.length]
        //}

       //return [false]
    //}

    // const Mutuals = Result.userInsights[0].profileInsights?.[0]?.mutualFriendInsight?.mutualFriends
    // if (!Mutuals) return [true, 0]

    // return [true, Object.keys(Mutuals).length]
}