IsFeatureEnabled("LastOnline").then(async function(Enabled){
    if (!Enabled) return

    const TargetId = await GetTargetId()

    const ProfileStat = document.createElement("li")
    ProfileStat.className = "profile-stat"
    ProfileStat.innerHTML = `<p class="text-label">Last Online</p><p title class="text-lead">...</p>`
    const LastOnlineLabel = ProfileStat.getElementsByClassName("text-lead")[0] //make all profile-stat 33.33%

    RequestFunc("https://presence.roblox.com/v1/presence/users", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: [TargetId]}), true).then(function([Success, Body]){
        if (!Success){
            LastOnlineLabel.innerText = "Failed"
            return
        }
        if (Body.userPresences?.[0]?.userPresenceType != 0){
            LastOnlineLabel.innerText = "Now"
            return
        }

        RequestFunc("https://presence.roblox.com/v1/presence/last-online", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: [TargetId]}), true).then(function([Success, Body]){
            if (!Success){
                LastOnlineLabel.innerText = "Failed"
                return
            }
            const LastOnline = new Date(Body.lastOnlineTimestamps[0].lastOnline)

            LastOnlineLabel.title = LastOnline.toLocaleDateString(undefined, {hour: "numeric", minute: "numeric", second: "numeric", hour12: true})
            LastOnlineLabel.innerText = SecondsToLengthSingle(Date.now()/1000 - LastOnline.getTime()/1000, true) + " ago"
        })
    })

    const Container = await WaitForClass("profile-stats-container")
    Container.insertBefore(ProfileStat, Container.children[1])

    ChildAdded(Container, true, function(Stat){
        const TextLead = Stat.getElementsByClassName("text-label")[0]
        if (TextLead && Stat != ProfileStat){
            if (TextLead.innerText === "Last Online"){
                Stat.remove()
            }
        }

        Stat.style.width = "33.33%"
    })
})