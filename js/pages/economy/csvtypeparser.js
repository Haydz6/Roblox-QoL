async function ParseCSVSalesOfGoods(AllItems, Type, CurrentCache, Cache){
    let Places

    await AddPlaceIds(AllItems)
    if (CurrentCache[0] != Cache) return

    if (Type == "Asset" || Type == "Place"){
        const Map = {}
        const Assets = []

        const ToRead = AllItems

        for (let i = 0; i < ToRead.length; i++){
            const Info = ToRead[i]
            const Id = Type == "Place" && Info?.details?.place?.universeId || Info.details.id || Info?.details?.place?.universeId

            if (!Map[Id]){
                let IsPlace = Type == "Place" && Info?.details?.place

                if (!IsPlace && Info.details.id == null){
                    IsPlace = Info?.details?.place
                }
                if (!IsPlace && Type == "Asset" && Info?.details?.type == "Place"){
                    IsPlace = Info?.details?.place
                }

                if (Type == "Place" && isNaN(Info?.details?.place?.universeId)){
                    continue
                }

                const Asset = {Type: IsPlace && "Place" || Info?.details?.type == "GamePass" && "GamePass" || Info?.details?.type == "DeveloperProduct" && "DeveloperProduct" || "Asset", Name: IsPlace?.name && `${IsPlace.name}${Type == "Asset" && " (Private Servers)" || ""}` || Info.details.name, Id: Id, Robux: 0, Place: IsPlace}
                
                Assets.push(Asset)
                Map[Id] = Asset
            }

            Map[Id].Robux += Info.currency.amount
        }

        Places = Assets
    } else if (Type == "User"){
        const Map = {}
        const Assets = []

        const ToRead = AllItems

        for (let i = 0; i < ToRead.length; i++){
            const Info = ToRead[i]
            const Id = Info.agent.id

            if (!Map[Id]){
                const Asset = {Type: "User", Name: Info.agent.name, Id: Id, Robux: 0}
                Assets.push(Asset)
                Map[Id] = Asset
            }

            Map[Id].Robux += Info.currency.amount
        }

        Places = Assets
    }

    if (CurrentCache[0] != Cache) return
    await AddIcons(Places)

    return Places
}