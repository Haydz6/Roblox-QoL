async function RunRolimonsProfile(){
    const TopHeader = await WaitForClass("details-info")
    const DisplayRap = await IsFeatureEnabled("RapOnProfile")
    const DisplayValue = await IsFeatureEnabled("ValueOnProfile")

    if (!DisplayRap && !DisplayValue) return

    const LimitedIds = []
    const RolimonsURL = `https://www.rolimons.com/player/${GetTargetId()}`

    let RapHeader, RapValue, ValueHeader, ValueValue
    if (DisplayRap){
        [RapHeader, RapValue] = CreateTopHeader("Rap", "...", RolimonsURL)
        TopHeader.appendChild(RapHeader)
    }
    if (DisplayValue){
        [ValueHeader, ValueValue] = CreateTopHeader("Value", "...", RolimonsURL)
        TopHeader.appendChild(ValueHeader)
    }

    const [Success, Public, Limiteds] = await GetUserLimitedInventory(GetTargetId())

    if (Success && Public){
        let TotalRAP = 0

        for (let i = 0; i < Limiteds.length; i++){
            const Limited = Limiteds[i]
            LimitedIds.push(Limited.assetId)
            TotalRAP += Limited.recentAveragePrice
        }
        if (RapValue) RapValue.innerText = numberWithCommas(TotalRAP)

        if (DisplayValue && LimitedIds.length > 0){
            const [Success, Details] = await GetItemDetails(LimitedIds)

            if (Success){
                let TotalValue = 0

                for (let i = 0; i < LimitedIds.length; i++){
                    const AssetId = LimitedIds[i]
                    const Info = Details[AssetId]

                    if (Info) TotalValue += Info.Value
                }
                ValueValue.innerText = numberWithCommas(TotalValue)
            } else {
                ValueValue.innerText = "???"
            }
        } else {
            ValueValue.innerText = "0"
        }
    } else {
        if (RapValue) RapValue.innerText = Public && "???" || "Private"
        if (ValueValue) ValueValue.innerText = Public && "???" || "Private"
    }
}

RunRolimonsProfile()