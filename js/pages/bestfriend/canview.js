IsFeatureEnabled("BestFriendPresenceV3").then(async function(Enabled){
    if (!Enabled || !await PaidForFeature("BestFriends")) return

    let CanView

    async function FetchCanView(){
        if (CanView !== undefined) return CanView

        const [Success, Result] = await RequestFunc(WebServerEndpoints.BestFriends+"view", "GET")
        if (!Success) return
        CanView = Result.CanView
    }

    function UpdateCanView(){
        RequestFunc(WebServerEndpoints.BestFriends+"setview", "POST", {"Content-Type": "application/json"}, JSON.stringify({CanView: CanView}))
    }

    ChildAdded(await WaitForClass("tab-content"), true, function(Child, Disconnect){
        const Container = document.getElementById("privacy-settings") || document.getElementById("rbx-privacy-settings-header")
        if (!Container) return

        let DebounceCheck = false
        DescendantAdded(Child, true, async function(){
            if (DebounceCheck) return
            DebounceCheck = true
            await sleep(0)
            DebounceCheck = false

            const JoinPrivacy = document.getElementById("FollowMePrivacy")
            if (!JoinPrivacy || document.getElementById("best-friends-view-game")) return

            Disconnect()

            const Option = document.createElement("option")
            Option.value = "BestFriends"
            Option.id = "best-friends-view-game"
            Option.innerText = "Best Friends"

            function GetBestFriendIndex(){
                const Children = JoinPrivacy.children

                for (let i = 0; i < Children.length; i++){
                    if (Children[i] === Option){
                        return i
                    }
                }
            }

            JoinPrivacy.addEventListener("change", function(){
                if (JoinPrivacy.selectedIndex === GetBestFriendIndex()){
                    Option.value = "NoOne"
                    Option.innerText = "Best Friends (Best Friends require RoQoL extension)"

                    if (!CanView){
                        CanView = true
                        UpdateCanView()
                    }
                } else {
                    Option.value = "BestFriends"
                    Option.innerText = "Best Friends"

                    if (CanView){
                        CanView = false
                        UpdateCanView()
                    }
                }
            })

            ChildRemoved(JoinPrivacy, function(){
                if (!Option.parentNode) JoinPrivacy.insertBefore(Option, JoinPrivacy.children[JoinPrivacy.children.length-1])
            })

            JoinPrivacy.insertBefore(Option, JoinPrivacy.children[JoinPrivacy.children.length-1])

            await FetchCanView()

            if (CanView && JoinPrivacy.value === "NoOne"){
                Option.innerText = "Best Friends (Best Friends require RoQoL extension)"
                JoinPrivacy.value = "BestFriends"
            }
        })
    })
})