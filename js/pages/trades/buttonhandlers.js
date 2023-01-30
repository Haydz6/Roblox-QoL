async function DeclineAllInbounds(){
    const Button = CreateTradeDropdownOption("Decline Inbounds")
    TradesDropdown.appendChild(Button)

    Button.addEventListener("click", function(){
        DropdownOptionsOpen = false
        UpdateOptionsDropdownVisibility()

        const [ModalWindow, ModalBackdrop, CloseButton, CancelButton, CreateButton, FormGroup, Description] = CreateConfirmModal("Decline Inbounds", "Would you like to decline all inbound trades?", "Cancel", "Confirm")

        document.body.appendChild(ModalWindow)
        document.body.appendChild(ModalBackdrop)

        function Clear(){
            ModalBackdrop.remove()
            ModalWindow.remove()
        }

        CloseButton.addEventListener("click", Clear)
        CancelButton.addEventListener("click", Clear)

        let Completed = false

        CreateButton.addEventListener("click", async function(){
            if (Completed){
                Clear()
                return
            }

            CreateButton.setAttribute("disabled", true)
            CancelButton.setAttribute("disabled", true)

            Description.innerText = "Getting inbound trades"

            let Cursor = ""

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            while (true){
                if (Cursor === null) break

                const [Success, Result, Response] = await RequestFunc(`https://trades.roblox.com/v1/trades/Inbound?limit=100?cursor=${Cursor}`, "GET", undefined, undefined, true)

                if (Response.status === 429){
                    await sleep(1000*2)
                    continue
                }

                if (!Success){
                    Fails ++
                    break
                } else {
                    Successes ++
                }

                Cursor = Result.nextPageCursor
                const Data = Result.data

                while (Data.length > 0){
                    const [TradeSuccess] = await RequestFunc(`https://trades.roblox.com/v1/trades/${Data[0].id}/decline`, "POST", undefined, undefined, true)

                    if (Response.status === 429){
                        await sleep(1000*2)
                        continue
                    }

                    if (!TradeSuccess){
                        Fails ++
                    } else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `Declined ${InboundsCancelled} inbound trades.`
                    }

                    Data.splice(0, 1)
                    continue
                }
            }

            if (Fails > 0){
                if (Successes > 0){
                    Description.innerText = "Some inbound trades failed to decline."
                } else {
                    Description.innerText = "All inbound trades failed to decline."
                }
            } else {
                Description.innerText = `Declined ${InboundsCancelled} inbound trades.`
            }

            Completed = true

            CancelButton.remove()
            CreateButton.removeAttribute("disabled")
            CreateButton.innerText = "Ok"
        })
    })
}

async function CancelAllOutbounds(){
    const Button = CreateTradeDropdownOption("Decline Outbounds")
    TradesDropdown.appendChild(Button)

    Button.addEventListener("click", function(){
        DropdownOptionsOpen = false
        UpdateOptionsDropdownVisibility()

        const [ModalWindow, ModalBackdrop, CloseButton, CancelButton, CreateButton, FormGroup, Description] = CreateConfirmModal("Cancel Outbounds", "Would you like to cancel all outbound trades?", "Close", "Confirm")

        document.body.appendChild(ModalWindow)
        document.body.appendChild(ModalBackdrop)

        function Clear(){
            ModalBackdrop.remove()
            ModalWindow.remove()
        }

        CloseButton.addEventListener("click", Clear)
        CancelButton.addEventListener("click", Clear)

        let Completed = false

        CreateButton.addEventListener("click", async function(){
            if (Completed){
                Clear()
                return
            }

            CreateButton.setAttribute("disabled", true)
            CancelButton.setAttribute("disabled", true)

            Description.innerText = "Getting outbound trades"

            let Cursor = ""

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            while (true){
                if (Cursor === null) break

                const [Success, Result, Response] = await RequestFunc(`https://trades.roblox.com/v1/trades/Outbound?limit=100?cursor=${Cursor}`, "GET", undefined, undefined, true)

                if (Response.status === 429){
                    await sleep(1000*2)
                    continue
                }

                if (!Success){
                    Fails ++
                    break
                } else {
                    Successes ++
                }

                Cursor = Result.nextPageCursor
                const Data = Result.data

                while (Data.length > 0){
                    const [TradeSuccess] = await RequestFunc(`https://trades.roblox.com/v1/trades/${Data[0].id}/decline`, "POST", undefined, undefined, true)

                    if (Response.status === 429){
                        await sleep(1000*2)
                        continue
                    }

                    if (!TradeSuccess){
                        Fails ++
                    } else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `Cancelled ${InboundsCancelled} outbound trades.`
                    }

                    Data.splice(0, 1)
                    continue
                }
            }

            if (Fails > 0){
                if (Successes > 0){
                    Description.innerText = "Some outbound trades failed to cancel."
                } else {
                    Description.innerText = "All outbound trades failed to cancel."
                }
            } else {
                Description.innerText = `Cancelled ${InboundsCancelled} outbound trades.`
            }

            Completed = true

            CancelButton.remove()
            CreateButton.removeAttribute("disabled")
            CreateButton.innerText = "Ok"
        })
    })
}

