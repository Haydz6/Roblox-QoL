IsFeatureEnabled("BestFriendInventoryV2").then(async function(Enabled){
    if (!Enabled || !await PaidForFeature("BestFriends")) return

    let CanView

    let PrivacyContainer
    let RequiresOAuth
    let OAuthButton

    function UpdateOAuthButton(){
        if (OAuthButton) OAuthButton.remove()
        OAuthButton = undefined

        if (!PrivacyContainer) return
        if (RequiresOAuth){
            OAuthButton = document.createElement("button")
            OAuthButton.className = "btn-primary-md"
            OAuthButton.innerText = "Give access for best friend inventory"

            OAuthButton.addEventListener("click", function(){
                chrome.runtime.sendMessage({type: "OAuthNewTab"})
                RequiresOAuth = false
                UpdateOAuthButton()
            })

            PrivacyContainer.appendChild(OAuthButton)
        }
    }

    async function FetchCanView(){
        if (CanView !== undefined) return CanView

        const [Success, Result] = await RequestFunc(WebServerEndpoints.BestFriends+"inventory/view", "GET")
        if (!Success) return
        CanView = Result.CanView
        RequiresOAuth = Result.RequiresOAuth

        UpdateOAuthButton()
    }

    async function UpdateCanView(){
        let CachedCanView = CanView
        const [Success, Result] = await RequestFunc(WebServerEndpoints.BestFriends+"inventory/setview", "POST", {"Content-Type": "application/json"}, JSON.stringify({CanView: CanView}))
        if (CachedCanView && Success && Result.OAuthRequired){
            //chrome.runtime.sendMessage({type: "OAuthNewTab"})
            RequiresOAuth = true
            UpdateOAuthButton()
        } else {
            RequiresOAuth = false
            UpdateOAuthButton()
        }
    }

    ChildAdded(await WaitForClass("tab-content"), true, function(Child){
        const Container = document.getElementById("privacy-settings") || document.getElementById("rbx-privacy-settings-header")
        if (!Container) return

        let DebounceCheck = false
        DescendantAdded(Child, true, async function(_, Disconnect){
            if (DebounceCheck) return
            DebounceCheck = true
            sleep(0)
            DebounceCheck = false

            const JoinPrivacy = document.getElementById("InventoryPrivacy")
            if (!JoinPrivacy || document.getElementById("best-friends-view-inventory")) return

            Disconnect()

            PrivacyContainer = document.getElementById("InventoryPrivacyLabel").parentNode

            const Option = document.createElement("option")
            Option.value = "BestFriends"
            Option.id = "best-friends-view-inventory"
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
                    Option.innerText = "Best Friends (13+ account required, Best Friends require RoQoL extension)"

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
                Option.innerText = "Best Friends (13+ account required, Best Friends require RoQoL extension)"
                JoinPrivacy.value = "BestFriends"
            }
        })
    })
})