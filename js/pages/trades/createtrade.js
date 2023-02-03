function GetUserIdFromTradeWithURL(){
    return parseInt(window.location.href.split("users/")[1].split("/")[0])
}

async function AddLinkToName(){
    const TradeHeader = await WaitForClass("trades-header-nowrap")

    let Titles = TradeHeader.getElementsByClassName("paired-name")[0]
    while (Titles.children < 3) await sleep(20)

    const LinkIcon = CreateLinkIcon(`https://www.rolimons.com/player/${GetUserIdFromTradeWithURL()}`)
    LinkIcon.style = "width: 30px;"
    Titles.children[2].appendChild(LinkIcon)
}

async function NewAsset(Asset){
    if (Asset.nodeType !== Node.ELEMENT_NODE || Asset.tagName.toLowerCase() !== "li") return
    Asset.style = "margin-bottom: 0px!important; height: 250px!important;"

    const ItemCardContainer = Asset.children[0].children[0]

    const Caption = ItemCardContainer.getElementsByClassName("item-card-caption")[0]
    const AssetId = parseInt(Caption.getElementsByTagName("a")[0].href.split("catalog/")[1].split("/")[0])

    const [ValueDiv, CurrencyLabel] = CreateValueCardLabel()

    Caption.appendChild(ValueDiv)
    ValueDiv.appendChild(CreateLinkIcon(`https://www.rolimons.com/item/${AssetId}`))

    let CategoryCardLabel = CreateCategoriesCardLabel()
    Caption.appendChild(CategoryCardLabel)

    QueueForItemDetails(AssetId).then(function([Success, Details]){
        CurrencyLabel.innerText = Success && numberWithCommas(Details.Value) || "???"

        if (Details?.Rare){
            const CategoryIcon = CreateCategoryIcon("Rare", chrome.runtime.getURL("img/trades/rare.svg"))
            CategoryIcon.style = "height: 16px; margin-left: 0px!important; margin-right: 4px!important;"
            CategoryCardLabel.appendChild(CategoryIcon)
        }
        if (Details?.Projected){
            const CategoryIcon = CreateCategoryIcon("Projected", chrome.runtime.getURL("img/trades/projected.svg"))
            CategoryIcon.style = "height: 16px; margin-left: 0px!important; margin-right: 4px!important;"
            CategoryCardLabel.appendChild(CategoryIcon)
        }
        if (Details?.Hyped){
            const CategoryIcon = CreateCategoryIcon("Hyped", chrome.runtime.getURL("img/trades/hyped.svg"))
            CategoryIcon.style = "height: 16px; margin-left: 0px!important; margin-right: 4px!important;"
            ValueElement.CategoryCardLabel.appendChild(CategoryIcon)
        }
    })
}

function NewOfferAsset(Asset, AddToValue, AddToRap, AddDemand){
    if (Asset.nodeType !== Node.ELEMENT_NODE || Asset.tagName.toLowerCase() !== "div" || Asset.children.length === 0) return

    const Thumbnail2D = Asset.getElementsByTagName("thumbnail-2d")[0]
    if (!Thumbnail2D) return

    const AssetId = parseInt(Thumbnail2D.getElementsByTagName("span")[0].getAttribute("thumbnail-target-id"))
    const [ValueDiv, CurrencyLabel] = CreateValueCardLabel("item-value custom ng-scope")

    Asset.appendChild(ValueDiv)
    AddToValue()

    QueueForItemDetails(AssetId).then(function([Success, Details]){
        CurrencyLabel.innerText = Success && numberWithCommas(Details.Value) || "???"

        const RapElement = Asset.getElementsByClassName("item-value ng-scope")[0]
        let Rap = false

        if (RapElement){
            const RapLabel = RapElement.getElementsByClassName("text-robux ng-binding")[0]
            if (RapLabel) Rap = parseInt(RapLabel.innerText.replaceAll(",", ""))
        }

        console.log(Success, Rap)

        if (Success && Asset.parentElement.parentElement){
            AddToValue(Details.Value)
            AddToRap(Rap)
            AddDemand(Details.Demand)

            let CategoryCardLabel = CreateCategoriesCardLabel()
            Asset.appendChild(CategoryCardLabel)
            CategoryCardLabel.style = "display: inline-flex !important; margin-left: 10px;"

            if (Details?.Rare){
                const CategoryIcon = CreateCategoryIcon("Rare", chrome.runtime.getURL("img/trades/rare.svg"))
                CategoryIcon.style = "height: 16px; margin-left: 0px!important; margin-right: 4px!important;"
                CategoryCardLabel.appendChild(CategoryIcon)
            }
            if (Details?.Projected){
                const CategoryIcon = CreateCategoryIcon("Projected", chrome.runtime.getURL("img/trades/projected.svg"))
                CategoryIcon.style = "height: 16px; margin-left: 0px!important; margin-right: 4px!important;"
                CategoryCardLabel.appendChild(CategoryIcon)
            }
            if (Details?.Hyped){
                const CategoryIcon = CreateCategoryIcon("Hyped", chrome.runtime.getURL("img/trades/hyped.svg"))
                CategoryIcon.style = "height: 16px; margin-left: 0px!important; margin-right: 4px!important;"
                CategoryCardLabel.appendChild(CategoryIcon)
            }
        } else if (!Success) {
            AddToValue(false)
            AddToDemand(false)
            AddToRap(false)
        }
    })
}