async function DeclineAgedTrades(){
    const Button = CreateTradeDropdownOption("Decline Old Trades")
    TradesDropdown.appendChild(Button)

    Button.addEventListener("click", function(){
        DropdownOptionsOpen = false
        UpdateOptionsDropdownVisibility()

        const [ModalWindow, ModalBackdrop, CloseButton, CancelButton, CreateButton, FormGroup, Description, FormBody, Title, Form] = CreateConfirmModal("Decline Old Trades", "", "Cancel", "Confirm")
        const Slider = CreateSlider(0, 168)
        FormBody.appendChild(Slider)

        document.body.appendChild(ModalWindow)
        document.body.appendChild(ModalBackdrop)

        let TradeType = "Inbound"

        const [Button, Dropdown, ButtonTitle] = CreateConfirmModalDropdown()

        let IsDropdownOpen = false
        function UpdateDropdownVisibility(){
            Dropdown.style = `display: ${IsDropdownOpen && "block" || "none"};`
        }

        Button.addEventListener("click", function(){
            IsDropdownOpen = !IsDropdownOpen
            UpdateDropdownVisibility()
        })

        function UpdateTradeType(){
            Title.innerText = `${TradeType === "Inbound" && "Decline" || "Cancel"} Loss Trades`

            ButtonTitle.title = TradeType
            ButtonTitle.innerText = TradeType
        }

        const InboundButton = CreateTradeDropdownOption("Inbound")
        InboundButton.addEventListener("click", function(){
            IsDropdownOpen = false
            UpdateDropdownVisibility()

            TradeType = "Inbound"
            UpdateTradeType()
        })

        const OutboundButton = CreateTradeDropdownOption("Outbound")
        OutboundButton.addEventListener("click", function(){
            IsDropdownOpen = false
            UpdateDropdownVisibility()

            TradeType = "Outbound"
            UpdateTradeType()
            UpdateDescription()
        })

        Dropdown.append(InboundButton, OutboundButton)
        FormBody.appendChild(Button)
        Form.appendChild(Dropdown)

        function Clear(){
            ModalBackdrop.remove()
            ModalWindow.remove()
        }

        function UpdateDescription(){
            const Hours = Slider.value
            Description.innerText = `${Hours >= 24 && Math.floor(Hours/24) || Math.floor(Hours)} ${Hours >= 48 && "days" || Hours >= 24 && "day" || Hours > 1 && "hours" || "hour"}+ old trades will be ${TradeType === "Inbound" && "declined" || "cancelled"}`
        }

        Slider.addEventListener("input", UpdateDescription)

        CloseButton.addEventListener("click", Clear)
        CancelButton.addEventListener("click", Clear)

        let Completed = false

        CreateButton.addEventListener("click", async function(){
            if (Completed){
                Clear()
                return
            }

            CreateButton.setAttribute("disabled", true)
            CancelButton.setAttribute("disabled", true)
            Slider.setAttribute("disabled", true)

            Description.innerText = `Getting ${TradeType.toLowerCase()} trades`

            let Cursor = ""

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            const ExpiryTimestamp = Date.now()+(Slider.value * 3.6e+6)

            Slider.remove()
            Button.remove()
            Dropdown.remove()

            while (true){
                if (Cursor === null) break

                const [Success, Result, Response] = await RequestFunc(`https://trades.roblox.com/v1/trades/${TradeType}?limit=100?cursor=${Cursor}`, "GET", undefined, undefined, true)

                if (Response.status === 429){
                    await sleep(1000*2)
                    continue
                }

                if (!Success){
                    Fails ++
                    break
                } else {
                    Successes ++
                }

                Cursor = Result.nextPageCursor
                const Data = Result.data

                while (Data.length > 0){
                    const Trade = Data[0]
                    if (Data.parse(Trade.created) >= ExpiryTimestamp){
                        Data.splice(0, 1)
                        continue
                    }

                    const [TradeSuccess] = await RequestFunc(`https://trades.roblox.com/v1/trades/${Trade.id}/decline`, "POST", undefined, undefined, true)

                    if (Response.status === 429){
                        await sleep(1000*2)
                        continue
                    }

                    if (!TradeSuccess){
                        Fails ++
                    } else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `${TradeType === "Inbound" && "Declined" || "Cancelled"} ${InboundsCancelled} ${TradeType.toLowerCase()} trades.`
                    }

                    Data.splice(0, 1)
                    continue
                }
            }

            if (Fails > 0){
                if (Successes > 0){
                    Description.innerText = `Some ${TradeType.toLowerCase()} trades failed to ${TradeType === "Inbound" && "decline" || "cancel"}.`
                } else {
                    Description.innerText = `All ${TradeType.toLowerCase()} trades failed to ${TradeType === "Inbound" && "decline" || "cancel"}.`
                }
            } else {
                Description.innerText = `${TradeType === "Inbound" && "Declined" || "Cancelled"} ${InboundsCancelled} ${TradeType.toLowerCase()} trades.`
            }

            Completed = true

            CancelButton.remove()
            CreateButton.removeAttribute("disabled")
            CreateButton.innerText = "Ok"
        })

        UpdateDescription()
    })
}

