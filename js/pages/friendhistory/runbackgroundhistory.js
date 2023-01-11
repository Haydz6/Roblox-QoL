function CanUpdateHistory(){
    const LastTime = window.localStorage.getItem("robloxqol-lasthistoryupdate")
    const CurrentTime = Math.floor(Date.now()/1000)

    if (LastTime && CurrentTime-parseInt(LastTime) < 60){
        return false
    }

    window.localStorage.setItem("robloxqol-lasthistoryupdate", CurrentTime)
    return true
}

async function UpdateHistory(){
    if (!CanUpdateHistory()) return

    const [Success, Result] = await RequestFunc(`https://friends.roblox.com/v1/users/${UserId}/friends`, "GET", undefined, undefined, true)

    if (!Success) return

    const Friends = []
    const Data = Result.data

    for (let i = 0; i < Data.length; i++){
        Friends.push(Data[i].id)
    }

    await RequestFunc(WebServerEndpoints.History+"update", "POST", undefined, JSON.stringify(Friends))
}

async function Main(){
    while (!UserId) await sleep(100)

    UpdateHistory()
    setInterval(UpdateHistory, 60*1000)
}

Main()