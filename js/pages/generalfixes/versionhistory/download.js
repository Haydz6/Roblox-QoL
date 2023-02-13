function GetPlaceId(){
    return parseInt(window.location.href.split("/places/")[1].split("/")[0])
}

function Download(DownloadURL, FileName) {
    RequestFunc(DownloadURL, "GET", undefined, undefined, false, true).then(async function([Success, _, Response]){
        if (!Success) return

        const blobUrl = URL.createObjectURL(new Blob([await Response.blob()], {type: "application/octet-stream"}))

        const link = document.createElement("a")
        link.setAttribute("download", FileName)
        link.setAttribute("href", blobUrl)
        document.body.append(link)

        link.click()
        link.remove()

        URL.revokeObjectURL(blobUrl)
    })
}
async function GetPlaceName(PlaceId){
    const [Success, Result] = await RequestFunc(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${PlaceId}`, "GET", undefined, undefined, true)

    if (!Success){
        return "UnknownName"
    }

    return Result[0].name
}

async function StartDownloadForVersion(PlaceId, VersionNumber){
    const [Success, Result] = await RequestFunc(`https://assetdelivery.roblox.com/v2/assetId/${PlaceId}/version/${VersionNumber}`, "GET", undefined, undefined, true)
    if (!Success) return

    Download(Result.locations[0].location, `${await GetPlaceName(PlaceId)}-${VersionNumber}.rbxl`)
}