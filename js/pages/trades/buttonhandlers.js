async function DeclineTradeWithDOMCheck(TradeId){
    const [Success] = await DeclineTrade(TradeId)

    if (Success){
        const TradeRow = document.querySelectorAll(`div[tradeid="${TradeId}"][class^="trade-row"]`)[0]

        if (TradeRow) TradeRow.remove()
    }

    return [Success]
}

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

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            await GetAllTrades("Inbound", 100, true, async function(Success, Result, FetchNext, Cancel){
                if (!Success){
                    Fails ++
                    Cancel()
                    return
                }

                const Data = Result.data
                for (let i = 0; i < Data.length; i++){
                    const [TradeSuccess] = await DeclineTradeWithDOMCheck(Data[i].id)

                    if (!TradeSuccess) Fails ++
                    else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `Declining ${InboundsCancelled} inbound trades.`
                    }
                }
                FetchNext()
            })

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

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            await GetAllTrades("Outbound", 100, true, async function(Success, Result, FetchNext, Cancel){
                if (!Success){
                    Fails ++
                    Cancel()
                    return
                }

                const Data = Result.data
                for (let i = 0; i < Data.length; i++){
                    const [TradeSuccess] = await DeclineTradeWithDOMCheck(Data[i].id)

                    if (!TradeSuccess) Fails ++
                    else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `Declining ${InboundsCancelled} inbound trades.`
                    }
                }
                FetchNext()
            })

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
            const Days = Math.floor(Hours/24)
            const HoursInDays = Math.floor(Hours%24)
            Description.innerText = `${Hours >= 24 && Days || Math.floor(Hours)} ${Hours >= 48 && "days" || Hours >= 24 && "day" || Hours > 1 && "hours" || "hour"} ${Hours > 24 && HoursInDays || ""}${Hours >= 24 && (HoursInDays > 1 && " hours" || HoursInDays > 0 && " hour" || "") || ""} and older trades will be ${TradeType === "Inbound" && "declined" || "cancelled"}`
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

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            const ExpiryTimestamp = Date.now()-(Slider.value * 3.6e+6)

            Slider.remove()
            Button.remove()
            Dropdown.remove()

            await GetAllTrades(TradeType, 100, true, async function(Success, Result, FetchNext, Cancel){
                if (!Success){
                    Fails ++
                    Cancel()
                    return
                }

                const Data = Result.data
                for (let i = 0; i < Data.length; i++){
                    const Trade = Data[i]
                    
                    if (ExpiryTimestamp - Date.parse(Trade.created) < 0){
                        continue
                    }

                    const [TradeSuccess] = await DeclineTradeWithDOMCheck(Trade.id)

                    if (!TradeSuccess) Fails ++
                    else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `${TradeType === "Inbound" && "Declining" || "Cancelling"} ${InboundsCancelled} ${TradeType.toLowerCase()} trades.`
                    }
                }

                FetchNext()
            })

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

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            Slider.remove()
            Button.remove()
            Dropdown.remove()

            await GetAllTrades(TradeType, 100, true, async function(Success, Result, FetchNext, Cancel){
                if (!Success){
                    Fails ++
                    Cancel()
                    return
                }

                const Data = Result.data

                for (let i = 0; i < Data.length; i++){
                    const Trade = Data[i]
                    const [InfoSuccess, Info] = await GetTradeInfo(Trade.id, true)

                    if (!InfoSuccess){
                        Fails ++
                        continue
                    }

                    const AllOffers = Success && Info.offers || []

                    const Offers = {Ours: AllOffers[0], Other: AllOffers[1]}
                    await AddValueToOffers(AllOffers)

                    if (-Slider.value * 5 < (Offers.Other.Value - Offers.Ours.Value)/Offers.Ours.Value * 100){
                        continue
                    }

                    const [TradeSuccess] = await DeclineTradeWithDOMCheck(Trade.id)

                    if (!TradeSuccess) Fails ++
                    else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `${TradeType === "Inbound" && "Declining" || "Cancelling"} ${InboundsCancelled} ${TradeType.toLowerCase()} trades.`
                    }
                }

                FetchNext()
            })

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

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            await GetAllTrades("Inbound", 100, true, async function(Success, Result, FetchNext, Cancel){
                if (!Success){
                    Fails ++
                    Cancel()
                    return
                }

                const Data = Result.data
                for (let i = 0; i < Data.length; i++){
                    const Trade = Data[i]
                    const [InfoSuccess, Info] = await GetTradeInfo(Trade.id, true)

                    if (!InfoSuccess){
                        Fails ++
                        continue
                    }

                    let ValueSuccess = true
                    let ProjectedFound = false

                    const Offers = Info.offers

                    for (let i = 0; i < Offers.length; i++){
                        const Offer = Offers[i]
                        
                        if (Offer.user.id == await GetUserId()) continue

                        const Assets = Offer.userAssets
                        const AssetIds = []

                        for (o = 0; o < Assets.length; o++){
                            AssetIds.push(Assets[o].assetId)
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
                        continue
                    }

                    if (!ProjectedFound){
                        continue
                    }

                    const [TradeSuccess] = await DeclineTradeWithDOMCheck(Trade.id)

                    if (!TradeSuccess){
                        Fails ++
                    } else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `Declining ${InboundsCancelled} inbound trades.`
                    }
                }
                FetchNext()
            })

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

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            await GetAllTrades("Inbound", 100, true, async function(Success, Result, FetchNext, Cancel){
                if (!Success){
                    Fails ++
                    Cancel()
                    return
                }

                const Data = Result.data
                for (let i = 0; i < Data.length; i++){
                    const Trade = Data[i]
                    const [InfoSuccess, Info] = await GetTradeInfo(Trade.id, true)

                    if (!InfoSuccess){
                        Fails ++
                        continue
                    }
                    
                    const AssetIdsNeeded = {Ours: [], Other: []}
                    let IsValid = true

                    const Offers = Info.offers
                    let OtherUserId

                    for (let i = 0; i < Offers.length; i++){
                        const Offer = Offers[i]

                        const Type = Offer.user.id == await GetUserId() && "Ours" || "Other"
                        const Assets = Offer.userAssets

                        if (Type === "Other") OtherUserId = Offer.user.id

                        for (o = 0; o < Assets.length; o++){
                            AssetIdsNeeded[Type].push(Assets[o].assetId)
                        }
                    }

                    if (!OtherUserId){
                        Fails ++
                        continue
                    }

                    const [OurInventorySuccess, OurPublic, OurInventory] = await GetUserLimitedInventory(await GetUserId())

                    if (!OurInventorySuccess){
                        Fails ++
                        continue
                    }

                    const [OtherInventorySuccess, OtherPublic, OtherInventory] = await GetUserLimitedInventory(OtherUserId)

                    if (!OtherInventorySuccess || !OtherPublic){
                        Fails ++
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
                        continue
                    }

                    const [TradeSuccess] = await DeclineTradeWithDOMCheck(Trade.id)

                    if (!TradeSuccess){
                        Fails ++
                    } else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `Declining ${InboundsCancelled} inbound trades.`
                    }

                    continue
                }

                FetchNext()
            })

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

