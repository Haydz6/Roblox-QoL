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

    return parseInt(URLWithID.split("/")[0])
}

async function Main(){
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

    if (ButtonsList.getElementsByClassName("btr-download-button-container").length === 0){
        DownloadButton = CreateAssetButton(chrome.runtime.getURL("img/assets/DownloadIcon.png"))
        DownloadButton.href = `https://assetdelivery.roblox.com/v1/asset?id=${AssetId}`
        ButtonsList.insertBefore(DownloadButton, LastButton)
        LastButton = DownloadButton
    }

    if (ButtonsList.getElementsByClassName("btr-content-button").length === 0){
        if (await GetAssetType(AssetId) === 13){
            const Response = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${AssetId}`, {method: "GET"})

            if (Response.ok){
                const ImageButton = CreateAssetButton(chrome.runtime.getURL("img/assets/ImageIcon.png"))
                ImageButton.href = `https://www.roblox.com/catalog/${(await Response.text()).match("<url>([^|]*)</url>")[1].toString().replace(/\D/g, "")}/`
                ButtonsList.insertBefore(ImageButton, LastButton)
                LastButton = ImageButton
            }
        }
    }
}

IsFeatureEnabled("ExploreAsset").then(function(Enabled){
    if (Enabled){
        Main()
    }
})