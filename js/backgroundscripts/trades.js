const AlreadyScannedTrades = {}
const TradeNotifications = {}

let FirstTradeScans = {Inbound: false, Outbound: false, Completed: false, Inactive: false}

async function GetHeadshotBlobFromURL(Url){
    const [Success, Result] = await RequestFunc(Url, "GET", undefined, undefined, true)
    const FailURL = ""

    if (!Success) return FailURL
    
    const [ImgSuccess, _, Response] = await RequestFunc(Result.data[0].imageUrl, "GET", undefined, undefined, true, true)

    if (!ImgSuccess) return FailURL

    const ImageData = await Response.blob()
    let DataURL = await new Promise(resolve => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(ImageData);
    });

    return DataURL
}

async function GetHeadshotBlobFromUserId(UserId){
    return GetHeadshotBlobFromURL(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${UserId}&size=150x150&format=Png&isCircular=true`)
}

async function ClearOldScannedTrades(){

}

async function SaveScannedTrades(Type){
    await IsTradeScanned(Type, -1)
    LocalStorage.set("ScannedTrades_"+Type, JSON.stringify(AlreadyScannedTrades[Type]))
}

async function IsTradeScanned(Type, TradeId){
    while (AlreadyScannedTrades[Type] == true) await sleep(20)

    if (!AlreadyScannedTrades[Type]){
        AlreadyScannedTrades[Type] = true
        const ScannedTradesUnparsed = await LocalStorage.get("ScannedTrades_"+Type)

        if (!ScannedTradesUnparsed){
            AlreadyScannedTrades[Type] = {}
            FirstTradeScans[Type] = true
        } else {
            AlreadyScannedTrades[Type] = JSON.parse(ScannedTradesUnparsed)
        }
    }

    return AlreadyScannedTrades[Type][TradeId]
}

async function HandleAutoDecline(Trade, Type){
    let [Success, Result, Response] = await DeclineTrade(Trade.id)
    if (!Success && (!Response || Response.status < 500) && await IsFeatureEnabled("OpenNewTabIfRequiredJobsHAB")){
        await chrome.tabs.create({url: `https://www.roblox.com/trades?tradeid=${Trade.id}#${Type.toLowerCase()}`, active: false})
        await WaitForRobloxPage()

        ;[Success, Result, Response] = await DeclineTrade(Trade.id)
    }

    if (!Success){
        const NotificationId = GenerateNotificationId(50)
        const IconUrl = await GetHeadshotBlobFromUserId(Trade.user.id)

        const Buttons = [{title: "Open"}]
        TradeNotifications[NotificationId] = {type: Type, user: Trade.user, iconUrl: IconUrl, tradeid: Trade.id, buttons: Buttons}

        if (chrome.notifications?.create) chrome.notifications.create(NotificationId, {type: "basic", priority: 3, iconUrl: IconUrl, title: `Failed to decline ${Trade.user.name} trade`, contextMessage: "This can happen if you do not have a roblox tab open", message: `${Result?.errors?.[0]?.message || "Unknown error"}`})
    }
}

async function NotifyNewTrades(Trades, Type){
    await IsTradeScanned(Type, -1)

    if (FirstTradeScans[Type]){
        FirstTradeScans[Type] = false
        return
    }

    for (let i = 0; i < Trades.length; i++){
        const Trade = Trades[i]
        let Buttons = []
        let Title = ""

        switch (Type){
            case "Inbound": {
                Title = "Inbound Trade"
                Buttons = [{title: "Open"}, {title: "Decline"}]
                break
            }
            case "Outbound": {
                Title = "Outbound Trade"
                Buttons = [{title: "Open"}, {title: "Cancel"}]
                break
            }
            case "Completed": {
                Title = "Completed Trade"
                Buttons = [{title: "Open"}]
                break
            }
            case "Inactive": {
                Title = "Declined Trade"
                Buttons = [{title: "Open"}]
                break
            }
        }

        const [Success, TradeInfo] = await GetTradeInfo(Trade.id)
        const AllOffers = Success && TradeInfo.offers || []

        const Offers = {Ours: AllOffers[0], Other: AllOffers[1]}
        await AddValueToOffers(AllOffers)

        if (Type === "Inbound"){
            let Declined = false

            if (await IsFeatureEnabled("AutodeclineTradeValue")){
                const Threshold = await IsFeatureEnabled("AutodeclineTradeValueThreshold")
                const Percentage = (Offers.Other.Value - Offers.Ours.Value)/Offers.Ours.Value * 100

                if (-Threshold >= Percentage){
                    Declined = true
                    HandleAutoDecline(Trade, Type)
                }
            }
            if (!Declined && await IsFeatureEnabled("AutodeclineLowTradeValue")){
                const Threshold = await IsFeatureEnabled("AutodeclineLowTradeValueThreshold")

                if (Threshold > Offers.Other.Value){
                    Declined = true
                    HandleAutoDecline(Trade, Type)
                }
            }
        }
        if (Type === "Outbound" && await IsFeatureEnabled("AutodeclineOutboundTradeValue")){
            const Threshold = await IsFeatureEnabled("AutodeclineOutboundTradeValueThreshold")
            const Percentage = (Offers.Other.Value - Offers.Ours.Value)/Offers.Ours.Value * 100

            if (-Threshold >= Percentage){
                HandleAutoDecline(Trade, Type)
            }
        }

        if (await IsFeatureEnabled("TradeNotifier") && !await IsFeatureEnabled(`Hide${Type}Notifications`)){
            let ContextMessage = "Unknown"

            if (Offers.Ours.Valid && Offers.Other.Valid){
                const Net = Offers.Other.Value - Offers.Ours.Value

                if (Net > 0){
                    ContextMessage = `Gain: +${numberWithCommas(Net)}`
                } else if (Net < 0){
                    ContextMessage = `Loss: ${numberWithCommas(Net)}`
                } else {
                    ContextMessage = "Tie"
                }
            }

            const NotificationId = GenerateNotificationId(50)
            const IconUrl = await GetHeadshotBlobFromUserId(Trade.user.id)

            TradeNotifications[NotificationId] = {type: Type, user: Trade.user, iconUrl: IconUrl, tradeid: Trade.id, buttons: Buttons}

            if (chrome.notifications?.create) chrome.notifications.create(NotificationId, {type: "basic", buttons: Buttons, priority: 2, eventTime: Date.now(), iconUrl: IconUrl, title: Title, contextMessage: ContextMessage, message: `Trader: ${Trade.user.name}\nYour Value: ${Offers.Ours.Valid && numberWithCommas(Offers.Ours.Value) || "???"}\nTheir Value: ${Offers.Other.Valid && numberWithCommas(Offers.Other.Value) || "???"}`})
        }
    }
}