async function DeclineValue(){
    const Button = CreateTradeDropdownOption("Decline Value Trades")
    TradesDropdown.appendChild(Button)

    Button.addEventListener("click", function(){
        DropdownOptionsOpen = false
        UpdateOptionsDropdownVisibility()

        const [ModalWindow, ModalBackdrop, CloseButton, CancelButton, CreateButton, FormGroup, Description, FormBody, Title, Form] = CreateConfirmModal("Decline Value Trades", "Decline trades below a certain value (Rolimons)", "Close", "Confirm")
        const Input = document.createElement("input")
        Input.className = "form-control input-field new-input-field"
        Input.placeholder = ""
        Input.autocomplete = false
        Input.autocapitalize = false
        Input.spellcheck = false
        Input.style = "width: 200px; height: 33px; margin: 10px 0px 10px 22%;"
        Input.value = 0

        FormBody.appendChild(Input)

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
            Input.setAttribute("disabled", true)

            Description.innerText = "Getting inbound trades"

            let Fails = 0
            let Successes = 0
            let InboundsCancelled = 0

            Input.remove()

            await GetAllTrades("Inbound", 100, true, async function(Success, Result, FetchNext, Cancel){
                if (!Success){
                    Fails ++
                    Cancel()
                    return
                }

                const Data = Result.data

                for (let i = 0; i < Data.length; i++){
                    const Trade = Data[i]
                    const [InfoSuccess, Info] = await GetTradeInfo(Trade.id, true)

                    if (!InfoSuccess){
                        Fails ++
                        continue
                    }

                    const AllOffers = Success && Info.offers || []

                    const Offers = {Ours: AllOffers[0], Other: AllOffers[1]}
                    await AddValueToOffers(AllOffers)

                    if (Input.value <= Offers.Other.Value){
                        continue
                    }

                    const [TradeSuccess] = await DeclineTradeWithDOMCheck(Trade.id)

                    if (!TradeSuccess) Fails ++
                    else {
                        Successes ++
                        InboundsCancelled ++
                        Description.innerText = `Declining ${InboundsCancelled} inbound trades.`
                    }
                }

                FetchNext()
            })

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