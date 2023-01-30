let TargetId

function GetTargetId(){
    if (!TargetId) TargetId = parseInt(window.location.href.split("users/")[1].split("/")[0])
    return TargetId
}

async function GetMutualFriends(TargetId){
    const [Success, Friends] = await RequestFunc(`https://friends.roblox.com/v1/users/${UserId}/friends`)

    if (!Success){
        return [false]
    }

    const [TargetSuccess, TargetFriends] = await RequestFunc(`https://friends.roblox.com/v1/users/${TargetId}/friends`)

    if (!TargetSuccess){
        return [false]
    }

    const FriendsMap = {}
    const Data = Friends.data
    const TargetData = TargetFriends.data

    const Mutuals = []

    for (let i = 0; i < Data.length; i++){
        FriendsMap[Data[i].id] = true
    }

    for (let i = 0; i < TargetData.length; i++){
        const Friend = TargetData[i]

        if (!FriendsMap[Friend.id]) continue

        Mutuals.push(Friend)
    }

    return [true, Mutuals]
}