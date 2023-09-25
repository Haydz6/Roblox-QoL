function CreateSettingNavigationButton(Text, href){
    const ListButton = document.createElement("li")
    ListButton.className = "menu-option ng-scope"
    ListButton.setAttribute("ng-repeat", "tab in accountsTabs")
    ListButton.setAttribute("ng-class", "{'active': currentData.activeTab == tab.name}")

    const Button = document.createElement("a")
    Button.className = "menu-option-content"
    Button.setAttribute("ui-sref", "qol-settings")
    if (href) Button.href = href

    const Span = document.createElement("span")
    Span.className = "font-caption-header ng-binding"
    Span.setAttribute("ng-bind", "tab.label")
    Span.innerText = Text

    Button.appendChild(Span)
    ListButton.appendChild(Button)

    return [ListButton, Button, Span]
}

function CreateSectionSettingsTemplate(Option, Title, Description){
    const Section = document.createElement("div")
    Section.className = "section-content notifications-section"

    const TitleLabel = document.createElement("label")
    //TitleLabel.setAttribute("for", `${Option}-toggle`)
    TitleLabel.className = "btn-toggle-label ng-binding"
    TitleLabel.innerText = Title

    Section.appendChild(TitleLabel)

    let Divider
    if (Description !== ""){
        Divider = document.createElement("div")
        Divider.className = "rbx-divider"

        const DescriptionDiv = document.createElement("div")
        Description.id = `${Option}-description`
        DescriptionDiv.className = "text-description ng-binding ng-scope"

        const DescriptionTextElement = document.createElement("text")
        DescriptionTextElement.innerText = Description

        DescriptionDiv.appendChild(DescriptionTextElement)

        Section.append(Divider, DescriptionDiv)
    }

    return [Section, Divider]
}

function CreateFeatureDisabled(){
    const Container = document.createElement("div")
    Container.style = "display: flex;"

    const Icon = document.createElement("span")
    Icon.className = "icon-warning"
    
    const Text = document.createElement("p")
    Text.style = "color: #e44950;"
    Text.innerText = "This feature has been disabled"

    Container.append(Icon, Text)

    return Container
}

function CreateFeatureNotSupported(){
    const Container = document.createElement("div")
    Container.style = "display: flex;"

    const Icon = document.createElement("span")
    Icon.className = "icon-warning"
    
    const Text = document.createElement("p")
    Text.style = "color: #e44950;"
    Text.innerText = "This feature is not supported on your browser"

    Container.append(Icon, Text)

    return Container
}

function CreateFeaturePaid(){
    const Container = document.createElement("div")
    Container.style = "display: flex;"

    const Icon = document.createElement("span")
    Icon.className = "icon-warning"
    
    const Text = document.createElement("a")
    Text.style = "color: #e44950;"
    Text.innerText = "This feature is paid"
    Text.href = WebServerURL+"pages/pricing"

    Container.append(Icon, Text)

    return Container
}

function CreateSectionSettingsToggable(Option, Title, Description, Enabled, FeatureKilled, FeaturePaid, IsSupported){
    const [Section, Divider] = CreateSectionSettingsTemplate(Option, Title, Description)

    const Slider = document.createElement("button")
    Slider.id = `${Option}-toggle`
    Slider.className = `btn-toggle receiver-destination-type-toggle ${Enabled && "on" || "off"}`
    Slider.setAttribute("role", "switch")
    if (FeatureKilled){
        Slider.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeatureDisabled(), Divider)
    } else if (!IsSupported){
        Slider.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeatureNotSupported(), Divider)
    } else if (!FeaturePaid){
        Slider.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeaturePaid(), Divider)
    }

    Slider.addEventListener("click", function(){
        Enabled = !Enabled
        Slider.className = `btn-toggle receiver-destination-type-toggle ${Enabled && "on" || "off"}`
        SetFeatureEnabled(Option, Enabled)
    })
    
    const ToggleFlip = document.createElement("span")
    ToggleFlip.className = "toggle-flip"

    const ToggleOn = document.createElement("span")
    ToggleOn.className = "toggle-on"
    ToggleOn.id = "toggle-on"

    const ToggleOff = document.createElement("span")
    ToggleOff.className = "toggle-off"
    ToggleOff.id = "toggle-off"

    Slider.appendChild(ToggleFlip)
    Slider.appendChild(ToggleOn)
    Slider.appendChild(ToggleOff)

    Section.insertBefore(Slider, Section.firstChild)

    return Section
}

