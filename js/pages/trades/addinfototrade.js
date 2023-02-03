async function WatchNewTradeUsername(TradeData){
    const TradesHeader = TradeData.getElementsByClassName("trades-header-nowrap font-title")[0]
    let TitleHeader

    console.log(TradesHeader)

    while (!TitleHeader){
        TitleHeader = TradesHeader.getElementsByClassName("paired-name")[0]
        await sleep(20)
    }

    async function NewTradeUsername(Title){
        console.log(Title)
        if (Title.nodeType !== Node.ELEMENT_NODE) return

        while (Title.parentElement.getElementsByTagName("span").length < 3) await sleep(20)

        const Username = Title.parentElement.getElementsByTagName("span")[2]
        let UserId

        while (!UserId){
            UserId = TradeData.getAttribute("userid")
            await sleep(20)
        }

        console.log(Username.children.length)
        if (Username.children.length > 0) return

        const LinkIcon = CreateLinkIcon(`https://www.rolimons.com/player/${UserId}`)
        LinkIcon.style = "width: 30px!important;"

        Username.appendChild(LinkIcon)
    }

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const addedNodes = Mutation.addedNodes

            for (let i = 0; i < addedNodes.length; i++){
                NewTradeUsername(addedNodes[i])
            }
        })
    }).observe(TitleHeader, {childList: true})

    const children = TitleHeader.children

    for (let i = 0; i < children.length; i++){
        NewTradeUsername(children[i])
    }
}

async function TradeDataAdded(TradeData){
    WatchNewTradeUsername(TradeData)
    const OffersContainer = TradeData.getElementsByClassName("col-xs-12")[0]

    function CheckIfTwoOffers(){
        const BothOffers = OffersContainer.children

        if (BothOffers.length < 2) return

        let OffersFound = []

        for (let i = 0; i < BothOffers.length; i++){
            if (BothOffers[i].className.search("offer-loaded") > -1){
                return
            }

            if (BothOffers[i].className.search("trade-list-detail-offer") > -1){
                OffersFound.push(BothOffers[i])
            }
        }
        
        if (OffersFound.length < 2) return

        for (let i = 0; i < BothOffers.length; i++){
            BothOffers[i].className += " offer-loaded"
        }

        OffersAdded(BothOffers)
    }

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return
            CheckIfTwoOffers()
        })
    }).observe(OffersContainer, {childList: true})

    CheckIfTwoOffers()
}

