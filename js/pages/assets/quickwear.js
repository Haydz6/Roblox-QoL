setTimeout(function(){
    IsFeatureEnabled("AssetQuickWearV2").then(async function(Enabled){
      if (!Enabled) return
      
      const AssetId = GetAssetIdFromURL()
      const Type = window.location.href.includes("/bundles/") ? "Bundle" : window.location.href.includes("/catalog/") ? "Asset" : ""
      if (!Type || Type === "Bundle") return //Bundle currently not supported

      const [Success, _, Response] = await RequestFunc(`https://inventory.roblox.com/v1/users/${await GetUserId()}/items/${Type === "Asset" ? 0 : 3}/${AssetId}/is-owned`, "GET", undefined, undefined, true, true)
      if (!Success) return
      if ((await Response.text()) !== "true"){
        return
      }

      const [WearSuccess, WearResult] = await RequestFunc("https://avatar.roblox.com/v1/avatar", "GET", undefined, undefined, true)
      if (!WearSuccess) return
      let IsWearing = false

      for (let i = 0; i < WearResult.assets.length; i++){
        if (WearResult.assets[i].id === AssetId){
          IsWearing = true
          break
        }
      }

      function Status(Success, Text){

      }
      
      let IsRequesting = false

      function HandleResponse(Success, Result){
        if (Success){
            Status(true, "Wore item")
        } else {
            Status(false, Result?.errors?.[0]?.message || "An error occurred.")
        }
      }

      async function Wear(){
        //wear endpoint is deprecated and just removes all other items
        const [WearSuccess, WearResult] = await RequestFunc("https://avatar.roblox.com/v1/avatar", "GET", undefined, undefined, true)
        if (!WearSuccess) return

        const ToWear = [{id: AssetId}]
        const Assets = WearResult.assets

        for (let i = 0; i < Assets.length; i++){
          const Asset = Assets[i]
          ToWear.push({id: Asset.id, meta: Asset.meta})
        }

        const [Success, Result] = await RequestFunc("https://avatar.roblox.com/v2/avatar/set-wearing-assets", "POST", {"Content-Type": "application/json"}, JSON.stringify({assets: ToWear}), true)

        if (Success) IsWearing = true
        HandleResponse(Success, Result)
      }

      async function Unwear(){
        let Success, Result

        if (Type === "Asset"){
            [Success, Result] = await RequestFunc(`https://avatar.roblox.com/v1/avatar/assets/${AssetId}/remove`, "POST", undefined, undefined, true)
        } else {

        }

        if (Success) IsWearing = false
        HandleResponse(Success, Result)
      }

      const ButtonContainer = document.createElement("li")
      ButtonContainer.id = "quick-wear-asset"
      ButtonContainer.innerHTML = `<button role="button" data-toggle="False">Wear</button>`
      const Button = ButtonContainer.getElementsByTagName("button")[0]

      function UpdateButtonText(){
        Button.innerText = IsWearing ? "Take off" : "Wear"
        Button.setAttribute("data-toggle", IsWearing ? "True" : "False")
      }

      function Toggle(){
        if (IsRequesting) return
        IsRequesting = true

        if (IsWearing) Unwear()
        else Wear()

        UpdateButtonText()
        IsRequesting = false
      }

      Button.addEventListener("click", Toggle)

      Button.addEventListener("click", function(){
        IsWearing = !IsWearing
        UpdateButtonText()
      })
      
      const ContextMenu = await WaitForId("item-context-menu")
      ChildAdded(ContextMenu, true, function(Popover){
        if (!Popover.className.includes("popover")) return

        if (!document.getElementById("quick-wear-asset")) Popover.getElementsByClassName("dropdown-menu")[0].appendChild(ButtonContainer)
      })

      UpdateButtonText()
    })
}, 0)