function CreateSectionSettingsInputBox(Option, Title, Description, Placeholder, Value, FeatureKilled, FeaturePaid, IsSupported, Middleman){
    const [Section, Divider] = CreateSectionSettingsTemplate(Option, Title, Description)

    const Input = document.createElement("input")
    Input.className = "form-control input-field new-input-field"
    Input.placeholder = Placeholder
    Input.maxLength = 4
    Input.autocomplete = false
    Input.autocapitalize = false
    Input.spellcheck = false
    Input.placeholder = Placeholder
    Input.style = "width: 80px; float: right; height: 33px;"
    Input.value = Value
    if (FeatureKilled){
        Input.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeatureDisabled(), Divider)
    } else if (!IsSupported){
        Input.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeatureNotSupported(), Divider)
    } else if (!FeaturePaid){
        Input.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeaturePaid(), Divider)
    }

    async function FocusLost(){
        const Result = Middleman(Option, await IsFeatureEnabled(Option), Input.value)
        if (Result){
            Input.value = Result
        }
    }

    Input.addEventListener("focusout", FocusLost)
    FocusLost()

    Section.insertBefore(Input, Section.firstChild)

    return Section
}

function CreateSectionSettingsWithListAndSearch(Feature, Title, Description, Get, Update, State, Search, GetIcon, ItemType, FeatureEnabled, FeatureKilled, FeaturePaid, IsSupported){
    const Section = document.createElement("div")
    Section.className = "section-content"

    Section.innerHTML = `<div class="form-group"> <label ng-bind="'Label.FriendsAllowed' | translate" class="ng-binding title-label">Group Shout Notifications</label> <button id="${Title}-access-toggle" role="switch" aria-checked="false" class="pull-right btn-toggle" ng-class="{'on': server.permissions.friendsAllowed}" ng-click="toggleFriendsAccess()" ng-disabled="!server.active"> <span class="toggle-flip"></span> <span class="toggle-on"></span> <span class="toggle-off"></span> </button> </div> <div class="rbx-divider"></div> <div class="form-group"> <span ng-bind="'Label.ServerMembers' | translate" class="ng-binding description-label">Groups</span> <button id="add-${Title}-button" type="button" class="add-button btn-control-xs pull-right ng-binding" ng-disabled="!server.active" ng-click="openAddPlayersDialog()" ng-bind="'Action.AddPlayers' | translate">Add</button> </div> <div class="form-group"> <div class="select-players-container border"> <div class="selected-players"> <!-- ngRepeat: player in server.permissions.users | orderBy: 'name' --> </div> </div> </div>`
    Section.getElementsByClassName("title-label")[0].innerText = Title
    Section.getElementsByClassName("description-label")[0].innerText = Description

    const Toggle = Section.getElementsByClassName("btn-toggle")[0]
    const AddButton = Section.getElementsByClassName("add-button")[0]
    const SelectedList = Section.getElementsByClassName("selected-players")[0]

    const NameLookup = {}

    let IsEnabled = false

    if (FeatureKilled){
        Toggle.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeatureDisabled(), Divider)
        return
    } else if (!IsSupported){
        Toggle.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeatureNotSupported(), Divider)
        return
    } else if (!FeaturePaid){
        Toggle.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeaturePaid(), Divider)
        return
    }

    function UpdateEnabled(){
        Toggle.className = `pull-right btn-toggle ${IsEnabled ? "on" : ""}`
    }

    const BatchCache = {}
    const Batch = {}
    function BatchCalls(GroupId, Callback){
        return new Promise(async(resolve) => {
            if (BatchCache[Callback]?.[GroupId]) return BatchCache[Callback]?.[GroupId]

            if (!Batch[Callback]) Batch[Callback] = []

            Batch[Callback].push({id: GroupId, resolve: resolve})
            if (Batch[Callback].length !== 1) return
            await sleep(100)

            const Queue = Batch[Callback]
            delete Batch[Callback]

            const Ids = []
            for (let i = 0; i < Queue.length; i++){
                if (Ids.indexOf(Queue[i].id) === -1) Ids.push(Queue[i].id)
            }

            const Lookup = await Callback(ItemType, Ids)
            for (let i = 0; i < Queue.length; i++){
                const Result = Lookup[Queue[i].id]

                if (Result){
                    if (!BatchCache[Callback]) BatchCache[Callback] = {}
                    BatchCache[Callback][GroupId] = Result
                }
                Queue[i].resolve(Result || "")
            }
        })
    }

    async function GetGroupName(GroupId){
        if (ItemType === "User"){
            return BatchCalls(GroupId, async function(Ids){
                const [Success, Result] = await RequestFunc("https://users.roblox.com/v1/users", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: Ids, excludeBannedUsers: false}))
                if (!Success) return {}

                const Data = Result.data
                const Lookup = {}

                for (let i = 0; i < Data.length; i++){
                    const User = Data[i]
                    Lookup[User.id] = User
                }

                return Lookup
            })
        }

        if (NameLookup[GroupId]) return NameLookup[GroupId]

        const [Success, Body] = await RequestFunc(`https://groups.roblox.com/v1/groups/${GroupId}`, "GET", undefined, undefined, true)
        if (!Success) return "???"

        const Name = Body.name
        NameLookup[GroupId] = Name
        return Name
    }

    function CreateItem(GroupId){
        const Button = document.createElement("button")
        Button.className = "selected-player btn-secondary-sm"
        Button.innerHTML = `<thumbnail-2d class="avatar-headshot avatar-headshot-xs ng-isolate-scope" thumbnail-type="thumbnailTypes.avatarHeadshot" thumbnail-target-id="player.id"><span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot" thumbnail-target-id="293963514"> <!-- ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --><img ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()" thumbnail-error="$ctrl.setThumbnailLoadFailed" ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load="" alt="" title="" class="ng-scope ng-isolate-scope image-thumbnail-icon"><!-- end ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --> <!-- ngIf: $ctrl.thumbnailUrl && $ctrl.isLazyLoadingEnabled() --> </span> </thumbnail-2d> <span ng-bind="layout.isDisplayNamesEnabled ? player.displayName : player.name" class="ng-binding item-name"></span> <span class="icon-close-16x16 player-select-cancel"></span>`
        Button.getElementsByClassName("item-name")[0].innerText = "..."

        GetGroupName(GroupId).then(function(Name){
            if (typeof(Icon) === "object"){
                Button.getElementsByClassName("item-name")[0].innerText = Name.name
                return
            }

            Button.getElementsByClassName("item-name")[0].innerText = Name
        })

        Button.addEventListener("click", function(){
            Update(FeatureEnabled, GroupId, false)
            Button.remove()
        })

        BatchCalls(GroupId, GetIcon).then(function(Icon){
            Button.getElementsByClassName("image-thumbnail-icon")[0].src = Icon
        })

        SelectedList.appendChild(Button)
    }

    Toggle.addEventListener("click", function(){
        IsEnabled = !IsEnabled
        UpdateEnabled()
        State(FeatureEnabled, IsEnabled)
    })

    function CreateSearchItem(Info){
        const Item = document.createElement("li")
        Item.className = "search-result"
        Item.innerHTML = `<a id="search-dropdown-result" class="search-result-format" ng-click="$ctrl.selectOption(searchResult)"> <thumbnail-2d thumbnail-type="$ctrl.thumbnailType" thumbnail-target-id="searchResult.id" class="search-result-icon ng-isolate-scope avatar-headshot" ng-class="{'avatar-headshot': $ctrl.thumbnailType === $ctrl.thumbnailTypes.avatarHeadshot}"><span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot" thumbnail-target-id="1264827"> <!-- ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --><img ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()" thumbnail-error="$ctrl.setThumbnailLoadFailed" ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load="" alt="" title="" class="ng-scope ng-isolate-scope image-thumbnail-icon"><!-- end ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --> <!-- ngIf: $ctrl.thumbnailUrl && $ctrl.isLazyLoadingEnabled() --> </span> </thumbnail-2d> <!-- ngIf: !searchResult.displayName || !$ctrl.layout.isDisplayNamesEnabled --> <!-- ngIf: searchResult.displayName && $ctrl.layout.isDisplayNamesEnabled --><div class="search-result-name text-overflow ng-scope ng-isolate-scope" paired-name="" display-name="DWDW " user-name="DWDW " ng-if="searchResult.displayName &amp;&amp; $ctrl.layout.isDisplayNamesEnabled"><span class="paired-name"> <span class="element ng-binding" ng-bind="displayName"></span> <span class="connector"></span> <span class="element name-container ng-binding" ng-bind="userName"></span> </span></div><!-- end ngIf: searchResult.displayName && $ctrl.layout.isDisplayNamesEnabled --> </a>`
    
        Item.addEventListener("mouseenter", function(){
            Item.className = "search-result active"
        })

        Item.addEventListener("mouseleave", function(){
            Item.className = "search-result"
        })

        Item.getElementsByClassName("name-container")[0].innerText = Info.name+" "

        GetIcon(ItemType, [Info.id]).then(function(Icons){
            Item.getElementsByClassName("image-thumbnail-icon")[0].src = Icons[Info.id] || ""
        })

        return Item
    }

    function CreatePendingItem(Info){
        const Item = document.createElement("div")
        Item.className = "avatar-card-container"
        Item.innerHTML = `<div class="avatar avatar-headshot avatar-headshot-xs"> <a class="avatar-card-link" ng-href="" target="_blank"> <thumbnail-2d class="avatar-card-image ng-isolate-scope" thumbnail-type="thumbnailTypes.avatarHeadshot" thumbnail-target-id="player.id"><span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot" thumbnail-target-id="32688155"> <!-- ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --><img ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()" thumbnail-error="$ctrl.setThumbnailLoadFailed" ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load="" alt="" title="" class="ng-scope ng-isolate-scope image-thumbnail-icon"><!-- end ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --> <!-- ngIf: $ctrl.thumbnailUrl && $ctrl.isLazyLoadingEnabled() --> </span> </thumbnail-2d> </a> </div> <div class="avatar-card-caption"> <div class="avatar-name text-overflow ng-binding" ng-bind="layout.isDisplayNamesEnabled ? player.displayName : player.name"></div> </div> <span ng-click="removeUser($index)" class="delete-btn icon-trash-bin"></span>`
    
        Item.getElementsByClassName("avatar-name")[0].innerText = Info.name

        GetIcon(ItemType, [Info.id]).then(function(Icons){
            Item.getElementsByClassName("image-thumbnail-icon")[0].src = Icons[Info.id] || ""
        })

        return Item
    }

    AddButton.addEventListener("click", function(){
        const Modal = document.createElement("div")
        Modal.className = "modal ng-scope ng-isolate-scope in"
        Modal.style = "z-index: 1050; display: block;"
        Modal.innerHTML = `<div class="modal-dialog"><div class="modal-content" uib-modal-transclude=""><div id="add-players" class="ng-scope"> <div class="modal-header"> <button type="button" class="close" ng-click="$dismiss()"> <span aria-hidden="true"><span class="icon-close"></span></span> </button> <h4 ng-bind="'Action.AddPlayers' | translate" class="ng-binding">Add</h4> </div> <div class="modal-body"> <search-dropdown target-type="User" select="selectUser" class="ng-isolate-scope"><div class="form-has-feedback search-dropdown dropdown" uib-dropdown="" is-open="$ctrl.layout.isOpen" keyboard-nav="" ng-class="{'form-has-error': $ctrl.layout.errorMessage}"> <input id="add-users-textbox" class="input-field form-control ng-pristine ng-valid ng-isolate-scope dropdown-toggle ng-empty ng-touched" uib-dropdown-toggle="" ng-model="$ctrl.data.searchTerm" focus-me="true" placeholder="Name" ng-keyup="$ctrl.search($event)" ng-keydown="$ctrl.onKeyDown($event)" ng-disabled="$ctrl.layout.isLoading" aria-haspopup="true" aria-expanded="false"> <ul class="dropdown-menu search-results-dropdown-menu" uib-dropdown-menu="" role="menu"> <li ng-show="$ctrl.layout.isSearchRequestSending" class="search-result"></li> <!-- ngRepeat: searchResult in $ctrl.data.searchResults --> </ul> <!-- ngIf: $ctrl.layout.errorMessage --> </div></search-dropdown> <div class="player-avatar-cards rbx-scrollbar"> <!-- ngRepeat: player in players --> <div class="avatar-card" ng-show="layout.isLoadingUser"> </div> </div> </div> <div class="modal-buttons"> <button id="whitelist-players-button" class="modal-button btn-primary-md ng-binding" ng-click="addPlayers()" ng-bind="'Action.Add' | translate">Add</button> <button id="cancel-whitelist-players-button" class="modal-button btn-control-md ng-binding" ng-click="close()" ng-bind="'Action.Cancel' | translate">Cancel</button> </div> </div></div></div>`
    
        const Backdrop = document.createElement("div")
        Backdrop.className = "modal-backdrop ng-scope in"
        Backdrop.style = "z-index: 1040;"

        function RemoveModal(){
            Modal.remove()
            Backdrop.remove()
        }

        Modal.getElementsByClassName("close")[0].addEventListener("click", RemoveModal)

        const DropdownMenu = Modal.getElementsByClassName("search-results-dropdown-menu")[0]
        const SearchList = Modal.getElementsByClassName("search-result")[0]
        const InputField = Modal.getElementsByClassName("input-field")[0]
        const PendingList = Modal.getElementsByClassName("avatar-card")[0]
        let PendingItems = []
        let SearchUpdate = 0
        
        InputField.addEventListener("input", async function(){
            SearchUpdate++
            let Cache = SearchUpdate
            const Text = InputField.value
            SearchList.replaceChildren()
            DropdownMenu.style.display = "none"

            if (Text.replaceAll(" ", "") === "") return
            DropdownMenu.style.display = "block"
            const Spinner = document.createElement("span")
            Spinner.className = "spinner spinner-default"
            SearchList.appendChild(Spinner)

            await sleep(500) //wait for typing to finish
            if (SearchUpdate !== Cache) return
            const Result = await Search(ItemType ,Text)
            if (SearchUpdate !== Cache) return

            Spinner.remove()

            for (let i = 0; i < Result.length; i++){
                const Group = Result[i]

                const SearchItem = CreateSearchItem(Group)
                SearchItem.addEventListener("click", function(){
                    PendingItems.push(Group.id)
                    NameLookup[Group.id] = Group.name

                    const PendingItem = CreatePendingItem(Group)
                    PendingList.appendChild(PendingItem)
                    PendingItem.getElementsByClassName("delete-btn")[0].addEventListener("click", function(){
                        PendingItem.remove()
                        PendingItems.splice(PendingItems.indexOf(Group.id), 1)
                    })

                    InputField.value = ""

                    SearchList.replaceChildren()
                    DropdownMenu.style.display = "none"
                })

                SearchList.appendChild(SearchItem)
            }
        })

        const Buttons = Modal.getElementsByClassName("modal-buttons")[0]
        Buttons.getElementsByClassName("btn-control-md")[0].addEventListener("click", RemoveModal)

        Buttons.getElementsByClassName("btn-primary-md")[0].addEventListener("click", function(){
            for (let i = 0; i < PendingItems.length; i++){
                CreateItem(PendingItems[i])
                Update(FeatureEnabled, PendingItems[i], true)
            }
            RemoveModal()
        })

        document.body.append(Modal, Backdrop)
    })

    const [Enabled, Items] = Get(FeatureEnabled)
    IsEnabled = Enabled
    UpdateEnabled()

    for (let i = 0; i < Items.length; i++){
        CreateItem(Items[i])
    }
    
    //Call Update when one is added
    
    return Section
}

