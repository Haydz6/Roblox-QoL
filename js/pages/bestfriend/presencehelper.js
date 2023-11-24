document.addEventListener("RobloxQoL.GetBestFriendsPresence", async function(e){
    const [Success, Body] = await RequestFunc(WebServerEndpoints.BestFriends+"presence/eligible?userId="+await GetUserId(), "GET") //userId is not used in the backend but is used to avoid disk caching across accounts
    if (!Success) return document.dispatchEvent(new CustomEvent("RobloxQoL.GetBestFriendsPresenceResponse"))

    const Lookup = {}
    for (let i = 0; i < Body.length; i++){
        Lookup[Body[i]] = true
    }

    let Eligible = false
    for (let i = 0; i < e.detail.length; i++){
        if (Lookup[e.detail[i]]){
            Eligible = true
            break
        }
    }
    if (!Eligible) return document.dispatchEvent(new CustomEvent("RobloxQoL.GetBestFriendsPresenceResponse"))

    let URL = WebServerEndpoints.BestFriends+"presence"
    if (e.detail.length === 1){
        URL += "/"+e.detail
    }

    try {
        const [_, Body, Response] = await RequestFunc(URL, "GET")

        document.dispatchEvent(new CustomEvent("RobloxQoL.GetBestFriendsPresenceResponse", {detail: {ok: Response.ok, json: Body}}))
    } catch {
        document.dispatchEvent(new CustomEvent("RobloxQoL.GetBestFriendsPresenceResponse"))
    }
})

function CallPresenceHelperReady(){
    ChildAdded(document.documentElement, true, function(Script, Disconnect){
        if (Script.id === "injectedscript-bestfriendpresence"){
            Disconnect()
            Script.setAttribute("presencehelper-ready", "true")
        }
    })
}
CallPresenceHelperReady()