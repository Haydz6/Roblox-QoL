IsFeatureEnabled("PreferredServerRegion").then(async function(Region){
    if (Region === "None") return
    
    const PlayButtonContainer = await WaitForId("game-details-play-button-container")
    await WaitForClassPath(PlayButtonContainer, "btn-common-play-game-lg")

    const PreferredButton = document.createElement("button")
    PreferredButton.className = "btn-common-play-game-lg btn-primary-md btn-full-width preferred-region-join-button"
    PreferredButton.style = "margin-left: 5px; width: 33%;"

    PreferredButton.setAttribute("data-toggle", "tooltip")
    PreferredButton.setAttribute("data-placement", "top")
    PreferredButton.setAttribute("data-original-title", "Join "+Region)

    const Span = document.createElement("span")
    Span.style = `height: 36px; width: 36px; display: inline-block; vertical-align: middle; background-image: url(${chrome.runtime.getURL("img/filters/region-icon.png")}); background-size: contain;`
    PreferredButton.appendChild(Span)

    ChildRemoved(PlayButtonContainer, function(Child){
        if (Child === PreferredButton) PlayButtonContainer.appendChild(PreferredButton)
    })

    PlayButtonContainer.appendChild(PreferredButton)
    InjectScript("TooltipPreferredRegion")

    function CreateJoiningModal(){
        const Backdrop = document.createElement("div")
        Backdrop.id = "simplemodal-overlay" 
        Backdrop.className = "simplemodal-overlay"
        Backdrop.style = "background-color: rgb(0, 0, 0); opacity: 0.8; height: 100%; width: 100%; position: fixed; left: 0px; top: 0px; z-index: 1041;"

        const Modal = document.createElement("div")
        Modal.id = "modal-dialog"
        Modal.className = "modal-dialog"
        Modal.innerHTML = `<div id="simplemodal-container" class="simplemodal-container" style="position: fixed; z-index: 1042; height: 272px; width: 400px; left: 50%; top: 50%; transform: translate(-50%, -50%);"><a class="modalCloseImg simplemodal-close" title="Close"></a><div tabindex="-1" class="simplemodal-wrap" style="height: 100%; outline: 0px; width: 100%; overflow: visible;"><div id="modal-confirmation" class="modal-confirmation noImage protocolhandler-starting-modal simplemodal-data" data-modal-type="confirmation" style="display: block;">
        <div id="modal-dialog" class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close top-right-close-button" data-dismiss="modal" style="">
                    <span aria-hidden="true"><span class="icon-close"></span></span><span class="sr-only">Close</span>
                </button>
                <h5 class="modal-title"></h5>
            </div>

            <div class="modal-body">
                <div class="modal-top-body">
                    <div class="modal-message"><span class="icon-logo-r-95"></span><p class="modal-message-label">Looking for a ${Region} server</p><span class="spinner spinner-default"></span></div>
                    <div class="modal-image-container roblox-item-image" data-image-size="medium" data-no-overlays="" data-no-click="">
                        <img class="modal-thumb" alt="generic image">
                    </div>
                    <div class="modal-checkbox checkbox" style="display: none;">
                        <input id="modal-checkbox-input" type="checkbox">
                        <label for="modal-checkbox-input"></label>
                    </div>
                </div>
                <div class="modal-btns">
                    <a id="decline-btn" class="btn-control-md" style="display: none;">No</a>
                    <a id="confirm-btn" class="btn-primary-md" style="display: none;">Yes</a>
                </div>
                <div class="loading modal-processing">
                    <img class="loading-default" src="https://images.rbxcdn.com/4bed93c91f909002b1f17f05c0ce13d1.gif" alt="Processing...">
                </div>
            </div>
            <div class="modal-footer text-footer" style="display: none;"></div>
        </div>
        </div>
        </div></div></div>`
        document.body.append(Backdrop, Modal)

        return [Modal, Backdrop]
    }

    PreferredButton.addEventListener("click", async function(){
        const PlaceId = await GetPlaceIdFromGamePage()

        const [Modal, Backdrop] = CreateJoiningModal()
        const MessageLabel = Modal.getElementsByClassName("modal-message-label")[0]
        const YesButton = Modal.getElementsByClassName("btn-primary-md")[0]
        const NoButton = Modal.getElementsByClassName("btn-control-md")[0]
        const Spinner = Modal.getElementsByClassName("spinner")[0]

        let Closed = false

        function RemoveSpinner(){
            Spinner.remove()
        }

        function RemoveModal(){
            Modal.remove()
            Backdrop.remove()
            Closed = true
        }

        Modal.getElementsByClassName("top-right-close-button")[0].addEventListener("click", RemoveModal)
        NoButton.addEventListener("click", RemoveModal)

        function JoinServer(JobId){
            document.dispatchEvent(new CustomEvent("joinGameInstance", {detail: {PlaceId: PlaceId, JobId: JobId}}))
        }

        function Fail(Text){
            MessageLabel.innerText = Text
            RemoveSpinner()

            NoButton.style = ""
            NoButton.innerText = "Close"
        }

        function CouldntFind(AlternativeJobId, AlternativeRegion){
            NoButton.style = ""
            RemoveSpinner()

            if (!AlternativeJobId){
                MessageLabel.innerText = "We could not find a server!"
                NoButton.innerText = "Close"
                return
            }
            NoButton.innerText = "Cancel"
            MessageLabel.innerText = `Would you like to join ${AlternativeRegion} instead?`

            YesButton.style = ""
            YesButton.innerText = "Join"
            YesButton.addEventListener("click", function(){
                RemoveModal()
                JoinServer(AlternativeJobId)
            })
        }

        function Found(JobId){
            RemoveModal()
            JoinServer(JobId)
        }

        let Cursor = ""
        const ClosestServers = []

        const CoordinateLookup = {}

        const [Success, Regions] = await RequestFunc("https://qol.haydz6.com/api/servers/regions", "GET")
        if (Success){
            for (let i = 0; i < Regions.length; i++){
                const Region = Regions[i]
                CoordinateLookup[Region.Region] = Region
            }
        }

        let Lat = CoordinateLookup[Region].Lat
        let Lng = CoordinateLookup[Region].Lng

        while (true){
            if (Closed) return

            const [Success, Result] = await GetRobloxServers(Cursor, null, true)
            if (!Success){
                Fail("An error occurred while looking for servers!")
                return
            }
            if (Closed) return

            Cursor = Result.nextPageCursor

            const JobIds = []
            for (let i = 0; i < Result.data.length; i++){
                JobIds.push(Result.data[i].id)
            }

            const [RegionSuccess, RegionResult] = await RequestFunc(WebServerEndpoints.Servers, "POST", undefined, JSON.stringify({PlaceId: PlaceId, JobIds: JobIds}))
            if (!RegionSuccess){
                Fail("An error occurred while looking for servers!")
                return
            }
            if (Closed) return

            for (let i = 0; i < RegionResult.length; i++){
                const RegionInfo = RegionResult[i]
                const Coordinates = CoordinateLookup[RegionInfo.Region]
                RegionInfo.Distance = Coordinates ? DistanceBetweenCoordinates(Coordinates.Lat, Coordinates.Lng, Lat, Lng) : 99999999
                ClosestServers.push(RegionInfo)

                if (RegionInfo.Region === Region){
                    Found(RegionInfo.JobId)
                    return
                }
            }

            if (!Cursor || ClosestServers.length >= 1000){
                //Look for alternative
                if (!Lat || !Lng) return CouldntFind()

                ClosestServers.sort(function(a, b){
                    return a.Distance - b.Distance
                })

                CouldntFind(ClosestServers[0]?.JobId, ClosestServers[0]?.Region)
                return
            }
        }
    })
})