let HaveFetchedGroupShouts = false
let GroupShouts = {}

const GroupShoutNotifications = {}

async function GetGroupShouts(){
    if (HaveFetchedGroupShouts) return true

    const Item = await LocalStorage.get("GroupShouts")
    if (Item){
        GroupShouts = JSON.parse(Item)
    }
    HaveFetchedGroupShouts = true

    return true
}

function SaveGroupShouts(){
    LocalStorage.set("GroupShouts", JSON.stringify(GroupShouts))
}

function ClearOldGroupShouts(Groups){
    const CurrentGroupLookup = {}

    for (let i = 0; i < Groups.length; i++){
        CurrentGroupLookup[Groups[i]] = true
    }

    const SavedGroups = Object.keys(GroupShouts)
    for (let i = 0; i < SavedGroups.length; i++){
        const Id = SavedGroups[i]
        if (!CurrentGroupLookup[Id]) delete GroupShouts[Id]
    }
}

async function CreateGroupShoutNotification(Group){
    if (chrome.notifications?.create) chrome.notifications.create(null, {type: "basic", priority: 0, eventTime: new Date(Group.shout.updated).getTime(), iconUrl: await GetHeadshotBlobFromURL(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${Group.id}&size=150x150&format=Png&isCircular=false`), title: `Group shout from ${Group.name}`, message: Group.shout.body, contextMessage: `By ${Group.shout.poster.username}`}, function(NotificationId){
        GroupShoutNotifications[NotificationId] = Group.id
    })
}

if (chrome.notifications?.onClicked) chrome.notifications.onClicked.addListener(function(NotificationId){
    const Notification = GroupShoutNotifications[NotificationId]
    if (!Notification) return

    chrome.tabs.create({url: `https://www.roblox.com/groups/${Notification}/group#!/about`})
})

async function CheckForNewGroupShoutNotification(Body){
    if (!await GetGroupShouts()) return

    const Shout = Body.shout
    const Prior = GroupShouts[Body.id]

    if (!Shout) return
    const Updated = Math.floor(new Date(Shout.updated).getTime()/1000)

    if (Shout && Prior !== Updated){
        GroupShouts[Body.id] = Updated
        SaveGroupShouts()
        if (Prior) CreateGroupShoutNotification(Body)
    }
}

async function CheckForNewGroupShouts(){
    const WatchingGroups = await IsFeatureEnabled("GroupShoutNotifications")
    const Groups = WatchingGroups.Groups
    ClearOldGroupShouts(Groups)

    const UserId = await GetCurrentUserId()
    if (!UserId){
        setTimeout(CheckForNewGroupShouts, 60*1000)
        return
    }
    if (!WatchingGroups.Enabled || Groups.length === 0 || !await GetGroupShouts()){
        setTimeout(CheckForNewGroupShouts, 60*1000)
        return
    }
    
    for (let i = 0; i < Groups.length; i++){
        const [Success, Body] = await RequestFunc(`https://groups.roblox.com/v1/groups/${Groups[i]}`)
        if (Success){
            CheckForNewGroupShoutNotification(Body)
        }
        await sleep(5000)
    }
    setTimeout(CheckForNewGroupShouts, 60*1000)
}

CheckForNewGroupShouts()