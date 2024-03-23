function CreateSliderOption(Title, Range, Current, Callback, TextCallback){
    const Container = document.createElement("div")
    Container.className = "theme-option"

    Container.innerHTML = `<h3></h3><div style="display: flex; justify-content: center;"><input type="range" class="slider" max=""><div class="current-input-label"></div></div>`
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

function CreateDropdownOption(Title, Options, Current, Callback, TextCallback){
    const Container = document.createElement("div")
    Container.className = "theme-option"

    Container.innerHTML = `<h3></h3><div style="display: flex; justify-content: center;"><select class="input-field select-option rbx-select"><span class="icon-arrow icon-down-16x16"></span></div>`
    Container.getElementsByTagName("h3")[0].innerText = Title

    const Input = Container.getElementsByClassName("input-field")[0]
    for (let i = 0; i < Options.length; i++){
        const Option = document.createElement("option")
        Option.value = Options[i]
        Option.innerText = TextCallback(Options[i])

        Input.appendChild(Option)
    }

    Input.value = Current

    Input.addEventListener("change", async function(){
        //CurrentInputLabel.innerText = TextCallback(await Callback(Input.value))
        await Callback(Input.value)
    })
    //CurrentInputLabel.innerText = TextCallback(Current)

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

        Container.append(CreateDropdownOption("Background Repeat", ["no-repeat", "repeat", "repeat-x", "repeat-y", "round", "space"], Theme.Settings.BackgroundRepeat || "repeat", function(Value){
            Theme.Settings.BackgroundRepeat = Value
            chrome.runtime.sendMessage({type: "ThemeSettings", key: "BackgroundRepeat", value: Value})
            return Value
        }, function(Value){
            return Value
        }))

        Container.append(CreateDropdownOption("Video Fit", ["cover", "contain", "fill", "none", "scale-down"], Theme.Settings.VideoFit || "cover", function(Value){
            Theme.Settings.VideoFit = Value
            chrome.runtime.sendMessage({type: "ThemeSettings", key: "VideoFit", value: Value})
            return Value
        }, function(Value){
            return Value
        }))
    })

    return Container
}

async function WaitForThemeUploadFinish(Result){
    if (!Result.PollingUrl) return

    while (true){
        const [Success, Data] = await RequestFunc(Result.PollingUrl, "GET")
        if (!Success || Data.Completed) break

        await sleep(1000)
    }
}

async function UploadTheme(Buffer, Type, Size, Callback){
    Callback("Requesting upload url")
    const [Success, Result, Response] = await RequestFunc(WebServerEndpoints.ThemesV2+"custom/upload", "POST", {"Content-Type": "application/json"}, JSON.stringify({Size: Size, Type: Type}))
    if (!Success) return [Success, Result, Response]

    if (Result.Urls){
        //Multi upload

        const Promises = []
        const FileBlob = new Blob([Buffer])

        const ChunkSize = Result.ChunkSize

        const Etags = []
        let UploadedCount = 0

        for (let i = 0; i < Result.Urls.length; i++){
            const Id = i
            const Url = Result.Urls[Id]
            const StartChunk = Id * ChunkSize

            const Promise = RequestFunc(Url, "PUT", {"Content-Type": Type}, FileBlob.slice(StartChunk, StartChunk + ChunkSize))
            Promise.then(function([Success, _, Response]){
                if (Success){
                    const partNumber = parseInt(new URLSearchParams(Url.split("?")[1]).get("partNumber"))
                    Etags[Id] = {tag: Response.headers.get("Etag"), partNumber: partNumber}

                    UploadedCount ++
                    Callback(`Uploading ${UploadedCount}/${Result.ChunkCount}`)
                }
            })

            Promises.push(Promise)
        }

        Callback(`Uploading 0/${Result.ChunkCount}`)

        const Results = await Promise.all(Promises)
        for (let i = 0; i < Results.length; i++){
            const [Success, Result, Response] = Results[i]
            if (!Success) return [Success, Result, Response]
        }

        Callback("Completing Upload")

        const MultipartCompleteBody = {FileKey: Result.FileKey, UploadId: Result.UploadId, Etags: Etags}
        const [MultiSuccess, MultiResult, MultiResponse] = await RequestFunc(WebServerEndpoints.ThemesV2+"custom/upload/multipart", "POST", {"Content-Type": "application/json"}, JSON.stringify(MultipartCompleteBody))
        if (!MultiSuccess) return [MultiSuccess, MultiResult, MultiResponse]

        Callback("Waiting for file to be processed")
        await WaitForThemeUploadFinish(Result)

        return [Success, Result, Response]
    }

    //Single upload
    const formData = new FormData()
    for (const [k, v] of Object.entries(Result.Fields)){
        formData.set(k, v)
    }
    formData.set("file", new Blob([Buffer]))

    Callback("Uploading")

    const [SuccessUpload, ResultUpload, ResponseUpload] = await RequestFunc(Result.UploadUrl, "POST", undefined, formData)
    if (!SuccessUpload) return [SuccessUpload, ResultUpload, ResponseUpload]

    Callback("Waiting for file to be processed")
    await WaitForThemeUploadFinish(Result)

    return [Success, Result, Response]
}

