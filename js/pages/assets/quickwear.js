setTimeout(function(){
    IsFeatureEnabled("AssetQuickWear").then(async function(Enabled){
      if (!Enabled) return
      
      const AssetId = GetAssetIdFromURL()
      const Type = window.location.href.includes("/bundles/") ? "Bundle" : window.location.href.includes("/catalog/") ? "Asset" : ""
      if (!Type) return

      const [Success, _, Response] = await RequestFunc(`https://inventory.roblox.com/v1/users/${await GetUserId()}/items/${Type === "Asset" ? 0 : 3}/${AssetId}/is-owned`, "GET", undefined, undefined, true, true)
      if (!Success) return
      if ((await Response.text()) !== "true"){
        return
      }

    //   function Status(Success, Text){

    //   }
      
    //   let IsWearing = true
    //   let IsRequesting = false

    //   function HandleResponse(Success, Result){
    //     if (Success){
    //         Status(true, "Wore item")
    //     } else {
    //         Status(false, Result?.errors?.[0]?.message || "An error occurred.")
    //     }
    //   }

    //   function Wear(){
    //     let Success, Result

    //     if (Type === "Asset"){
    //         [Success, Result] = RequestFunc(`https://avatar.roblox.com/v1/avatar/assets/${AssetId}/wear`, "POST", undefined, undefined, true)
    //     } else {

    //     }

    //     if (Success) IsWearing = true
    //     HandleResponse(Success, Result)
    //   }

    //   function Unwear(){
    //     if (Type === "Asset"){
    //         [Success, Result] = RequestFunc(`https://avatar.roblox.com/v1/avatar/assets/${AssetId}/remove`, "POST", undefined, undefined, true)
    //     } else {

    //     }

    //     if (Success) IsWearing = false
    //     HandleResponse(Success, Result)
    //   }

      const [WearSuccess, WearResult] = await RequestFunc(`https://avatar.roblox.com/v1/users/${await GetUserId()}/currently-wearing`, "GET", undefined, undefined, true)
      if (!WearSuccess) return
      let IsWearing = WearResult.assetIds.includes(AssetId)

      const ButtonContainer = document.createElement("li")
      ButtonContainer.innerHTML = `<button class="toggle-wear" role="button" data-toggle="False">Wear</button>`
      const Button = ButtonContainer.getElementsByTagName("button")[0]

      function UpdateButtonText(){
        Button.innerText = IsWearing ? "Take off" : "Wear"
        Button.setAttribute("data-toggle", IsWearing ? "True" : "False")
      }

    //   function Toggle(){
    //     if (IsRequesting) return
    //     IsRequesting = true

    //     if (IsWearing) Unwear()
    //     else Wear()

    //     UpdateButtonText()
    //     IsRequesting = false
    //   }

    //   Button.addEventListener("click", Toggle)

      Button.addEventListener("click", function(){
        IsWearing = !IsWearing
        UpdateButtonText()
      })
      
      const ContextMenu = await WaitForId("item-context-menu")
      ChildAdded(ContextMenu, true, function(Popover){
        if (!Popover.className.includes("popover")) return

        Popover.getElementsByClassName("dropdown-menu")[0].appendChild(ButtonContainer)
      })

      UpdateButtonText()
    })
}, 0)