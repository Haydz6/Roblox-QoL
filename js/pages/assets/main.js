async function GetAssetType(Id){
    const [Success, Result] = await RequestFunc(`https://economy.roblox.com/v2/assets/${Id}/details`)

    if (!Success){
        return 0
    }

    return Result.AssetTypeId
}

function GetAssetIdFromURL(){
    const URL = window.location.href
    let URLWithID = URL.split("library/")[1]

    if (!URLWithID) URLWithID = URL.split("catalog/")[1]
    if (!URLWithID) URLWithID = URL.split("bundles/")[1]

    return parseInt(URLWithID.split("/")[0])
}

function GetFileTypeFromAsset(AssetTypeId) {
	switch(AssetTypeId) {
        case 1:
            return "png"
        case 3:
            return "mp3"
        case 4: return "mesh"
        case 63: return "xml"
        case 9: return "rbxl"
        default: return "rbxm"
	}
}

setTimeout(function(){
    IsFeatureEnabled("ExploreAsset").then(async function(Enabled){
        if (!Enabled) return

        const AssetId = GetAssetIdFromURL()

        const ButtonsList = await WaitForId("item-context-menu")
        ButtonsList.tagName = "li"
        ButtonsList.className = "asset-list"

        const FirstButton = ButtonsList.getElementsByTagName("button")[0]
        FirstButton.style = "position: relative!important;"

        let LastButton = FirstButton
        const BTRExplorerButton = FindFirstClass("btr-explorer-button-container")

        if (BTRExplorerButton){
            const Button = CreateAssetButton()
            Button.tagName = "div"
            Button.style = "z-index: 1;"
            BTRExplorerButton.style = "z-index: 2;"
            ButtonsList.insertBefore(Button, LastButton)
            LastButton = Button
        }

        const AssetType = await GetAssetType(AssetId)
        if (ButtonsList.getElementsByClassName("btr-download-button-container").length === 0){
            DownloadButton = CreateAssetButton(chrome.runtime.getURL("img/assets/DownloadIcon.png"))
            //DownloadButton.href = `https://assetdelivery.roblox.com/v1/asset?id=${AssetId}`

            DownloadButton.addEventListener("click", async function(){
                const Headers = {}
                if (AssetType === 3) Headers["Roblox-Browser-Asset-Request"] = "true"

                const [Success, Result] = await RequestFunc(`https://assetdelivery.roblox.com/v2/asset?id=${AssetId}`, "GET", Headers, undefined, true)
                if (!Success) return
                
                const Location = Result?.locations?.[0]?.location
                if (!Location) return

                Download(Location, `${AssetId}.${GetFileTypeFromAsset(AssetType)}`)
            })

            ButtonsList.insertBefore(DownloadButton, LastButton)
            LastButton = DownloadButton
        }

        if (ButtonsList.getElementsByClassName("btr-content-button").length === 0){
            if (AssetType === 13){
                const Response = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${AssetId}`, {method: "GET"})

                if (Response.ok){
                    const ImageButton = CreateAssetButton(chrome.runtime.getURL("img/assets/ImageIcon.png"))
                    ImageButton.href = `https://www.roblox.com/catalog/${(await Response.text()).match("<url>([^|]*)</url>")[1].toString().replace(/\D/g, "")}/`
                    ButtonsList.insertBefore(ImageButton, LastButton)
                    LastButton = ImageButton
                }
            }
        }
    })
}, 0)