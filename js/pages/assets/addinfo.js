function RemoveBTRCreation(ItemDetails){
    const children = ItemDetails.children

    for (let i = 0; i < children.length; i++){
        const child = children[i]

        if (child.children[0].innerText === "Created"){
            child.remove()
            break
        }
    }
}

async function CanUserSeeSales(AssetId){
    const [Success, Result] = await RequestFunc(`https://develop.roblox.com/v1/user/${await GetUserId()}/canmanage/${AssetId}`, "GET", undefined, undefined, true)
    return Success && Result.Success && Result.CanManage
}

async function AddAssetInfo(){
    const SalesEnabled = await IsFeatureEnabled("AddSales")
    const CreationEnabled = await IsFeatureEnabled("AddCreationDate")

    if (!SalesEnabled && !CreationEnabled) {
        return
    }

    const AssetId = GetAssetIdFromURL()
    const [Success, Result] = await RequestFunc(`https://economy.roblox.com/v2/assets/${AssetId}/details`, "GET", undefined, undefined, true)

    if (!Success) return

    const ItemDetails = await WaitForId("item-details")
    RemoveBTRCreation(ItemDetails)

    if (CreationEnabled){
        const CurrentLanguage = getNavigatorLanguages()[0]
        const CurrentDate = new Date(Result.Created)

        ItemDetails.insertBefore(CreateAssetItemFieldContainer("Created", CurrentDate.toLocaleDateString(CurrentLanguage, {month: "short", day: "2-digit", year: "numeric"})), ItemDetails.children[4])
    }
    if (SalesEnabled){
        CanUserSeeSales(AssetId).then(function(CanSee){
            if (CanSee) ItemDetails.insertBefore(CreateAssetItemFieldContainer("Sales", Result.Sales), ItemDetails.children[CreationEnabled && 4 || 3])
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