function NewOfferSummary(Summary, AddToValue, AddToRap, AddDemand){
    if (Summary.nodeType !== Node.ELEMENT_NODE || Summary.tagName.toLowerCase() !== "div") return

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const addedNodes = Mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++){
                NewOfferAsset(addedNodes[i], AddToValue, AddToRap, AddDemand)
            }
        })
    }).observe(Summary, {childList: true})

    const children = Summary.children

    for (let i = 0; i < children.length; i++){
        NewOfferAsset(children[i], AddToValue, AddToRap, AddDemand)
    }
}

async function AddValuesToOffer(Offer){
    if (Offer.nodeType !== Node.ELEMENT_NODE || Offer.tagName.toLowerCase() !== "div") return

    const CardsList = Offer.getElementsByClassName("hlist item-cards item-cards-stackable")[0]

    if (!CardsList) return

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const addedNodes = Mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++){
                NewAsset(addedNodes[i])
            }
        })
    }).observe(CardsList, {childList: true})

    const children = CardsList.children

    for (let i = 0; i < children.length; i++){
        NewAsset(children[i])
    }
}

async function ListenToOffers(){
    const Offers = await WaitForClass("inventory-panel-holder")

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const addedNodes = Mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++){
                AddValuesToOffer(addedNodes[i])
            }
        })
    }).observe(Offers, {childList: true})

    const children = Offers.children

    for (let i = 0; i < children.length; i++){
        AddValuesToOffer(children[i])
    }
}

async function ListenToSummaryOffers(Offers, Update){
    if (Offers.nodeType !== Node.ELEMENT_NODE || Offers.className.search("trade-request-window-offer") === -1) return
    const [ValueLine, ValueValue] = CreateRobuxLineLabel("Rolimons Value:", "0")
    const [DemandLine, DemandValue] = CreateRobuxLineLabel("Rolimons Demand:", "0.0/5.0")
    Offers.append(ValueLine, DemandLine)

    let TotalValue = 0
    let TotalRap = 0
    let TotalDonated = 0
    let Demands = []

    async function CheckForRobuxLine(RobuxLine){
        if (RobuxLine.nodeType !== Node.ELEMENT_NODE || RobuxLine.className.search("robux-line") === -1 || RobuxLine.getElementsByClassName("text-secondary").length === 0) return

        let RobuxLineValue

        while (!RobuxLineValue){
            await sleep(20)
            RobuxLineValue = RobuxLine.getElementsByClassName("robux-line-value")[0]
        }

        function Update(){
            SetDonated(parseInt(RobuxLineValue.innerText.replaceAll(",", "")))
        }

        new MutationObserver(function(Mutations){
            Mutations.forEach(function(Mutation){
                if (Mutation.type !== "characterData") return
                Update()
            })
        }).observe(RobuxLineValue, {characterData: true, subtree: true})

        Update()
    }

    function SetDonated(Donated){
        TotalDonated = Donated
        Update(Offers, TotalRap, TotalValue, TotalDonated)
    }

    function AddToValue(Value){
        if (!Value){
            if (Value === false){
                TotalValue = -1
            }

            ValueValue.innerText = "..."
            return
        }

        TotalValue += Value
        ValueValue.innerText = numberWithCommas(TotalValue)
        Update(Offers, TotalRap, TotalValue, TotalDonated)
    }

    function AddToRap(Rap){
        if (!Rap){
            if (Rap === false){
                TotalRap = -1
            }

            return
        }

        TotalRap += Rap
        Update(Offers, TotalRap, TotalValue, TotalDonated)
    }

    function AddDemand(Demand){
        if (!Demand){
            if (Demand === false){
                Demands = [-2]
            }

            DemandValue.innerText = ".../5.0"
            return
        }
        if (Demands.includes(-2)){
            DemandValue.innerText = "???/5.0"
            return
        }

        Demands.push(Demand)

        let Average = Math.floor(((Demands.reduce((partialSum, a) => partialSum + a, 0)/Demands.length)+1)*10)/10
        if (Math.floor(Average) === Average) Average = `${Average}.0`

        DemandValue.innerText = `${Average}/5.0`
    }

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            if (Mutation.removedNodes){
                AddToValue(-TotalValue)
                AddToRap(-TotalRap)
                Demands = []
                AddDemand()
            }

            const addedNodes = Mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++){
                NewOfferSummary(addedNodes[i], AddToValue, AddToRap, AddDemand)
                CheckForRobuxLine(addedNodes[i])
            }
        })
    }).observe(Offers, {childList: true})

    const children = Offers.children

    for (let i = 0; i < children.length; i++){
        NewOfferSummary(children[i], AddToValue, AddToRap, AddDemand)
        CheckForRobuxLine(children[i])
    }
}