async function CreateThemesSection(List){
    const CustomList = document.createElement("div")
    CustomList.style = "display: flex; justify-content: center; margin-bottom: 16px;"

    const UploadContainer = document.createElement("div")
    UploadContainer.innerHTML = `<div class="ThemeUploadContainer"><label tabindex="0" type="button"><input type="file" style="display: none;" class="customThemeUpload"><span>Upload Custom Theme</span><span class="ThemeUploadRipple"></span></label><span class="spinner spinner-default" style="display: none;"></span><span class="upload-subtitle status" style="display: none;"></span><span class="upload-subtitle error" style="color: rgba(247,75,82,255); display: none;"><span class="icon-warning"></span></span></div>`

    const ThemeUploadContainer = UploadContainer.getElementsByClassName("ThemeUploadContainer")[0]
    const ThemeUpload = UploadContainer.getElementsByClassName("customThemeUpload")[0]
    const UploadErrorLabel = UploadContainer.getElementsByClassName("upload-subtitle error")[0]
    const UploadStatusLabel = UploadContainer.getElementsByClassName("upload-subtitle status")[0]
    const UploadErrorTextNode = document.createTextNode("")
    const UploadSpinner = UploadContainer.getElementsByClassName("spinner")[0]
    UploadErrorLabel.appendChild(UploadErrorTextNode)

    PaidForFeature("CurrentTheme").then(function(Paid){
        if (Paid) return

        ThemeUpload.style = "pointer-events: none; cursor: pointer; display: none;"
        ThemeUpload.addEventListener("click", CreatePaymentPrompt)
    })

    function CreateUploadSubtitle(Text){
        const Label = document.createElement("span")
        Label.className = "upload-subtitle"
        Label.innerText = Text

        ThemeUploadContainer.appendChild(Label)

        return Label
    }

    RequestFunc(WebServerEndpoints.ThemesV2+"custom/metadata", "GET").then(function([Success, Result]){
        if (!Success){
            CreateUploadSubtitle("Failed to fetch metadata").style.color = "rgba(247,75,82,255)"
            return
        }

        let Accept = ""
        for (let i = 0; i < Result.Formats.length; i++){
            const Format = Result.Formats[i]
            if (Accept != "") Accept += ", "
            Accept += "*."+Format
        }

        ThemeUpload.setAttribute("accept", Accept)

        CreateUploadSubtitle("Format: " + Accept)
        CreateUploadSubtitle(`Image: ${Result.MaxFileSizes.image} max, Video: ${Result.MaxFileSizes.video} max`)
    })

    ThemeUpload.addEventListener("change", function(e){
        const TargetFile = e.target.files[0]
        if (!TargetFile) return

        let reader = new FileReader()
        reader.onload = async function(File){
            UploadErrorLabel.style.display = "none"
            UploadSpinner.style.display = ""

            //const [Success, Result, Response] = await RequestFunc(WebServerEndpoints.ThemesV2+"custom/upload", "POST", {"Content-Type": TargetFile.type}, File.target.result)
            
            UploadStatusLabel.style.display = ""
            const [Success, Result, Response] = await UploadTheme(File.target.result, TargetFile.type, File.target.result.byteLength, function(Status){
                UploadStatusLabel.innerText = Status
            })
            UploadStatusLabel.style.display = "none"

            if (!Success){
                UploadErrorTextNode.nodeValue = Result?.Result != "???" ? Result.Result : Response?.statusText || "Internal Error"
                UploadErrorLabel.style.display = ""
                UploadSpinner.style.display = "none"

                if (Result.FileKey) RequestFunc(WebServerEndpoints.ThemesV2+"custom/upload/fail", "POST", {"Content-Type": "application/json"}, JSON.stringify({FileKey: Result.FileKey, UploadId: Result.UploadId}))

                return
            }

            UploadSpinner.style.display = "none"

            SetFeatureEnabled("CurrentTheme", Result.Theme)
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
            RequestFunc(WebServerEndpoints.ThemesV2+"custom", "DELETE")
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