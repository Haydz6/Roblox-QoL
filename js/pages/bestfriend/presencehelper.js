document.addEventListener("RobloxQoL.GetBestFriendsPresence", async function(e){
    let URL = WebServerEndpoints.BestFriends+"presence"
    if (e.detail){
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