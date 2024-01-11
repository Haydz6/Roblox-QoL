document.addEventListener("RobloxQoL.GetBestFriendInventory", async function(e){
    const [Success, Body] = await RequestFunc(WebServerEndpoints.BestFriends+"presence/eligible?userId="+await GetUserId(), "GET") //userId is not used in the backend but is used to avoid disk caching across accounts
    if (!Success) return document.dispatchEvent(new CustomEvent("RobloxQoL.GetBestFriendInventoryResponse"))

    const [UserId, AssetType, Cursor] = e.detail

    let Eligible = false
    for (let i = 0; i < Body.length; i++){
        if (Body[i] == UserId){
            Eligible = true
            break
        }
    }

    if (!Eligible) return document.dispatchEvent(new CustomEvent("RobloxQoL.GetBestFriendInventoryResponse"))

    let URL = `${WebServerEndpoints.BestFriends}inventory/${UserId}?assetType=${AssetType}&next=${Cursor}`

    try {
        const [_, Body, Response] = await RequestFunc(URL, "GET")

        document.dispatchEvent(new CustomEvent("RobloxQoL.GetBestFriendInventoryResponse", {detail: {ok: Response.ok, status: Response.status, json: Body}}))
    } catch {
        document.dispatchEvent(new CustomEvent("RobloxQoL.GetBestFriendInventoryResponse"))
    }
})

function CallInventoryHelperReady(){
    ChildAdded(document.documentElement, true, function(Script, Disconnect){
        if (Script.id === "injectedscript-bestfriendinventory"){
            Disconnect()
            Script.setAttribute("inventoryhelper-ready", "true")
        }
    })
}
CallInventoryHelperReady()