function CreateFeed(){
    const Container = document.createElement("div")
    Container.className = "feed"
    Container.innerHTML = ` <div class="section" infinite-scroll="groupWall.pager.loadNextPage()" infinite-scroll-disabled="true" infinite-scroll-distance="0.8"> <div class="container-header"> <h2 ng-bind="'Heading.Wall' | translate" class="ng-binding">My Feed</h2> </div> <!-- ngIf: showWallPrivacySettingsText() --> <!-- ngIf: groupWall.posts.length > 0 || canPostToWall() --><div class="section-content group-wall group-wall-no-margin ng-scope" ng-if="groupWall.posts.length > 0 || canPostToWall()"> <!-- ngIf: canPostToWall() --><div class="form-horizontal group-form ng-scope" ng-if="canPostToWall()" role="form" style="
    display:  none;
"> <div class="form-group"> <captcha activated="groupWall.captchaActivated" captcha-action-type="captchaActionTypes.groupWallPost" captcha-failed="sendWallPostFailed" captcha-passed="sendPostCaptchaPassed" input-params="captchaInputParams" return-token-in-success-cb="captchaReturnTokenInSuccessCb" class="ng-isolate-scope"><div class="captcha-container ng-scope" ng-controller="captchaV2Controller"> <div class="modal" ng-class="$ctrl.getCaptchaClasses()" ng-click="$ctrl.hideCaptcha()"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-body" ng-click="$event.stopPropagation()"> <button type="button" class="close" ng-click="$ctrl.hideCaptcha()"> <span aria-hidden="true"><span class="icon-close"></span></span><span class="sr-only">Close</span> </button> <div id="captchaV2-3" class="captchav2-funcaptcha-modal-body"></div> </div> </div> </div> </div> </div></captcha> <textarea id="postData" ng-model="groupWall.postData" ng-disabled="groupWall.isPostInProgress || groupWall.captchaActivated" class="form-control input-field ng-pristine ng-untouched ng-valid ng-empty ng-valid-maxlength" maxlength="500" placeholder="Say something..."></textarea> </div> <button id="postButton" class="btn-secondary-md group-form-button ng-binding" ng-click="sendPost()" ng-disabled="!canSendPost()" ng-bind="'Action.Post' | translate" disabled="disabled">Post</button> </div><!-- end ngIf: canPostToWall() --> <!-- ngIf: canSeeNewWallPosts() --> <div group-comments=""><div class="group-comments vlist" ng-class="{'no-top-border': !$ctrl.permissions.groupPostsPermissions.postToWall}">  </div> </div> </div><!-- end ngIf: groupWall.posts.length > 0 || canPostToWall() --> <div class="section-content-off ng-binding ng-hide" ng-show="!groupWall.pager.isBusy() &amp;&amp; !groupWall.loadFailure &amp;&amp; groupWall.posts.length == 0" ng-bind="'Label.NoWallPosts' | translate">Nobody has said anything yet...</div> <div class="section-content-off ng-binding ng-hide" ng-show="!groupWall.pager.isBusy() &amp;&amp; groupWall.loadFailure" ng-bind="'Label.WallPostsUnavailable' | translate">Wall posts are temporarily unavailable, please check back later.</div>  </div>`

    const List = Container.getElementsByClassName("group-comments vlist")[0]

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

            const Lookup = await Callback(Ids)
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

    async function GetGroupIcons(GroupIds){
        const [Success, Result] = await RequestFunc(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${GroupIds.join(",")}&size=150x150&format=Png&isCircular=false`, "GET", undefined, undefined, true)
        if (!Success) return {}

        const Lookup = {}
        const Data = Result.data
        for (let i = 0; i < Data.length; i++){
            const Image = Data[i]
            Lookup[Image.targetId] = Image.imageUrl
        }

        return Lookup
    }

    async function GetGroupNames(GroupIds){
        const [Success, Result] = await RequestFunc(`https://groups.roblox.com/v2/groups?groupIds=${GroupIds.join(",")}`, "GET", undefined, undefined, true)
        if (!Success) return {}

        const Lookup = {}
        const Data = Result.data
        for (let i = 0; i < Data.length; i++){
            const Image = Data[i]
            Lookup[Image.id] = Image.name
        }

        return Lookup
    }

    async function GetUserNames(UserIds){
        const [Success, Result] = await RequestFunc("https://users.roblox.com/v1/users", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: UserIds, excludeBannedUsers: false}), true)
        if (!Success) return {}

        const Lookup = {}
        const Data = Result.data
        for (let i = 0; i < Data.length; i++){
            const User = Data[i]
            Lookup[User.id] = User.name
        }

        return Lookup
    }

    function CreateComment(FeedPost){
        const Comment = document.createElement("div")
        Comment.className = "comment list-item"
        Comment.innerHTML = `<div class="list-header avatar avatar-headshot avatar-headshot-sm"> <a ng-href="https://www.roblox.com/users/2308943429/profile" class="avatar-card-link" href="https://www.roblox.com/users/2308943429/profile" style="
        border-radius: 0%;
    "> <thumbnail-2d class="avatar-card-image ng-isolate-scope" thumbnail-type="$ctrl.thumbnailTypes.avatarHeadshot" thumbnail-target-id="post.poster.userId" style="
        border-radius: 0%; background-color: transparent;
    "><span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot" thumbnail-target-id="2308943429" style="
        border-radius: 0%;
    "> <!-- ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --><img ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()" ng-src="https://tr.rbxcdn.com/1fe5ab01a98274384aa2622b86bd6e92/150/150/AvatarHeadshot/Png" thumbnail-error="$ctrl.setThumbnailLoadFailed" ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load="" alt="" title="" class="post-icon-image" style="
    "><!-- end ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --> <!-- ngIf: $ctrl.thumbnailUrl && $ctrl.isLazyLoadingEnabled() --> </span> </thumbnail-2d> </a> </div> <div class="list-body"> <div class="group-comments-container"> <!-- ngIf: $ctrl.isDisplayNamesEnabled --><a ng-if="$ctrl.isDisplayNamesEnabled" ng-href="https://www.roblox.com/users/2308943429/profile" class="group-name text-name ng-binding ng-scope" ng-bind="post.poster.displayName" href="https://www.roblox.com/users/2308943429/profile">The epic group!</a><!-- end ngIf: $ctrl.isDisplayNamesEnabled --> <!-- ngIf: !$ctrl.isDisplayNamesEnabled --> <!-- ngIf: post.poster.hasVerifiedBadge --> </div> <p class="comment-label list-content ng-binding" ng-bind-html="post.body | linkify" style="
        margin-bottom: 2px;
        margin-top: 12px;
    ">"Please attend the military meeting at sample text here!"</p> <p class="posted-by-label list-content ng-binding" ng-bind-html="post.body | linkify">(posted by Haydz6)</p><div class="date-label text-date-hint ng-binding" ng-bind="post.poster.role.name | appendDate: post.posted">Sep 24, 2023 | 9:18 AM</div> </div> <div class="group-menu" style="
        display: none;
    "> <button class="btn-generic-more-sm" popover-placement="bottom-right" popover-trigger="'outsideClick'" uib-popover-template="'group-comments-menu-popover'" title="More"> <span class="icon-more"></span> </button> </div>`
    
        const IconLabel = Comment.getElementsByClassName("post-icon-image")[0]
        const GroupNameLabel = Comment.getElementsByClassName("group-name")[0]
        const CommentLabel = Comment.getElementsByClassName("comment-label")[0]
        const PostedByLabel = Comment.getElementsByClassName("posted-by-label")[0]
        const DateLabel = Comment.getElementsByClassName("date-label")[0]

        const GroupURL = `https://www.roblox.com/groups/${FeedPost.Group}/group#!/about`
        Comment.getElementsByClassName("avatar-card-link")[0].href = GroupURL
        GroupNameLabel.href = GroupURL
        
        BatchCalls(FeedPost.Group, GetGroupIcons).then(function(Icon){
            IconLabel.src = Icon
        })
        BatchCalls(FeedPost.Group, GetGroupNames).then(function(Name){
            GroupNameLabel.innerText = Name
        })
        BatchCalls(FeedPost.Poster, GetUserNames).then(function(Name){
            PostedByLabel.innerText = `Posted by ${Name}`
        })

        CommentLabel.innerText = FeedPost.Comment
        DateLabel.innerText = new Date(FeedPost.Date*1000).toLocaleDateString(undefined, {hour: "numeric", minute: "numeric", hour12: true})

        //FeedPost: {Group: number, Comment: string, Poster: id, Date: number}
        return Comment
    }

    const Spinner = document.createElement("span")
    Spinner.className = "spinner spinner-default"
    List.appendChild(Spinner)

    RequestFunc(WebServerEndpoints.Feed, "GET").then(function([Success, Result]){
        Spinner.remove()
        if (!Success){
            //Failed to load error
            const Label = document.createElement("p")
            Label.innerText = Result?.Result || "Unknown Error"
            List.appendChild(Label)

            return
        }
    
        for (let i = 0; i < Result.length; i++){
            List.appendChild(CreateComment(Result[i]))
        }
    })
    
    return Container
}

