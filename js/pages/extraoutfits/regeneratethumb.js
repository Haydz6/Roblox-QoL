let CachedAvatarRules
let FetchingAvatarRules

function FetchAvatarRules(){
    if (CachedAvatarRules){
        return CachedAvatarRules
    }

    if (FetchingAvatarRules) return FetchingAvatarRules
    FetchingAvatarRules = new Promise(async(resolve) => {
        const [Success, Result] = await RequestFunc("https://avatar.roblox.com/v1/avatar-rules", "GET", null, null, true)
        if (!Success) return resolve()

        const PaletteLookup = {}
        const Palette = Result.bodyColorsPalette
    
        for (let i = 0; i < Palette.length; i++){
            const Color = Palette[i]
            PaletteLookup[Color.brickColorId] = Color.hexColor
        }
        Result.bodyColorIdToHex = PaletteLookup

        CachedAvatarRules = Result
        resolve(Result)
    })
    return FetchingAvatarRules
}

async function RegenerateExtraOutfitThumbnail(Id){
    const AvatarRules = await FetchAvatarRules()
    if (!AvatarRules) return

    const [OutfitSuccess, OutfitInfo] = await GetExtraOutfit(Id)
    if (!OutfitSuccess) return

    const bodyColors = {}
    for ([k, v] of Object.entries(OutfitInfo.bodyColors)){
        bodyColors[k.slice(0, -2)] = AvatarRules.bodyColorIdToHex[v]
    }

    const assets = []
    for (let i = 0; i < OutfitInfo.assets.length; i++){
        assets.push({id: OutfitInfo.assets[i]})
    }

    if (OutfitInfo.assetsMeta){
        for (let i = 0; i < OutfitInfo.assetsMeta.length; i++){
            const Asset = OutfitInfo.assetsMeta[i]
            assets.push({id: Asset.assetId, meta: {order: Asset.order, puffiness: Asset.puffiness || 0, version: Asset.version}})
        }
    }

    const thumbnailConfig = {
        thumbnailId: 1,
        thumbnailType: "2d",
        size: "150x150"
    }
    const avatarDefinition = {
        assets: assets,
        bodyColors: bodyColors,
        scales: OutfitInfo.scales,
        playerAvatarType: {playerAvatarType: OutfitInfo.rigType}
    }

    const Config = {thumbnailConfig: thumbnailConfig, avatarDefinition: avatarDefinition} //thanks jullian
    while (true) {
        const [Success, Result] = await RequestFunc("https://avatar.roblox.com/v1/avatar/render", "POST", {"Content-Type": "application/json"}, JSON.stringify(Config), true)
        if (!Success) return
        if (Result.state === "Pending"){
            await sleep(2000)
            continue
        }

        if (Result.imageUrl && Result.state == "Completed") RequestFunc(WebServerEndpoints.Outfits+"image", "PUT", {"Content-Type": "application/json"}, JSON.stringify({Id: Id, URL: Result.imageUrl}))
        return Result.imageUrl
    }
}

// https://avatar.roblox.com/v1/avatar/render
// export type RenderThumbnailConfig = {
//     thumbnailId: number;
//     thumbnailType: "2d" | "3d";
//     size: string;
// };

// export type RenderAvatarDefinitionAsset = {
//     id: number;
//     meta?: {
//         order: number;
//         puffiness: number;
//         version: number;
//     };
// };

// export type RenderAvatarDefinitionBodyColors = {
//     headColor: string;
//     torsoColor: string;
//     rightArmColor: string;
//     leftArmColor: string;
//     rightLegColor: string;
//     leftLegColor: string;
// };

// export type RenderAvatarDefinitionScales = {
//     height: number;
//     width: number;
//     head: number;
//     depth: number;
//     proportion: number;
//     bodyType: number;
// };

// export type AvatarType = "R6" | "R15";

// export type RenderAvatarDefinitionAvatarType = {
//     playerAvatarType: AvatarType;
// };

// export type RenderAvatarDefinition = {
//     assets: RenderAvatarDefinitionAsset[];
//     bodyColors: RenderAvatarDefinitionBodyColors;
//     scales: RenderAvatarDefinitionScales;
//     playerAvatarType: RenderAvatarDefinitionAvatarType;
// };

// export type RenderAvatarRequest = {
//     thumbnailConfig: RenderThumbnailConfig;
//     avatarDefinition: RenderAvatarDefinition;
// };