function CreateSectionSettingsDropdown(Option, Title, Description, Options, Value, FeatureKilled, FeaturePaid, IsSupported, Update){
    const [Section, Divider] = CreateSectionSettingsTemplate(Option, Title, Description)

    const Dropdown = document.createElement("div")
    Dropdown.style = "max-width: 255px; float: right; margin-top: -5px;"
    
    const Selections = document.createElement("select")
    Selections.className = "input-field select-option rbx-select"
    if (FeatureKilled){
        Selections.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeatureDisabled(), Divider)
    } else if (!IsSupported){
        Selections.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeatureNotSupported(), Divider)
    } else if (!FeaturePaid){
        Selections.setAttribute("disabled", "disabled")
        Section.insertBefore(CreateFeaturePaid(), Divider)
    }

    for (let i = 0; i < Options.length; i++){
        const Option = document.createElement("option")
        Option.text = Options[i]
        Selections.add(Option)

        if (Options[i] == Value){
            Selections.selectedIndex = i
        }
    }

    Selections.addEventListener("change", function(){
        Update(Selections.value)
    })

    const DownArrow = document.createElement("span")
    DownArrow.className = "icon-arrow icon-down-16x16"

    Dropdown.append(Selections, DownArrow)
    Section.insertBefore(Dropdown, Section.firstChild)

    return Section
}