async function OffersAdded(BothOffers){
    const TotalValue = {Ours: 0, Other: 0}
    const Demands = {Ours: [], Other: []}

    const ValueElements = []
    const AssetIds = []
    const OfferAssetIds = {Ours: [], Other: []}
    const RolimonsLabel = {Ours: {}, Other: {}}

    let Result

    for (let i = 0; i < BothOffers.length; i++){
        const Offer = BothOffers[i]
        const Type = i === 0 && "Ours" || "Other"
        const TypeAssetIds = OfferAssetIds[Type]

        const Assets = Offer.getElementsByTagName("li")

        for (let o = 0; o < Assets.length; o++){
            const ItemCardContainer = Assets[o].children[0].children[0]

            const Caption = ItemCardContainer.getElementsByClassName("item-card-caption")[0]
            const AssetId = parseInt(Caption.getElementsByTagName("a")[0].href.split("catalog/")[1].split("/")[0])

            const [ValueDiv, CurrencyLabel] = CreateValueCardLabel()

            Caption.appendChild(ValueDiv)

            AssetIds.push(AssetId)
            TypeAssetIds.push(AssetId)

            ValueDiv.appendChild(CreateLinkIcon(`https://www.rolimons.com/item/${AssetId}`))

            let CategoryCardLabel = CreateCategoriesCardLabel()
            Caption.appendChild(CategoryCardLabel)

            ValueElements.push({AssetId: AssetId, Label: CurrencyLabel, Type: Type, CategoryCardLabel: CategoryCardLabel})
        }

        const LineLabels = Offer.children[Offer.children.length-1]

        const [ValueLine, ValueLabel] = CreateRobuxLineLabel("Rolimons Value:", "...")
        const [DemandLine, DemandLabel] = CreateRobuxLineLabel("Rolimons Demand:", ".../5.0")

        RolimonsLabel[Type].Demand = DemandLabel
        RolimonsLabel[Type].Value = ValueLabel
        RolimonsLabel[Type].Line = LineLabels

        LineLabels.append(ValueLine, DemandLine)
    }

    if (AssetIds.length > 0){
        [Success, Result] = await GetItemDetails(AssetIds)
    }

    if (Result){
        let AreResultsValid = true

        for (let i = 0; i < ValueElements.length; i++){
            const ValueElement = ValueElements[i]
            const Details = Result[ValueElement.AssetId]

            const Value = Details?.Value
            const Demand = Details?.Demand

            if (!Value) AreResultsValid = false
            else TotalValue[ValueElement.Type] += Value

            if (Demand) Demands[ValueElement.Type].push(Demand)
            else AreResultsValid = false

            ValueElement.Label.innerText = Value && numberWithCommas(Value) || "???"

            if (Details?.Rare){
                const CategoryIcon = CreateCategoryIcon("Rare", chrome.runtime.getURL("img/trades/rare.svg"))
                CategoryIcon.style = "height: 16px; margin-left: 0px!important; margin-right: 4px!important;"
                ValueElement.CategoryCardLabel.appendChild(CategoryIcon)
            }
            if (Details?.Projected){
                const CategoryIcon = CreateCategoryIcon("Projected", chrome.runtime.getURL("img/trades/projected.svg"))
                CategoryIcon.style = "height: 16px; margin-left: 0px!important; margin-right: 4px!important;"
                ValueElement.CategoryCardLabel.appendChild(CategoryIcon)
            }
            if (Details?.Hyped){
                const CategoryIcon = CreateCategoryIcon("Hyped", chrome.runtime.getURL("img/trades/hyped.svg"))
                CategoryIcon.style = "height: 16px; margin-left: 0px!important; margin-right: 4px!important;"
                ValueElement.CategoryCardLabel.appendChild(CategoryIcon)
            }
        }

        for (let i = 0; i < 2; i++){
            const Type = i === 0 && "Ours" || "Other"
            const Labels = RolimonsLabel[Type]
            const AssetIds = OfferAssetIds[Type]

            console.log(Type, AssetIds)
            console.log(AreResultsValid && numberWithCommas(CalcuateValueWithDuplicates(AssetIds, Result)) || "???")

            Labels.Value.innerText = AreResultsValid && numberWithCommas(CalcuateValueWithDuplicates(AssetIds, Result)) || "???"
            Labels.Demand.innerText = `${AreResultsValid && CalcuateDemandAverageWithDuplicates(AssetIds, Result) || "???"}/5.0`
        }

        const Divider = BothOffers[1].getElementsByClassName("rbx-divider")[0]
        Divider.style = "overflow: unset; position: relative;"

        const GainList = CreateGainList()

        if (AreResultsValid){
            const ValueNet = TotalValue.Other - TotalValue.Ours
            const ValueList = CreateGain(ValueNet, numberWithCommas(ValueNet), `${ValueNet >= 0 && "+" || "-"}${Math.abs(Math.floor((TotalValue.Other - TotalValue.Ours)/TotalValue.Ours * 100))}%`, "icon icon-rolimons-20x20")
            GainList.appendChild(ValueList)
        }

        const OurOffered = parseInt(RolimonsLabel.Ours.Line.children[0].children[1].getElementsByClassName("text-label robux-line-value ng-binding")[0].innerText.replaceAll(",", ""))
        const OtherOffered = parseInt(RolimonsLabel.Other.Line.children[0].children[1].getElementsByClassName("text-label robux-line-value ng-binding")[0].innerText.replaceAll(",", ""))
        const OurRap = parseInt(RolimonsLabel.Ours.Line.children[1].children[1].getElementsByClassName("text-robux-lg robux-line-value ng-binding")[0].innerText.replaceAll(",", "")) - OurOffered
        const OtherRap = parseInt(RolimonsLabel.Other.Line.children[1].children[1].getElementsByClassName("text-robux-lg robux-line-value ng-binding")[0].innerText.replaceAll(",", "")) - OtherOffered

        const RapNet = OtherRap - OurRap
        //const RapList = CreateGain(RapNet, `${RapNet < 0 && "-" || ""}${RapNet}${(OurOffered > 0 || OtherOffered > 0) && `${OfferedNet >= 0 && " +" || " -"} ${Math.abs(OfferedNet)}` || ""}`, `${RapNet >= 0 && "+" || "-"}${Math.abs(Math.floor((OtherRap - OurRap)/OurRap * 100))}%`, "icon icon-robux-16x16")
        const RapList = CreateGain(RapNet, numberWithCommas(RapNet), `${RapNet >= 0 && "+" || "-"}${Math.abs(Math.floor((OtherRap - OurRap)/OurRap * 100))}%`, "icon icon-robux-16x16")
        GainList.appendChild(RapList)

        if (OurOffered > 0 || OtherOffered > 0){
            const OfferedNet = OtherOffered - OurOffered
            const RapList = CreateGain(OfferedNet, numberWithCommas(OfferedNet), undefined, "icon icon-offer-20x20")
            GainList.appendChild(RapList)
        }

        Divider.appendChild(GainList)
    }
}

async function Main(){
    const TradeListDetails = await WaitForClass("col-xs-12 col-sm-8 trades-list-detail")
    
    const children = TradeListDetails.children

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const addedNodes = Mutation.addedNodes

            for (let i = 0; i < addedNodes.length; i++){
                if (addedNodes[i].nodeType === Node.ELEMENT_NODE) TradeDataAdded(addedNodes[i]) 
            }
        })
    }).observe(TradeListDetails, {childList: true})

    for (let i = 0; i < children.length; i++){
        if (children[i].nodeType === Node.ELEMENT_NODE) TradeDataAdded(children[i])
    }
}

Main()