async function ListenForNewSummaryOffer(){
    const Offers = await WaitForClass("trade-request-window-offers")

    const Divider = document.createElement("div")
    Divider.className = "rbx-divider"
    Divider.style = "margin: 54px 0px; overflow: unset; position: relative;"

    const TotalValue = {Ours: 0, Other: 0}
    const TotalRap = {Ours: 0, Other: 0}
    const TotalDonated = {Ours: 0, Other: 0}

    const GainList = CreateGainList()
    const [ValueList, UpdateValue] = CreateGain(0, "0", "+0%", "icon icon-rolimons-20x20", true)
    const [RapList, UpdateRap] = CreateGain(0, "0", "+0%", "icon icon-robux-16x16", true)
    const [DonatedList, UpdateDonated] = CreateGain(0, "0", undefined, "icon icon-offer-20x20", true)
    GainList.append(ValueList, RapList, DonatedList)
    Divider.appendChild(GainList)

    DonatedList.style.display = "none"

    function CalcuatePercentage(First, Second){
        const Percentage = Math.floor((First - Second)/Second * 100)
        return isNaN(Percentage) && 0 || Percentage
    }

    function IsTypeValid(Type){
        return TotalValue[Type] > -1 && TotalRap[Type] > -1 && TotalDonated[Type] > -1
    }

    function Update(Offer, NewRap, NewValue, NewDonated){
        const Type = Offer == Offers.children[0] && "Ours" || "Other"
        TotalValue[Type] = NewValue
        TotalRap[Type] = NewRap
        TotalDonated[Type] = NewDonated

        const ValueNet = TotalValue.Other - TotalValue.Ours
        const RapNet = TotalRap.Other - TotalRap.Ours
        const DonatedNet = TotalDonated.Other - TotalDonated.Ours

        let IsValid = IsTypeValid("Ours") && IsTypeValid("Other")

        if (IsValid){
            UpdateValue(ValueNet, numberWithCommas(ValueNet), `${ValueNet >= 0 && "+" || "-"}${Math.abs(CalcuatePercentage(TotalValue.Other, TotalValue.Ours))}%`)
            UpdateRap(RapNet, numberWithCommas(RapNet), `${RapNet >= 0 && "+" || "-"}${Math.abs(CalcuatePercentage(TotalRap.Other, TotalRap.Ours))}%`)
            UpdateDonated(DonatedNet, numberWithCommas(DonatedNet), `${DonatedNet >= 0 && "+" || "-"}`)
            if (TotalDonated.Other === 0 && TotalDonated.Ours === 0) DonatedList.style.display = "none"
            else DonatedList.style.display = ""
        } else {
            UpdateValue(0, "???", "0%")
            UpdateRap(0, "???", "0%")
            UpdateDonated(0, "???")
        }
    }

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const addedNodes = Mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++){
                ListenToSummaryOffers(addedNodes[i], Update)

                // if (Offers.children.length >= 2){
                //     Offers.insertBefore(Divider, Offers.children[1])
                // }
            }
        })
    }).observe(Offers, {childList: true})

    const children = Offers.children

    for (let i = 0; i < children.length; i++){
        ListenToSummaryOffers(children[i], Update)
    }
    
    if (children.length >= 2){
        Offers.insertBefore(Divider, children[1])
    }
}

async function Main(){
    ListenToOffers()
    ListenForNewSummaryOffer()
    AddLinkToName()
}

Main()