async function DeclineLoss(){
    const Button = CreateTradeDropdownOption("Decline Loss Trades")
    TradesDropdown.appendChild(Button)

    Button.addEventListener("click", function(){
        DropdownOptionsOpen = false
        UpdateOptionsDropdownVisibility()

        const [ModalWindow, ModalBackdrop, CloseButton, CancelButton, CreateButton, FormGroup, Description, FormBody, Title, Form] = CreateConfirmModal("Decline Loss Trades", "", "Close", "Confirm")
        const Slider = CreateSlider(0, 20)
        FormBody.appendChild(Slider)

        document.body.appendChild(ModalWindow)
        document.body.appendChild(ModalBackdrop)

        let TradeType = "Inbound"

        const [Button, Dropdown, ButtonTitle] = CreateConfirmModalDropdown()

        let IsDropdownOpen = false
        function UpdateDropdownVisibility(){
            Dropdown.style = `display: ${IsDropdownOpen && "block" || "none"};`
        }

        Button.addEventListener("click", function(){
            IsDropdownOpen = !IsDropdownOpen
            UpdateDropdownVisibility()
        })

        function UpdateTradeType(){
            Title.innerText = `${TradeType === "Inbound" && "Decline" || "Cancel"} Loss Trades`

            ButtonTitle.title = TradeType
            ButtonTitle.innerText = TradeType
        }

        const InboundButton = CreateTradeDropdownOption("Inbound")
        InboundButton.addEventListener("click", function(){
            IsDropdownOpen = false
            UpdateDropdownVisibility()

            TradeType = "Inbound"
            UpdateTradeType()
        })

        const OutboundButton = CreateTradeDropdownOption("Outbound")
        OutboundButton.addEventListener("click", function(){
            IsDropdownOpen = false
            UpdateDropdownVisibility()

            TradeType = "Outbound"
            UpdateTradeType()
        })

        Dropdown.append(InboundButton, OutboundButton)
        FormBody.appendChild(Button)
        Form.appendChild(Dropdown)

        function Clear(){
            ModalBackdrop.remove()
            ModalWindow.remove()
        }

        function UpdateDescription(){
            const Value = Slider.value
            Description.innerText = `${Value * 5}%+ Value Loss`
        }

        Slider.addEventListener("input", UpdateDescription)

        CloseButton.addEventListener("click", Clear)
        CancelButton.addEventListener("click", Clear)

        let Completed = false

        CreateButton.addEventListener("click", async function(){
            if (Completed){
                Clear()
                return
            }

            CreateButton.setAttribute("disabled", true)
            CancelButton.setAttribute("disabled", true)
            Slider.setAttribute("disabled", true)

            Description.innerText = `Getting ${TradeType.toLowerCase()} trades`

            let Cursor = ""

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            Slider.remove()
            Button.remove()
            Dropdown.remove()

            while (true){
                if (Cursor === null) break

                const [Success, Result, Response] = await RequestFunc(`https://trades.roblox.com/v1/trades/${TradeType}?limit=100?cursor=${Cursor}`, "GET", undefined, undefined, true)

                if (Response.status === 429){
                    await sleep(1000*2)
                    continue
                }

                if (!Success){
                    Fails ++
                    break
                } else {
                    Successes ++
                }

                Cursor = Result.nextPageCursor
                const Data = Result.data

                while (Data.length > 0){
                    const [InfoSuccess, Info] = await RequestFunc(`https://trades.roblox.com/v1/trades/${Data[0].id}`, "GET", undefined, undefined, true)

                    if (Response.status === 429){
                        await sleep(1000*2)
                        continue
                    }

                    if (!InfoSuccess){
                        Fails ++
                        Data.splice(0, 1)
                        continue
                    }

                    const Values = {Ours: 0, Other: 0}
                    let ValueSuccess = true

                    const Offers = Info.offers

                    for (let i = 0; i < Offers.length; i++){
                        const Offer = Offers[i]
                        const ValueTarget = Offer.user.id == UserId && "Ours" || "Other"

                        const Assets = Offer.userAssets
                        const AssetIds = []

                        for (o = 0; o < Assets.length; o++){
                            AssetIds.push(Assets[o].assetId)
                            // const [Success, Info] = GetItemDetails(Assets[i].assetId)

                            // if (!Success){
                            //     ValueSuccess = false
                            //     break
                            // }

                            // Values[ValueTarget] += Info.Value
                        }

                        const [Success, _, Value] = await GetItemDetails(AssetIds, true)

                        if (!Success){
                            ValueSuccess = false
                            break
                        }

                        Values[ValueTarget] = Value
                    }

                    if (!ValueSuccess){
                        Fails ++
                        Data.splice(0, 1)
                        continue
                    }

                    if (((Values.Ours - Values.Other)/Values.Ours)*100 < Slider.value * 20){
                        Data.splice(0, 1)
                        continue
                    }

                    const [TradeSuccess] = await RequestFunc(`https://trades.roblox.com/v1/trades/${Data[0].id}/decline`, "POST", undefined, undefined, true)

                    if (Response.status === 429){
                        await sleep(1000*2)
                        continue
                    }

                    if (!TradeSuccess){
                        Fails ++
                    } else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `${TradeType === "Inbound" && "Declined" || "Cancelled"} ${InboundsCancelled} ${TradeType.toLowerCase()} trades.`
                    }

                    Data.splice(0, 1)
                    continue
                }
            }

            if (Fails > 0){
                if (Successes > 0){
                    Description.innerText = `Some ${TradeType.toLowerCase()} trades failed to decline.`
                } else {
                    Description.innerText = `All ${TradeType.toLowerCase()} trades failed to decline.`
                }
            } else {
                Description.innerText = `${TradeType === "Inbound" && "Declined" || "Cancelled"} ${InboundsCancelled} ${TradeType.toLowerCase()} trades.`
            }

            Completed = true

            CancelButton.remove()
            CreateButton.removeAttribute("disabled")
            CreateButton.innerText = "Ok"
        })

        UpdateDescription()
    })
}

