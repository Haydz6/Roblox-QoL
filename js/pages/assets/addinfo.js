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
    return window.location.href.includes("/game-pass/") && "Gamepass" || window.location.href.includes("/library/") && "Library" || "Catalog"
}

function GetGamepassIdFromURL(){
    return parseInt(window.location.href.split("game-pass/")[1].split("/")[0])
}

function GetAssetInfo(Id, Type){
    if (Type == "Catalog" || Type == "Library") {
        return RequestFunc(`https://economy.roblox.com/v2/assets/${Id}/details`, "GET", undefined, undefined, true)
    } else {
        return RequestFunc(`https://apis.roblox.com/game-passes/v1/game-passes/${Id}/details`, "GET", undefined, undefined, true)
    }
}

async function CanUserSeeSales(Id, Type, Result){
    if (Type == "Catalog" || Type == "Library"){
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

async function GetCreatorOfGroupItem(Info){
    const [Success, Result] = await RequestFuncCORSBypass(`https://assetdelivery.roblox.com/v1/asset?id=${Info.AssetId}`, "GET", undefined, undefined, true, true)

    if (!Success) return

    let FirstLink = Result.split("rbxassetid://")[1]
    if (!FirstLink) FirstLink = Result.split("id=")[1]

    if (!FirstLink) return

    let FullNumber = ""

    for (let i = 0; i < FirstLink.length; i++){
        const Character = FirstLink.charAt(i)

        if (isNumeric(Character)){
            FullNumber += Character
        } else break
    }

    const [InfoSuccess, LinkedInfo] = await GetAssetInfo(FullNumber, "Catalog")

    if (!InfoSuccess) return

    return [`(${LinkedInfo.Creator.CreatorType == "User" && "@" || ""}${LinkedInfo.Creator.Name})`, LinkedInfo.Creator.Id, LinkedInfo.Creator.CreatorType]
}

async function AddAssetInfo(){
    const SalesEnabled = await IsFeatureEnabled("AddSales")
    const CreationEnabled = await IsFeatureEnabled("AddCreationDate")

    if (!SalesEnabled && !CreationEnabled) {
        return
    }

    let Id
    const Type = GetType()

    if (Type == "Catalog" || Type == "Library"){
        Id = GetAssetIdFromURL()
    } else {
        Id = GetGamepassIdFromURL()
    }

    const [Success, Result] = await GetAssetInfo(Id, Type)

    if (!Success) return

    const ItemDetails = await Promise.race([WaitForClass("item-details-section"), WaitForId("item-details")])

    RemoveBTRCreation(ItemDetails, "Created")
    RemoveBTRCreation(ItemDetails, "Sales")
    RemoveBTRCreation(ItemDetails, "Updated")

    if (CreationEnabled){
        const CurrentLanguage = getNavigatorLanguages()[0]
        const CreatedDate = new Date(Type == "Gamepass" && Result.createdTimestamp || Result.Created)

        const CreatedField = CreateAssetItemFieldContainer("Created", CreatedDate.toLocaleDateString(CurrentLanguage, {month: "short", day: "2-digit", year: "numeric"}))
        if (Type == "Gamepass" || Type == "Library") CreatedField.className = "clearfix item-field-container"
        ItemDetails.insertBefore(CreatedField, ItemDetails.children[(Type == "Gamepass" || Type == "Library") && 3 || 2])

        const UpdatedDate = new Date(Type == "Gamepass" && Result.updatedTimestamp || Result.Updated)

        const UpdatedField = CreateAssetItemFieldContainer("Updated", UpdatedDate.toLocaleDateString(CurrentLanguage, {month: "short", day: "2-digit", year: "numeric"}))
        if (Type == "Gamepass" || Type == "Library") UpdatedField.className = "clearfix item-field-container"
        ItemDetails.insertBefore(UpdatedField, ItemDetails.children[(Type == "Gamepass" || Type == "Library") && 3 || 2])
        
        if (Type == "Catalog" && Result.Creator.CreatorType == "Group"){
            GetCreatorOfGroupItem(Result).then(function([Creator, Id, Type]){
                if (!Creator) return

                const CreatorLink = document.createElement("a")
                CreatorLink.className = "text-name"
                CreatorLink.style = "margin-left: 8px;"
                CreatorLink.innerText = Creator
                CreatorLink.href = `https://www.roblox.com/${Type == "User" && "users" || "groups"}/${Id}` + (Type == "User" ? "/profile" : "")

                CreatedField.children[1].appendChild(CreatorLink)
            })
        }
    }
    if (SalesEnabled){
        CanUserSeeSales(Id, Type, Result).then(function(CanSee){
            if (CanSee){
                const SalesField = CreateAssetItemFieldContainer("Sales", numberWithCommas(Type == "Gamepass" && Result.gamePassSalesData.totalSales || Result.Sales))
                if (Type == "Gamepass" || Type == "Library") SalesField.className = "clearfix item-field-container"

                const Index = (Type == "Gamepass" || Type == "Library") && 3 || (CreationEnabled && 2 || 1)
                ItemDetails.insertBefore(SalesField, ItemDetails.children[Index])
            }
        })
    }
}

setTimeout(function(){
    IsFeatureEnabled("ShowUSDOnAsset").then(async function(Enabled){
        if (!Enabled) return

        //const PriceContainer = await WaitForClass("price-container-text")
        const ItemDetails = await Promise.race([WaitForClass("item-details-section"), WaitForId("item-details")])
        // const RobuxLabel = PriceContainer.getElementsByClassName("text-robux-lg")[0]

        ChildAdded(ItemDetails, true, async function(Element){
            const RobuxLabels = Element.getElementsByClassName("text-robux-lg")
            //if (!RobuxLabel) return

            for (let i = 0; i < RobuxLabels.length; i++){
                const RobuxLabel = RobuxLabels[i]

                async function Update(){
                    const Robux = parseInt(RobuxLabel.textContent.replace(/\D/g, ""))
                    if (!isNaN(Robux)) PriceLabel.innerText = `(${await RobuxToCurrency(Robux)})`
                }

                const PriceLabel = document.createElement("span")
                PriceLabel.className = "text-label"
                PriceLabel.style = "margin-left: 5px; font-weight: 500;"

                new MutationObserver(Update).observe(RobuxLabel, {subtree: true, characterData: true})
                Update()

                RobuxLabel.appendChild(PriceLabel)
            }
        })
    })

    AddAssetInfo()
}, 0)