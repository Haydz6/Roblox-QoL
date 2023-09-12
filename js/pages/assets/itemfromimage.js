async function DoesAssetIdMatchImageId(AssetId, ImageId){
    const [Success, Body, Response] = await RequestFuncCORSBypass(`https://assetdelivery.roblox.com/v1/asset?id=${AssetId}`, "GET", null, null, true, true)
    if (!Success || !Response.ok){
        return false
    }
    
    const Url = Body.split("?id=")[1]?.split("</url>")[0]
    return ImageId == parseInt(Url) ? AssetId : false
}

async function GetItemFromImage(ImageId){
    const Promises = []

    for (let i = ImageId + 1; i < ImageId + 101; i++){
        Promises.push(DoesAssetIdMatchImageId(i, ImageId))
    }

    const Matches = await Promise.all(Promises)
    
    for (let i = 0; i < Matches.length; i++){
        const Match = Matches[i]
        if (Match != false) {
            return Match
        }
    }
}

async function GetLastVariable(){
    const URL = window.location.href
    const Split = URL.split("/")
    if (Split[Split.length-1] == "item"){
        const ImageId = parseInt(Split[Split.length-3] || Split[Split.length-2])
        if (ImageId && !isNaN(ImageId)){
            const AssetId = await GetItemFromImage(ImageId)
            if (AssetId){
                window.location.href = `https://roblox.com/catalog/${AssetId}/`
            }
        }
    }
}
GetLastVariable()