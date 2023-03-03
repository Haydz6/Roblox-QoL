function RemoveBTRCreation(ItemDetails, Title){
    const children = ItemDetails.children

    for (let i = 0; i < children.length; i++){
        const child = children[i]

        if (child.children.length === 0) continue

        if (child.children[0].innerText === Title){
            child.remove()
            break
        }
    }
}

function GetType(){
    return window.location.href.includes("/game-pass/") && "Gamepass" || "Catalog"
}

function GetGamepassIdFromURL(){
    return parseInt(window.location.href.split("game-pass/")[1].split("/")[0])
}

function GetAssetInfo(Id, Type){
    if (Type == "Catalog") {
        return RequestFunc(`https://economy.roblox.com/v2/assets/${Id}/details`, "GET", undefined, undefined, true)
    } else {
        return RequestFunc(`https://apis.roblox.com/game-passes/v1/game-passes/${Id}/details`, "GET", undefined, undefined, true)
    }
}

async function CanUserSeeSales(Id, Type, Result){
    if (Type == "Catalog"){
        const [Success, Result] = await RequestFunc(`https://develop.roblox.com/v1/user/${await GetUserId()}/canmanage/${Id}`, "GET", undefined, undefined, true)
        return Success && Result.Success && Result.CanManage
    } else {
        const [GameSuccess, Game] = await RequestFunc(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${Result.placeId}`, "GET", undefined, undefined, true)

        if (!GameSuccess){
            return false
        }

        const [Success, ManageResult] = await RequestFunc(`https://develop.roblox.com/v1/universes/multiget/permissions?ids=${Game[0].universeId}`, "GET", undefined, undefined, true)
        const ManageData = ManageResult.data[0]
        return Success && ManageData.canManage && ManageData.canCloudEdit
    }
}

async function AddAssetInfo(){
    const SalesEnabled = await IsFeatureEnabled("AddSales")
    const CreationEnabled = await IsFeatureEnabled("AddCreationDate")

    if (!SalesEnabled && !CreationEnabled) {
        return
    }

    let Id
    const Type = GetType()

    if (Type == "Catalog"){
        Id = GetAssetIdFromURL()
    } else {
        Id = GetGamepassIdFromURL()
    }

    const [Success, Result] = await GetAssetInfo(Id, Type)

    if (!Success) return

    const ItemDetails = await WaitForId("item-details")
    RemoveBTRCreation(ItemDetails, "Created")

    if (Type == "Gamepass"){
        RemoveBTRCreation(ItemDetails, "Updated")
    }

    if (CreationEnabled){
        const CurrentLanguage = getNavigatorLanguages()[0]
        const CreatedDate = new Date(Type == "Gamepass" && Result.createdTimestamp || Result.Created)

        ItemDetails.insertBefore(CreateAssetItemFieldContainer("Created", CreatedDate.toLocaleDateString(CurrentLanguage, {month: "short", day: "2-digit", year: "numeric"})), ItemDetails.children[4])
        
        if (Type == "Gamepass"){
            const UpdatedDate = new Date(Type == "Gamepass" && Result.updatedTimestamp || Result.Updated)

            ItemDetails.insertBefore(CreateAssetItemFieldContainer("Updated", UpdatedDate.toLocaleDateString(CurrentLanguage, {month: "short", day: "2-digit", year: "numeric"})), ItemDetails.children[4])
        }
    }
    if (SalesEnabled){
        CanUserSeeSales(Id, Type, Result).then(function(CanSee){
            if (CanSee) ItemDetails.insertBefore(CreateAssetItemFieldContainer("Sales", Type == "Gamepass" && Result.gamePassSalesData.totalSales || Result.Sales), ItemDetails.children[CreationEnabled && 4 || 3])
        })
    }
}

async function AddAssetUSDPrice(){
    if (!await IsFeatureEnabled("ShowUSDOnAsset")) return

    const PriceContainer = await WaitForClass("price-container-text")
    const RobuxLabel = PriceContainer.getElementsByClassName("text-robux-lg")[0]

    if (!RobuxLabel) return

    const Robux = parseInt(RobuxLabel.innerText.replaceAll(",", ""))

    const PriceLabel = document.createElement("span")
    PriceLabel.className = "text-label"
    PriceLabel.style = "margin-left: 5px; font-weight: 500;"
    PriceLabel.innerText = `($${RobuxToUSD(Robux)})`

    RobuxLabel.appendChild(PriceLabel)
}

AddAssetInfo()
AddAssetUSDPrice()