async function DeclineInboundProjections(){
    const Button = CreateTradeDropdownOption("Decline Projections")
    TradesDropdown.appendChild(Button)

    Button.addEventListener("click", function(){
        DropdownOptionsOpen = false
        UpdateOptionsDropdownVisibility()

        const [ModalWindow, ModalBackdrop, CloseButton, CancelButton, CreateButton, FormGroup, Description] = CreateConfirmModal("Decline Inbound Projections", "Would you like to decline inbound trades where you receive projected item(s)?\n(Information from rolimons)", "Close", "Confirm")

        document.body.appendChild(ModalWindow)
        document.body.appendChild(ModalBackdrop)

        function Clear(){
            ModalBackdrop.remove()
            ModalWindow.remove()
        }

        CloseButton.addEventListener("click", Clear)
        CancelButton.addEventListener("click", Clear)

        let Completed = false

        CreateButton.addEventListener("click", async function(){
            if (Completed){
                Clear()
                return
            }

            CreateButton.setAttribute("disabled", true)
            CancelButton.setAttribute("disabled", true)

            Description.innerText = "Getting inbound trades"

            let Cursor = ""

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            while (true){
                if (Cursor === null) break

                const [Success, Result, Response] = await RequestFunc(`https://trades.roblox.com/v1/trades/Inbound?limit=100?cursor=${Cursor}`, "GET", undefined, undefined, true)

                if (Response.status === 429){
                    await sleep(1000*2)
                    continue
                }

                if (!Success){
                    Fails ++
                    break
                } else {
                    Successes ++
                }

                Cursor = Result.nextPageCursor
                const Data = Result.data

                while (Data.length > 0){
                    const [InfoSuccess, Info] = await RequestFunc(`https://trades.roblox.com/v1/trades/${Data[0].id}`, "GET", undefined, undefined, true)

                    if (Response.status === 429){
                        await sleep(1000*2)
                        continue
                    }

                    if (!InfoSuccess){
                        Fails ++
                        Data.splice(0, 1)
                        continue
                    }

                    let ValueSuccess = true
                    let ProjectedFound = false

                    const Offers = Info.offers

                    for (let i = 0; i < Offers.length; i++){
                        const Offer = Offers[i]

                        if (Offer.user.id == UserId) continue

                        const Assets = Offer.userAssets
                        const AssetIds = []

                        for (o = 0; o < Assets.length; o++){
                            AssetIds.push(Assets[o].assetId)
                            // const [Success, Info] = GetItemDetails(Assets[i].assetId)

                            // if (!Success){
                            //     ValueSuccess = false
                            //     break
                            // }

                            // if (Info.Projected){
                            //     ProjectedFound = true
                            //     break
                            // }
                        }

                        const [Success, Details] = await GetItemDetails(AssetIds)

                        if (!Success){
                            ValueSuccess = false
                            break
                        }

                        for (let o = 0; o < Details.length; o++){
                            if (Details[o].Projected){
                                ProjectedFound = true
                                break
                            }
                        }
                    }

                    if (!ValueSuccess){
                        Fails ++
                        Data.splice(0, 1)
                        continue
                    }

                    if (!ProjectedFound){
                        Data.splice(0, 1)
                        continue
                    }

                    const [TradeSuccess] = await RequestFunc(`https://trades.roblox.com/v1/trades/${Data[0].id}/decline`, "POST", undefined, undefined, true)

                    if (Response.status === 429){
                        await sleep(1000*2)
                        continue
                    }

                    if (!TradeSuccess){
                        Fails ++
                    } else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `Declined ${InboundsCancelled} inbound trades.`
                    }

                    Data.splice(0, 1)
                    continue
                }
            }

            if (Fails > 0){
                if (Successes > 0){
                    Description.innerText = "Some inbound trades failed to decline."
                } else {
                    Description.innerText = "All inbound trades failed to decline."
                }
            } else {
                Description.innerText = `Declined ${InboundsCancelled} inbound trades.`
            }

            Completed = true

            CancelButton.remove()
            CreateButton.removeAttribute("disabled")
            CreateButton.innerText = "Ok"
        })
    })
}

