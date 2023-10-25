async function CreateThemesSection(List){
    const CustomList = document.createElement("div")
    CustomList.style = "display: flex; justify-content: center; margin-bottom: 16px;"

    const UploadContainer = document.createElement("div")
    UploadContainer.innerHTML = `<div class="ThemeUploadContainer"><label tabindex="0" type="button"><input accept=".jpg,.png,.jpeg,.gif" type="file" size="1000000" style="display: none;" class="customThemeUpload"><span>Upload Custom Theme</span><span class="ThemeUploadRipple"></span></label><span class="upload-subtitle error" style="color: rgba(247,75,82,255); display: none;"><span class="icon-warning"></span></span><span class="upload-subtitle">Format: *.jpg, *.png, *.gif</span><span class="upload-subtitle">Max file size: 1 MB</span><span class="upload-subtitle">Max resolution: 2048x2048</span></div>`

    const ThemeUpload = UploadContainer.getElementsByClassName("customThemeUpload")[0]
    const UploadErrorLabel = UploadContainer.getElementsByClassName("upload-subtitle error")[0]
    const UploadErrorTextNode = document.createTextNode("")
    UploadErrorLabel.appendChild(UploadErrorTextNode)

    PaidForFeature("CurrentTheme").then(function(Paid){
        if (Paid) return

        ThemeUpload.style = "pointer-events: none; cursor: pointer;"
        ThemeUpload.addEventListener("click", CreatePaymentPrompt)
    })

    ThemeUpload.addEventListener("change", function(e){
        const TargetFile = e.target.files[0]
        if (!TargetFile) return

        let reader = new FileReader()
        reader.onload = async function(File){
            UploadErrorLabel.style.display = "none"

            const [Success, Result] = await RequestFunc(WebServerEndpoints.Themes+"custom/upload", "POST", {"Content-Type": TargetFile.type}, File.target.result)
            if (!Success){
                UploadErrorTextNode.nodeValue = Result?.Result || "Internal Error"
                UploadErrorLabel.style.display = ""
                return
            }

            SetFeatureEnabled("CurrentTheme", Result)
        }
        reader.readAsArrayBuffer(TargetFile)
    })

    CustomList.appendChild(UploadContainer)

    const ThemesList = document.createElement("div")
    ThemesList.className = "themes-list"

    function CreateTheme(Name, CustomHandler){
        const Theme = document.createElement("a")
        Theme.className = "theme"

        const Button = document.createElement("a")
        Button.className = "theme-button"

        const Image = document.createElement("iframe")
        Image.className = "theme-frame"
        if (!Name.includes("http")) Image.src = `${WebServerEndpoints.Themes}theme?theme=${Name}`
        else Image.src = Name
        Image.style = "width: 100%; height: 100%"
        Theme.append(Button, Image)

        ThemesList.appendChild(Theme)

        if (!CustomHandler) Button.addEventListener("click", async function(){
            if (!await PaidForFeature("CurrentTheme")) return CreatePaymentPrompt()

            const ThemeInfo = await IsFeatureEnabled("CurrentTheme")
            if (ThemeInfo?.Theme === Name) return

            ThemeInfo.Theme = Name
            SetFeatureEnabled("CurrentTheme", ThemeInfo)
        })

        return [Theme, Button]
    }

    const Clear = document.createElement("a")
    const SVG = document.createElement("img")
    SVG.src = chrome.runtime.getURL("img/whitecross.svg")

    Clear.className = "theme clear-button"
    Clear.appendChild(SVG)

    Clear.addEventListener("click", async function(){
        const ThemeInfo = await IsFeatureEnabled("CurrentTheme")
        ThemeInfo.Theme = undefined
        SetFeatureEnabled("CurrentTheme", ThemeInfo)
    })

    ThemesList.appendChild(Clear)
    
    RequestFunc(WebServerEndpoints.Themes, "GET").then(function([Success, Body]){
        if (!Success){
            ThemesList.innerText = "An error occurred"
            return
        }

        for (let i = 0; i < Body.length; i++){
            CreateTheme(Body[i])
        }
    })

    let CustomThemeFrame
    function CreateCustomTheme(Theme){
        const [ThemeFrame, Button] = CreateTheme(Theme.Access, true)
        CustomThemeFrame = Theme

        const DeleteButton = document.createElement("a")
        const DeleteImage = document.createElement("img")
        DeleteImage.style = "width: 100%; height: 100%;"
        DeleteImage.src = chrome.runtime.getURL("img/filters/clearfilter.png")
        DeleteButton.appendChild(DeleteImage)

        DeleteButton.style = "position: absolute; height: 25px; margin: 8px; z-index: 5;"
        ThemeFrame.insertBefore(DeleteButton, ThemeFrame.children[0])

        DeleteButton.addEventListener("click", async function(){
            RequestFunc(WebServerEndpoints.Themes+"custom", "DELETE")
            ThemeFrame.remove()
            CustomThemeFrame = undefined

            const CurrentTheme = await IsFeatureEnabled("CurrentTheme")
            if (CurrentTheme && CurrentTheme.Theme === "custom"){
                CurrentTheme.Theme = undefined
                SetFeatureEnabled("CurrentTheme", CurrentTheme)
            }
        })

        Button.addEventListener("click", async function(){
            if (!await PaidForFeature("CurrentTheme")) return CreatePaymentPrompt()

            const ThemeInfo = await IsFeatureEnabled("CurrentTheme")
            if (ThemeInfo?.Theme === "custom") return

            ThemeInfo.Theme = "custom"
            SetFeatureEnabled("CurrentTheme", ThemeInfo)
        })
    }

    let LastThemeAccess
    IsFeatureEnabled("CurrentTheme").then(function(Theme){
        if (!Theme || !Theme.Access) return
        LastThemeAccess = Theme.Access
        CreateCustomTheme(Theme)
    })

    ListenForFeatureChanged("CurrentTheme", function(Theme){
        if (Theme) return
        if (Theme.Access == LastThemeAccess) return
        LastThemeAccess = Theme.Access
        if (CustomThemeFrame) CustomThemeFrame.remove()

        CreateCustomTheme(Theme)
    })

    List.append(CustomList, ThemesList)
}