//     Container.innerHTML = `<div class="section" infinite-scroll="groupWall.pager.loadNextPage()" infinite-scroll-disabled="true" infinite-scroll-distance="0.8"> <div class="container-header"> <h2 ng-bind="'Heading.Wall' | translate" class="ng-binding">My Feed</h2> </div> <!-- ngIf: showWallPrivacySettingsText() --> <!-- ngIf: groupWall.posts.length > 0 || canPostToWall() --><div class="section-content group-wall group-wall-no-margin ng-scope" ng-if="groupWall.posts.length > 0 || canPostToWall()"> <!-- ngIf: canPostToWall() --><div class="form-horizontal group-form ng-scope" ng-if="canPostToWall()" role="form" style="
//     display:  none;
// "> <div class="form-group"> <captcha activated="groupWall.captchaActivated" captcha-action-type="captchaActionTypes.groupWallPost" captcha-failed="sendWallPostFailed" captcha-passed="sendPostCaptchaPassed" input-params="captchaInputParams" return-token-in-success-cb="captchaReturnTokenInSuccessCb" class="ng-isolate-scope"><div class="captcha-container ng-scope" ng-controller="captchaV2Controller"> <div class="modal" ng-class="$ctrl.getCaptchaClasses()" ng-click="$ctrl.hideCaptcha()"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-body" ng-click="$event.stopPropagation()"> <button type="button" class="close" ng-click="$ctrl.hideCaptcha()"> <span aria-hidden="true"><span class="icon-close"></span></span><span class="sr-only">Close</span> </button> <div id="captchaV2-3" class="captchav2-funcaptcha-modal-body"></div> </div> </div> </div> </div> </div></captcha> <textarea id="postData" ng-model="groupWall.postData" ng-disabled="groupWall.isPostInProgress || groupWall.captchaActivated" class="form-control input-field ng-pristine ng-untouched ng-valid ng-empty ng-valid-maxlength" maxlength="500" placeholder="Say something..."></textarea> </div> <button id="postButton" class="btn-secondary-md group-form-button ng-binding" ng-click="sendPost()" ng-disabled="!canSendPost()" ng-bind="'Action.Post' | translate" disabled="disabled">Post</button> </div><!-- end ngIf: canPostToWall() --> <!-- ngIf: canSeeNewWallPosts() --> <div group-comments=""><div class="group-comments vlist" ng-class="{'no-top-border': !$ctrl.permissions.groupPostsPermissions.postToWall}"> <div class="comment list-item ng-scope" ng-repeat="post in groupWall.posts"> <div class="list-header avatar avatar-headshot avatar-headshot-sm"> <a ng-href="https://www.roblox.com/users/2308943429/profile" class="avatar-card-link" href="https://www.roblox.com/users/2308943429/profile" style="
//     border-radius: 0%;
// "> <thumbnail-2d class="avatar-card-image ng-isolate-scope" thumbnail-type="$ctrl.thumbnailTypes.avatarHeadshot" thumbnail-target-id="post.poster.userId" style="
//     border-radius: 0%;
// "><span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot" thumbnail-target-id="2308943429" style="
//     border-radius: 0%;
// "> <!-- ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --><img ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()" ng-src="https://tr.rbxcdn.com/1fe5ab01a98274384aa2622b86bd6e92/150/150/AvatarHeadshot/Png" thumbnail-error="$ctrl.setThumbnailLoadFailed" ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="https://tr.rbxcdn.com/f5884ab7ece97b78c9d037366835bc68/150/150/Image/Png" style="
// "><!-- end ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --> <!-- ngIf: $ctrl.thumbnailUrl && $ctrl.isLazyLoadingEnabled() --> </span> </thumbnail-2d> </a> </div> <div class="list-body"> <div class="group-comments-container"> <!-- ngIf: $ctrl.isDisplayNamesEnabled --><a ng-if="$ctrl.isDisplayNamesEnabled" ng-href="https://www.roblox.com/users/2308943429/profile" class="text-name ng-binding ng-scope" ng-bind="post.poster.displayName" href="https://www.roblox.com/users/2308943429/profile">The epic group!</a><!-- end ngIf: $ctrl.isDisplayNamesEnabled --> <!-- ngIf: !$ctrl.isDisplayNamesEnabled --> <!-- ngIf: post.poster.hasVerifiedBadge --> </div> <p class="list-content ng-binding" ng-bind-html="post.body | linkify" style="
//     margin-bottom: 2px;
//     margin-top: 12px;
// ">"Please attend the military meeting at sample text here!"</p> <p class="list-content ng-binding" ng-bind-html="post.body | linkify">(posted by Haydz6)</p><div class="text-date-hint ng-binding" ng-bind="post.poster.role.name | appendDate: post.posted">Sep 24, 2023 | 9:18 AM</div> </div> <div class="group-menu" style="
//     display: none;
// "> <button class="btn-generic-more-sm" popover-placement="bottom-right" popover-trigger="'outsideClick'" uib-popover-template="'group-comments-menu-popover'" title="More"> <span class="icon-more"></span> </button> </div> </div> </div> </div> </div><!-- end ngIf: groupWall.posts.length > 0 || canPostToWall() --> <div class="section-content-off ng-binding ng-hide" ng-show="!groupWall.pager.isBusy() &amp;&amp; !groupWall.loadFailure &amp;&amp; groupWall.posts.length == 0" ng-bind="'Label.NoWallPosts' | translate">Nobody has said anything yet...</div> <div class="section-content-off ng-binding ng-hide" ng-show="!groupWall.pager.isBusy() &amp;&amp; groupWall.loadFailure" ng-bind="'Label.WallPostsUnavailable' | translate">Wall posts are temporarily unavailable, please check back later.</div>  </div>`