async function FetchNewTrades(Type){
    if (!UserId) return []

    const [Success, Result] = await RequestFunc(`https://trades.roblox.com/v1/trades/${Type}`, "GET", undefined, undefined, true)

    if (!Success) return []

    const Data = Result.data
    let Edited = false

    for (let i = 0; i < Data.length; i++){
        const Trade = Data[i]
        const TradeId = Trade.id

        if (await IsTradeScanned(Type, TradeId)){
            Data.splice(i, 1)
            i--
        } else {
            AlreadyScannedTrades[Type][TradeId] = true
            Edited = true
        }
    }

    if (Edited) SaveScannedTrades(Type)

    return Data
}

async function CheckForNewTrades(){
    const TradeTypesToFetch = ["Inbound", "Outbound", "Completed", "Inactive"]
    const TradePromises = []

    for (let i = 0; i < TradeTypesToFetch.length; i++){
        TradePromises.push(FetchNewTrades(TradeTypesToFetch[i]))
    }

    const [Inbound, Outbound, Completed, Inactive] = await Promise.all(TradePromises)

    if (Inbound.length > 0) await NotifyNewTrades(Inbound, "Inbound")
    if (Outbound.length > 0) await NotifyNewTrades(Outbound, "Outbound")
    if (Completed.length > 0) await NotifyNewTrades(Completed, "Completed")
    if (Inactive.length > 0) await NotifyNewTrades(Inactive, "Inactive")

    ClearOldScannedTrades()
}

if (chrome.notifications?.onButtonClicked) chrome.notifications.onButtonClicked.addListener(function(NotificationId, ButtonIndex){
    const Notification = TradeNotifications[NotificationId]
    if (!Notification) return

    const Button = Notification.buttons[ButtonIndex]
    if (Button.title === "Open") chrome.tabs.create({url: `https://www.roblox.com/trades?tradeid=${Notification.tradeid}#${Notification.type.toLowerCase()}`})
    else if (Button.title === "Decline" || Button.title === "Cancel"){
        async function AttemptDecline(Notify){
            const [Success, _, Response] = await DeclineTrade(Notification.tradeid)

            if (!Success && (!Response || Response.status < 500) && Notify){
                const Buttons = [{title: "Open"}]
                const NewNotificationId = GenerateNotificationId(50)

                TradeNotifications[NewNotificationId] = {type: Notification.type, user: Notification.user, iconUrl: Notification.iconUrl, tradeid: Notification.tradeid, buttons: Buttons}
                if (chrome.notifications?.create) chrome.notifications.create(NewNotificationId, {type: "basic", priority: 3, iconUrl: Notification.iconUrl, title: `Failed to decline ${Notification.user.name} trade`, contextMessage: "This can happen if you do not have a roblox tab open", message: `${Result?.errors?.[0]?.message || "Unknown error"}`})
            }

            return Success
        }

        IsFeatureEnabled("OpenNewTabIfRequiredHAB").then(async function(CanOpenTab){
            if (!await AttemptDecline(!CanOpenTab)){
                if (CanOpenTab){
                    await chrome.tabs.create({url: `https://www.roblox.com/trades?tradeid=${Notification.tradeid}#${Notification.type.toLowerCase()}`, active: false})
                    await WaitForRobloxPage()

                    AttemptDecline(true)
                }
            }
        })
    }
})

if (chrome.notifications?.onClicked) chrome.notifications.onClicked.addListener(function(NotificationId){
    const Notification = TradeNotifications[NotificationId]
    if (!Notification) return

    chrome.tabs.create({url: `https://www.roblox.com/trades#${Notification.type.toLowerCase()}`})
})

setInterval(CheckForNewTrades, 20*1000)
CheckForNewTrades()