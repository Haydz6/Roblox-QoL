function CreateSliderOption(Title, Range, Current, Callback, TextCallback){
    const Container = document.createElement("div")
    Container.style = "width: 100%; min-width: 300px; max-width: calc(50% - 10px); margin: 5px; border-radius: 6px; background-color: #1b1d1e; padding: 20px;"

    Container.innerHTML = `<h3></h3><div style="display: flex; justify-content: center;"><input type="range" class="slider" max=""><div class="current-input-label" style="background-color: #232527; width: 80px; text-align: center; height: 30px; margin-left: 23px; border-radius: 8px; line-height: 30px;"></div></div>`
    Container.getElementsByTagName("input")[0].setAttribute("max", Range)
    Container.getElementsByTagName("h3")[0].innerText = Title

    const CurrentInputLabel = Container.getElementsByClassName("current-input-label")[0]

    const Input = Container.getElementsByClassName("slider")[0]
    Input.value = Current
    Input.addEventListener("input", async function(){
        CurrentInputLabel.innerText = TextCallback(await Callback(Input.value))
    })
    CurrentInputLabel.innerText = TextCallback(Current)

    return Container
}

function CreateSettingsSection(){
    const Container = document.createElement("div")
    Container.style = "margin: 50px; display: flex; flex-wrap: wrap; justify-content: center; align-items: center;"

    IsFeatureEnabled("CurrentTheme").then(function(Theme){
        if (!Theme.Settings) Theme.Settings = {}

        //<span class="upload-subtitle error" style="color: rgba(247,75,82,255); display: none;"><span class="icon-warning"></span></span>

        const BlurContainer = CreateSliderOption("Theme Blur", 20, Theme.Settings.Blur || 0, function(Value){
            Theme.Settings.Blur = Value
            chrome.runtime.sendMessage({type: "ThemeSettings", key: "Blur", value: Value})
            return Value
        }, function(Value){
            return `${Value}px`
        })

        const BlurWarning = document.createElement("span")
        BlurWarning.className = "error"
        BlurWarning.style = "color: white;"
        BlurWarning.innerHTML = `<span class="icon-warning"></span>This will lag weak devices`
        BlurContainer.appendChild(BlurWarning)
        Container.append(BlurContainer)

        Container.append(CreateSliderOption("Foreground Opacity", 100, Math.round(Theme.Settings.Opacity*100) || 100, function(Value){
            Theme.Settings.Opacity = Value/100
            chrome.runtime.sendMessage({type: "ThemeSettings", key: "Opacity", value: Value/100})
            return Value
        }, function(Value){
            return `${Value}%`
        }))

        Container.append(CreateSliderOption("Brightness", 100, Math.round(Theme.Settings.Brightness*100) || 100, function(Value){
            Theme.Settings.Brightness = Value/100
            chrome.runtime.sendMessage({type: "ThemeSettings", key: "Brightness", value: Value/100})
            return Value
        }, function(Value){
            return `${Value}%`
        }))

        Container.append(CreateSliderOption("Saturation", 100, Math.round(Theme.Settings.Saturation*100) || 100, function(Value){
            Theme.Settings.Saturation = Value/100
            chrome.runtime.sendMessage({type: "ThemeSettings", key: "Saturation", value: Value/100})
            return Value
        }, function(Value){
            return `${Value}%`
        }))
    })

    return Container
}

async function CreateThemesSection(List){
    const CustomList = document.createElement("div")
    CustomList.style = "display: flex; justify-content: center; margin-bottom: 16px;"

    const UploadContainer = document.createElement("div")
    UploadContainer.innerHTML = `<div class="ThemeUploadContainer"><label tabindex="0" type="button"><input accept=".jpg,.png,.jpeg,.gif" type="file" size="1000000" style="display: none;" class="customThemeUpload"><span>Upload Custom Theme</span><span class="ThemeUploadRipple"></span></label><span class="spinner spinner-default" style="display: none;"></span><span class="upload-subtitle error" style="color: rgba(247,75,82,255); display: none;"><span class="icon-warning"></span></span><span class="upload-subtitle">Format: *.jpg, *.png, *.gif</span><span class="upload-subtitle">Max file size: 4 MB</span><span class="upload-subtitle">Max resolution: 2048x2048</span></div>`

    const ThemeUpload = UploadContainer.getElementsByClassName("customThemeUpload")[0]
    const UploadErrorLabel = UploadContainer.getElementsByClassName("upload-subtitle error")[0]
    const UploadErrorTextNode = document.createTextNode("")
    const UploadSpinner = UploadContainer.getElementsByClassName("spinner")[0]
    UploadErrorLabel.appendChild(UploadErrorTextNode)

    PaidForFeature("CurrentTheme").then(function(Paid){
        if (Paid) return

        ThemeUpload.style = "pointer-events: none; cursor: pointer; display: none;"
        ThemeUpload.addEventListener("click", CreatePaymentPrompt)
    })

    ThemeUpload.addEventListener("change", function(e){
        const TargetFile = e.target.files[0]
        if (!TargetFile) return

        let reader = new FileReader()
        reader.onload = async function(File){
            UploadErrorLabel.style.display = "none"
            UploadSpinner.style.display = ""

            const [Success, Result, Response] = await RequestFunc(WebServerEndpoints.Themes+"custom/upload", "POST", {"Content-Type": TargetFile.type}, File.target.result)
            UploadSpinner.style.display = "none"
            if (!Success){
                UploadErrorTextNode.nodeValue = Result?.Result != "???" ? Result.Result : Response?.statusText || "Internal Error"
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

        if (!CustomHandler) Button.addEventListener("click", async function(e){
            if (!await PaidForFeature("CurrentTheme")){
                CreatePaymentPrompt()
                return
            }

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

    List.append(CustomList, CreateSettingsSection(), ThemesList)
}