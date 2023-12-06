IsFeatureEnabled("ActivePrivateServers").then(async function(Enabled){
    if (!Enabled) return

    const SummaryLabel = document.createElement("tr")
    SummaryLabel.innerHTML = `<td class="summary-transaction-label"><a>Private Servers<span class="icon-right-16x16" style="margin-left: 10px;"></span></a><div class="box" style="display: none;"></div></td><td class="amount icon-robux-container" style=""><span></span><span class="icon-robux-16x16"></span><span style="display: none;"></span><span class="price">Open</span></td>`

    let IsFetching = false
    let Open = false

    const Box = SummaryLabel.getElementsByClassName("box")[0]
    const Button = SummaryLabel.getElementsByTagName("a")[0]
    const IconLabel = SummaryLabel.getElementsByClassName("icon-right-16x16")[0]
    const PriceLabel = SummaryLabel.getElementsByClassName("price")[0]

    Button.addEventListener("click", async function(){
        Open = !Open
        Box.style.display = Open ? "" : "none"
        IconLabel.className = `icon-${Open ? "down" : "right"}-16x16`

        if (IsFetching) return
        IsFetching = true

        const Spinner = document.createElement("div")
        Spinner.className = "spinner spinner-default"
        Box.appendChild(Spinner)

        PriceLabel.innerText = "..."

        let PricePerMonth = 0

        function UpdatePriceLabel(){
            PriceLabel.innerText = `${numberWithCommas(PricePerMonth)}/month`
        }

        await GetActivePrivateServersV2(function(Server){
            const GameCard = document.createElement("li")
            GameCard.innerHTML = `<div class="item-card-container"> <a class="item-card-link"> <div class="item-card-thumb-container"> <thumbnail-2d class="item-card-thumb"><span class="thumbnail-2d-container"> <img image-load="" alt="" title="" class="game-icon" src> </span> </thumbnail-2d> <span class="restriction-icon ng-hide"></span> <span ng-show="item.AssetRestrictionIcon" ng-class="'icon-' + item.AssetRestrictionIcon.CssTag + '-label'" class="ng-hide icon--label"> </span> </div> <div class="item-card-name" title="harry"> <!-- ngIf: $ctrl.shouldShowPremiumIcon(item) --> <span ng-bind="item.Item.Name" class="ng-binding">harry</span> </div> </a> <!-- ngIf: item.Item.AudioUrl --> <!-- ngIf: $ctrl.showCreatorName && !item.itemDetailsLoading --><div ng-if="$ctrl.showCreatorName &amp;&amp; !item.itemDetailsLoading" class="text-overflow item-card-label ng-scope"> <span ng-bind="'Label.OwnershipPreposition' | translate" class="ng-binding">By</span> <a class="creator-name text-overflow text-link ng-binding ng-hide" ng-href="" ng-hide="$ctrl.currentData.isPrivateServerCategoryType" ng-bind="item.Creator.nameForDisplay"></a> <a class="creator-name text-overflow text-link ng-binding" ng-href="https://www.roblox.com/users/51787703/profile/" ng-show="$ctrl.currentData.isPrivateServerCategoryType" ng-bind="item.PrivateServer.nameForDisplay" href="https://www.roblox.com/users/51787703/profile/">@Haydz6</a> </div><!-- end ngIf: $ctrl.showCreatorName && !item.itemDetailsLoading --> <!-- ngIf: !item.itemDetailsLoading --><div class="text-overflow item-card-price ng-scope" style="height: 100%;" ng-if="!item.itemDetailsLoading"> <!-- ngIf: $ctrl.doesItemHavePrice(item) --><span class="icon-robux-16x16 ng-scope" ng-if="$ctrl.doesItemHavePrice(item)"></span><!-- end ngIf: $ctrl.doesItemHavePrice(item) --> <span class="text-robux-tile">500</span>  </div></div>`
            
            GameCard.getElementsByClassName("game-icon")[0].src = Server.Thumbnail.replaceAll("110", "150")
            GameCard.getElementsByClassName("item-card-link")[0].href = `https://www.roblox.com/private-server/configure/${Server.Id}`
            
            const ItemCardName = GameCard.getElementsByClassName("item-card-name")[0]
            ItemCardName.title = Server.ServerName
            ItemCardName.innerText = Server.ServerName

            GameCard.getElementsByClassName("text-robux-tile")[0].innerText = Server.Price
            GameCard.getElementsByClassName("text-overflow item-card-label")[0].remove()
            
            Box.appendChild(GameCard)

            PricePerMonth = Server.Price
            UpdatePriceLabel()
        })

        UpdatePriceLabel()
        
        Spinner.remove()
    })

    const Table = await WaitForClass("table summary")
    const Body = await WaitForTagPath(Table, "tbody")
    Body.insertBefore(SummaryLabel, Body.children[Body.children.length-1])
})