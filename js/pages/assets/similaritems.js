async function CreateSimilarList(Container, AssetId){
    const List = document.createElement("li")
    List.style = "height: 115px; margin-top: 5px; overflow: overlay; display: -webkit-box;"

    const LoadingSpinner = document.createElement("div")
    LoadingSpinner.className = "spinner spinner-default"
    LoadingSpinner.style = "margin-top: 35px;"

    List.appendChild(LoadingSpinner)
    Container.appendChild(List)
    Container.style.display = "grid"

    const [Success, SimilarAssets] = await RequestFunc(WebServerEndpoints.UGC+"similar?id="+AssetId, "GET")

    if (!Success){
        const Label = document.createElement("p")
        Label.style = "margin-top: 35px;"
        Label.innerText = "Failed to load"
        LoadingSpinner.remove()
        return
    }

    if (SimilarAssets.length == 0) {
        List.remove()
        return
    }

    const [ThumbnailSuccess, Thumbnails] = await RequestFunc(`https://thumbnails.roblox.com/v1/assets?assetIds=${SimilarAssets.join(",")}&size=110x110&format=Png&isCircular=false`, "GET", undefined, undefined, true)

    if (!ThumbnailSuccess){
        const Label = document.createElement("p")
        Label.style = "margin-top: 35px;"
        Label.innerText = "Failed to load"
        LoadingSpinner.remove()
        return
    }

    const ThumbnailData = Thumbnails.data

    LoadingSpinner.remove()

    for (let i = 0; i < ThumbnailData.length; i++){
        const ThumbnailResult = ThumbnailData[i]

        const Item = document.createElement("a")
        Item.className = "thumbnail-2d-container item-card-thumb-container"
        Item.style = "height: 90px; width: 90px; padding: 5px; margin-right: 5px;"
        Item.href = `https://roblox.com/catalog/${ThumbnailResult.targetId}/`
        
        const Image = document.createElement("img")
        Image.src = ThumbnailResult.imageUrl
        Image.style = "height: 80px; width: 80px;"

        Item.appendChild(Image)
        List.appendChild(Item)
    }
}

IsFeatureEnabled("ShowSimilarUGCItems").then(async function(Enabled){
    if (!Enabled) return
    const Container = await WaitForClass("item-social-container")
    CreateSimilarList(Container, GetAssetIdFromURL())
    console.log(Container)
})