function CreateSuccessDialog(Title, Description, Buttons){
    const ModalWindow = document.createElement("div")
    ModalWindow.setAttribute("uib-modal-window", "modal-window")
    ModalWindow.className = "modal modal-modern ng-scope ng-isolate-scope in"
    ModalWindow.setAttribute("role", "dialog")
    ModalWindow.setAttribute("index", "0")
    ModalWindow.setAttribute("animate", "animate")
    ModalWindow.setAttribute("tabindex", "-1")
    ModalWindow.setAttribute("uib-modal-animation-class", "fade")
    ModalWindow.setAttribute("modal-in-class", "in")
    ModalWindow.style = "z-index: 1050; display: block;"

    const TrueModalDialog = document.createElement("div")
    TrueModalDialog.className = "modal-dialog "

    const ModalDialog = document.createElement("div")
    ModalDialog.className = "modal-content"

    ModalWindow.appendChild(TrueModalDialog)
    TrueModalDialog.appendChild(ModalDialog)

    const InnerModalDialog = document.createElement("div")
    InnerModalDialog.className = "ng-scope"

    ModalDialog.appendChild(InnerModalDialog)

    const ModalHeader = document.createElement("div")
    ModalHeader.className = "modal-header"

    const CloseButtonDiv = document.createElement("div")
    CloseButtonDiv.className = "modal-modern-header-button"

    const CloseButton = document.createElement("button")
    CloseButton.type = "button"
    CloseButton.className = "close"

    const CloseButtonSpan1 = document.createElement("span")
    CloseButtonSpan1.setAttribute("aria-hidden", "true")

    const CloseButtonSpan2 = document.createElement("span")
    CloseButtonSpan2.className = "icon-close"

    CloseButtonSpan1.appendChild(CloseButtonSpan2)
    CloseButton.appendChild(CloseButtonSpan1)
    CloseButtonDiv.appendChild(CloseButton)

    ModalHeader.appendChild(CloseButtonDiv)

    const ModalTitle = document.createElement("div")
    ModalTitle.className = "modal-title"

    const TitleH5 = document.createElement("h5")
    const TitleSpan = document.createElement("span")
    TitleSpan.className = "ng-binding"
    TitleSpan.innerText = Title

    TitleH5.appendChild(TitleSpan)
    ModalTitle.appendChild(TitleH5)
    ModalHeader.appendChild(ModalTitle)

    const ModalBody = document.createElement("div")
    ModalBody.className = "modal-body"

    const DescriptionSpan = document.createElement("span")
    DescriptionSpan.className = "ng-binding"
    DescriptionSpan.innerText = Description

    ModalBody.appendChild(DescriptionSpan)

    const ModalButtons = document.createElement("div")
    ModalButtons.className = "modal-buttons"

    const AllButtons = []

    for (let i = 0; i < Buttons.length; i++){
        const Button = document.createElement("button")
        Button.className = "modal-button btn-secondary-md ng-binding ng-isolate-scope"
        Button.type = "button"
        Button.setAttribute("focus-me", "true")
        Button.innerText = Buttons[i]
        ModalButtons.appendChild(Button)
        AllButtons.push(Button)
    }

    InnerModalDialog.appendChild(ModalHeader)
    InnerModalDialog.appendChild(ModalBody)
    InnerModalDialog.appendChild(ModalButtons)

    const Backdrop = document.createElement("div")
    Backdrop.setAttribute("uib-modal-backdrop", "modal-backdrop")
    Backdrop.className = "modal-backdrop ng-scope in"
    Backdrop.style = "z-index: 1040;"
    Backdrop.setAttribute("aria-hidden", "true")
    Backdrop.setAttribute("data-bootstrap-modal-aria-hidden-count", "1")
    Backdrop.setAttribute("modal-in-class", "in")
    Backdrop.setAttribute("uib-modal-animation-class", "fade")

    return [ModalWindow, Backdrop, AllButtons, CloseButton]
}

function CreateSectionButtonSetting(Name, ButtonText){
    const Section = document.createElement("div")
    Section.className = "section-content settings-security-setting-container"

    const sm = document.createElement("div")
    sm.className = "col-sm-12"

    const FormGroup = document.createElement("div")
    FormGroup.className = "form-group account-security-settings-container"

    const Label = document.createElement("span")
    Label.className = "security-settings-text ng-binding"
    Label.innerText = Name

    const Button = document.createElement("button")
    Button.id = ButtonText
    Button.className = "btn-control-sm acct-settings-btn ng-binding"
    Button.innerText = ButtonText

    FormGroup.appendChild(Label)
    FormGroup.appendChild(Button)

    sm.appendChild(FormGroup)
    Section.appendChild(sm)

    return [Section, Button]
}

function CreateSectionTitle(Title){
    const H4 = document.createElement("h4")
    H4.innerText = Title

    return H4
}