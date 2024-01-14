const BestFriendInventoryScript = document.currentScript

function FetchFromInventoryHelper(UserIds){
    return new Promise(async(resolve) => {
        function OnEvent(e){
            document.removeEventListener("RobloxQoL.GetBestFriendInventoryResponse", OnEvent)
            resolve(e?.detail)
        }

        document.addEventListener("RobloxQoL.GetBestFriendInventoryResponse", OnEvent)

        while (!BestFriendInventoryScript.getAttribute("inventoryhelper-ready")) await new Promise(r => setTimeout(r, 50))
        document.dispatchEvent(new CustomEvent("RobloxQoL.GetBestFriendInventory", {detail: UserIds}))
    })
}

function IsFeatureEnabled(Feature){
    return new Promise(async(resolve) => {
        function OnEvent(e){
            document.removeEventListener("RobloxQoL.IsFeatureEnabledResponse", OnEvent)
            resolve(e?.detail)
        }

        document.addEventListener("RobloxQoL.IsFeatureEnabledResponse", OnEvent)

        document.dispatchEvent(new CustomEvent("RobloxQoL.IsFeatureEnabled", {detail: Feature}))
    })
}

IsFeatureEnabled("BestFriendInventoryV2").then(async function(Enabled){
    if (!Enabled) return
    
    let Cursors = []
    let AssetType

    async function GenerateBody(URL, response){
        let NewAssetType
        let Result

        let RequestType = "inventory"
        const Params = new URLSearchParams(URL.split("?")[1])
        let Cursor = Params.get("cursor")?.replace("oauth_", "") || ""

        if (URL.substring(0, 48) === "https://www.roblox.com/users/inventory/list-json"){

            RequestType = "list-json"

            //https://www.roblox.com/users/inventory/list-json?assetTypeId=24&cursor=&itemsPerPage=100&pageNumber=1&userId=51787703
            NewAssetType = parseInt(Params.get("assetTypeId"))
            Result = await FetchFromInventoryHelper([parseInt(Params.get("userId")), NewAssetType, Cursor])

        } else if (URL.substring(0, 38) === "https://inventory.roblox.com/v2/users/") {

            NewAssetType = URL.split("/inventory/")[1].split("?")[0]
            Result = await FetchFromInventoryHelper([parseInt(URL.split("/users/")[1].split("/")[0]), NewAssetType, Cursor])

        } else {

            const BundleType = parseInt(URL.split("/bundles/")[1].split("?")[0])
            if (BundleType === 1) NewAssetType = 1001
            else if (BundleType === 4) NewAssetType = 1002

            Result = await FetchFromInventoryHelper([parseInt(URL.split("/users/")[1].split("/")[0]), NewAssetType, Cursor])

        }
        
        if (Result && Result.ok){
            let Body = Result.json

            if (NewAssetType !== AssetType){
                AssetType = NewAssetType
                Cursors = []
            }

            if (Body.nextPageCursor) Body.nextPageCursor = "oauth_"+Body.nextPageCursor
            if (Body.previousPageCursor) Body.previousPageCursor = "oauth_"+Body.previousPageCursor
            if (Body.nextPageCursor && !Cursors.includes(Body.nextPageCursor)) Cursors.push(Body.nextPageCursor)

            const Headers = {}
            for (const header of response.headers || response.getAllResponseHeaders().trim().split(/[\r\n]+/)) {
                Headers[header[0]] = header[1]
            }

            //modify body
            if (RequestType === "inventory"){
                const UserId = parseInt(document.head.querySelector("[name~=user-data][data-userid]").getAttribute("data-userid"))
                const ISO = new Date().toISOString()

                const Data = Body.data

                for (let i = 0; i < Data.length; i++){
                    const Item = Data[i]
                    Item.created = ISO
                    Item.updated = ISO

                    Item.owner = {userId: UserId, buildersClubMembershipType: 0, username: "placeholder"}
                    Item.assetName = i.toString()
                }
            } else {
                let ResponseBody = Body
                const Items = []

                Body = {
                    Data: {
                        Start: 0,
                        End: 99,
                        Page: 1,
                        PageType: "inventory",
                        nextPageCursor: ResponseBody.nextPageCursor,
                        previousPageCursor: Cursors[Cursors.length-2],
                        Items: Items
                    },
                    IsValid: true
                }

                const Data = ResponseBody.data
                const AssetIds = []
                const Lookup = {}

                for (let i = 0; i < Data.length; i++){
                    const Item = Data[i]
                    AssetIds.push(Item.assetId)
                    Lookup[Item.assetId] = Item
                }

                if (AssetIds.length > 0){
                    const FetchItems = []
                    for (let i = 0; i < AssetIds.length; i++){
                        FetchItems.push({id: AssetIds[i], itemType: 1})//itemType: ResponseBody.AssetType})
                    }

                    let response
                    let CSRFToken = ""
                    function GetDetails(){
                        return fetch("https://catalog.roblox.com/v1/catalog/items/details", {method: "POST", body: JSON.stringify({items: FetchItems}), headers: {"Content-Type": "application/json", "x-csrf-token": CSRFToken}, credentials: "include"})
                    }

                    response = await GetDetails()
                    if (!response.ok && response.status === 403){
                        CSRFToken = response.headers.get("x-csrf-token")
                        response = await GetDetails()
                    }

                    if (response.ok){
                        const Data = (await response.json()).data

                        for (let i = 0; i < Data.length; i++){
                            const Item = Data[i]

                            Items.push({
                                Creator: {Id: Item.creatorTargetId || 1, Name: Item.creatorName || "Unknown", Type: Item.creatorType || 1, HasVerifiedBadge: Item.creatorHasVerifiedBadge || false, CreatorProfileLink: (Item.creatorType === 1 ? `https://www.roblox.com/users/${Item.creatorTargetId}/profile/` : `https://www.roblox.com/groups/${Item.creatorTargetId}/`) || ""},
                                Item: {
                                    AbsoluteUrl: `https://www.roblox.com/catalog/${Item.id}/`,
                                    AssetId: Item.id,
                                    AssetType: ResponseBody.AssetType,
                                    Name: Item.name
                                },
                                Thumbnail: {
                                    Final: true,
                                    IsApproved: true,
                                    RetryUrl: "",
                                    Url: ""
                                },
                                UserItem: {
                                    CanUserBuyItem: false,
                                    IsItemOwned: false,
                                    ItemOwnedCount: 0,
                                }
                            })
                        }
                    }
                }
            }

            const BodyString = JSON.stringify(Body)

            Headers["content-length"] = BodyString.length
            Headers["content-type"] = "application/json"

            return [new Response(BodyString, {status: 200, statusText: "OK", headers: Headers}), BodyString]
        } else if (!Result || Result.status === 403 || Result.status === 400) {
            if (Roblox?.AssetsExplorerModel) Roblox.AssetsExplorerModel.canViewInventory = false
        }
    }

    InterceptXMLHttpRequest(function(url){
        return url.substring(0, 38) === "https://inventory.roblox.com/v2/users/" || url.substring(0, 48) === "https://www.roblox.com/users/inventory/list-json" || (url.substring(0, 36) == "https://catalog.roblox.com/v1/users/" && url.includes("/bundles/"))
    }, async function(XHR, url){
        if (url.includes("cursor=oauth_")) return GenerateBody(url, XHR)

        if (XHR.status === 403) return GenerateBody(url, XHR)
        else if (url.substring(0, 48) === "https://www.roblox.com/users/inventory/list-json"){
            const Body = JSON.parse(XHR.responseText)
            if (Body?.Data?.End === -1) return GenerateBody(url, XHR)
        }
    })

    const _fetch = fetch.bind(globalThis)
    window.fetch = async function(...args){
        const response = await _fetch(...args)

        //[GenerateBody(response.url, response)] || 

        if (response.url.substring(0, 38) === "https://inventory.roblox.com/v2/users/" || response.url.substring(0, 48) === "https://www.roblox.com/users/inventory/list-json" || (response.url.substring(0, 36) == "https://catalog.roblox.com/v1/users/" && response.url.includes("/bundles/"))){
            if (response.url.includes("cursor=oauth_")) return [GenerateBody(response.url, response)] || response

            if (response.status === 403) return [GenerateBody(response.url, response)] || response
            else if (response.url.substring(0, 48) === "https://www.roblox.com/users/inventory/list-json"){
                const Body = await response.clone().json()
                if (Body?.Data?.End === -1) return [GenerateBody(response.url, response)] || response
            }
        }

        return response
    }

    while (!Roblox?.AssetsExplorerModel) await new Promise(r => setTimeout(r, 0))
    Roblox.AssetsExplorerModel.canViewInventory = true
})