async function DeclineInvalidTrades(){
    const Button = CreateTradeDropdownOption("Decline Invalid")
    TradesDropdown.appendChild(Button)

    Button.addEventListener("click", function(){
        DropdownOptionsOpen = false
        UpdateOptionsDropdownVisibility()

        const [ModalWindow, ModalBackdrop, CloseButton, CancelButton, CreateButton, FormGroup, Description] = CreateConfirmModal("Decline Invalid Trades", "Would you like to decline invalid trades? (Trades where you or the other user no longer have the limiteds to fulfill the trade)", "Close", "Confirm")

        document.body.appendChild(ModalWindow)
        document.body.appendChild(ModalBackdrop)

        function Clear(){
            ModalBackdrop.remove()
            ModalWindow.remove()
        }

        CloseButton.addEventListener("click", Clear)
        CancelButton.addEventListener("click", Clear)

        let Completed = false

        CreateButton.addEventListener("click", async function(){
            if (Completed){
                Clear()
                return
            }

            CreateButton.setAttribute("disabled", true)
            CancelButton.setAttribute("disabled", true)

            Description.innerText = "Getting inbound trades"

            let Cursor = ""

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            while (true){
                if (Cursor === null) break

                const [Success, Result, Response] = await RequestFunc(`https://trades.roblox.com/v1/trades/Inbound?limit=100?cursor=${Cursor}`, "GET", undefined, undefined, true)

                if (Response.status === 429){
                    await sleep(1000*2)
                    continue
                }

                if (!Success){
                    Fails ++
                    break
                } else {
                    Successes ++
                }

                Cursor = Result.nextPageCursor
                const Data = Result.data

                while (Data.length > 0){
                    const [InfoSuccess, Info] = await RequestFunc(`https://trades.roblox.com/v1/trades/${Data[0].id}`, "POST", undefined, undefined, true)

                    if (Response.status === 429){
                        await sleep(1000*2)
                        continue
                    }

                    if (!InfoSuccess){
                        Fails ++
                        Data.splice(0, 1)
                        continue
                    }
                    
                    const AssetIdsNeeded = {Ours: [], Other: []}
                    let IsValid = true

                    const Offers = Info.offers
                    let OtherUserId

                    for (let i = 0; i < Offers.length; i++){
                        const Offer = Offers[i]

                        const Type = Offer.user.id == UserId && "Ours" || "Other"
                        const Assets = Offer.userAssets

                        if (Type === "Other") OtherUserId = Offer.user.id

                        for (o = 0; o < Assets.length; o++){
                            AssetIdsNeeded[Type].push(Assets[o].assetId)
                        }
                    }

                    if (!OtherUserId){
                        Fails ++
                        Data.splice(0, 1)
                        continue
                    }

                    const [OurInventorySuccess, OurPublic, OurInventory] = await GetUserLimitedInventory(UserId)

                    if (!OurInventorySuccess || !Public){
                        Fails ++
                        Data.splice(0, 1)
                        continue
                    }

                    const [OtherInventorySuccess, OtherPublic, OtherInventory] = await GetUserLimitedInventory(OtherUserId)

                    if (!OtherInventorySuccess || !OtherPublic){
                        Fails ++
                        Data.splice(0, 1)
                        continue
                    }

                    const OurMap = {}
                    const OtherMap = {}

                    for (let i = 0; i < OurInventory.length; i++){
                        OurMap[OurInventory[i].assetId] = true
                    }

                    for (let i = 0; i < OtherInventory.length; i++){
                        OtherMap[OtherInventory[i].assetId] = true
                    }

                    for (let i = 0; i < AssetIdsNeeded.Ours; i++){
                        if (!OurMap[AssetIdsNeeded.Ours[i]]){
                            IsValid = false
                            break
                        }
                    }

                    if (IsValid){
                        for (let i = 0; i < AssetIdsNeeded.Other; i++){
                            if (!OtherMap[AssetIdsNeeded.Other[i]]){
                                IsValid = false
                                break
                            }
                        }
                    }

                    if (IsValid){
                        Data.splice(0, 1)
                        continue
                    }

                    const [TradeSuccess] = await RequestFunc(`https://trades.roblox.com/v1/trades/${Data[0].id}/decline`)

                    if (Response.status === 429){
                        await sleep(1000*2)
                        continue
                    }

                    if (!TradeSuccess){
                        Fails ++
                    } else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `Declined ${InboundsCancelled} inbound trades.`
                    }

                    Data.splice(0, 1)
                    continue
                }
            }

            if (Fails > 0){
                if (Successes > 0){
                    Description.innerText = "Some inbound trades failed to decline."
                } else {
                    Description.innerText = "All inbound trades failed to decline."
                }
            } else {
                Description.innerText = `Declined ${InboundsCancelled} inbound trades.`
            }

            Completed = true

            CancelButton.remove()
            CreateButton.removeAttribute("disabled")
            CreateButton.innerText = "Ok"
        })
    })
}