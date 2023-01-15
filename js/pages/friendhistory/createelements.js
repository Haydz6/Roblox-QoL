function CreateHeaderTab(Text, Id, href, Active){
    const Header = document.createElement("li")
    Header.setAttribute("id", Id)
    Header.setAttribute("role", "tab")
    Header.setAttribute("custom", true)
    Header.className = "rbx-tab"

    const Button = document.createElement("a")
    Button.className = `rbx-tab-heading${Active && " active" || ""}`
    Button.href = href

    const Label = document.createElement("span")
    Label.className = "text-lead"
    Label.innerText = Text

    const Subtitle = document.createElement("span")
    Subtitle.className = "rbx-tab-subtitle"

    Button.appendChild(Label)
    Button.appendChild(Subtitle)

    Header.appendChild(Button)

    return [Header, Button]
}

function CreateFriend(UserId, Name, DisplayName, Thumbnail, Type, FriendedTimestamp, UnfriendedTimestamp, IsVerified){
    const Friend = document.createElement("li")
    Friend.setAttribute("id", UserId)
    Friend.className = "list-item avatar-card"
    Friend.setAttribute("custom", true)

    const AvatarCardContainer = document.createElement("div")
    AvatarCardContainer.className = "avatar-card-container"

    Friend.appendChild(AvatarCardContainer)

    const AvatarCardContent = document.createElement("div")
    AvatarCardContent.className = "avatar-card-content"

    AvatarCardContainer.appendChild(AvatarCardContent)

    const AvatarCardFullbody = document.createElement("div")
    AvatarCardFullbody.className = "avatar avatar-card-fullbody"

    AvatarCardContent.appendChild(AvatarCardFullbody)

    const AvatarCardLink = document.createElement("a")
    AvatarCardLink.className = "avatar-card-link"
    AvatarCardLink.href = `/users/${UserId}/profile`

    AvatarCardFullbody.appendChild(AvatarCardLink)

    const Thumbnail2DSpan = document.createElement("span")
    Thumbnail2DSpan.className = "thumbnail-2d-container avatar-card-image"

    AvatarCardLink.appendChild(Thumbnail2DSpan)

    const ThumbnailImage = document.createElement("img")
    ThumbnailImage.src = Thumbnail

    Thumbnail2DSpan.appendChild(ThumbnailImage)

    const AvatarStatus = document.createElement("div")
    AvatarStatus.className = "avatar-status"

    const AvatarIcon = document.createElement("img")
    AvatarIcon.src = chrome.runtime.getURL(`img/friendhistory/${Type}.png`)
    AvatarIcon.style = "height:20px;"

    AvatarStatus.appendChild(AvatarIcon)

    AvatarCardFullbody.appendChild(AvatarStatus)

    const AvatarCardCaption = document.createElement("div")
    AvatarCardCaption.className = "avatar-card-caption"

    AvatarCardContent.appendChild(AvatarCardCaption)

    const CaptionSpan = document.createElement("span")

    AvatarCardCaption.appendChild(CaptionSpan)

    const DisplayNameOuter = document.createElement("div")
    DisplayNameOuter.className = `avatar-name-container${IsVerified && " verified" || ""}`
    
    const DisplayNameButton = document.createElement("a")
    DisplayNameButton.href = `/users/${UserId}/profile`
    DisplayNameButton.className = "text-overflow avatar-name"
    DisplayNameButton.innerText = DisplayName

    DisplayNameOuter.appendChild(DisplayNameButton)

    CaptionSpan.appendChild(DisplayNameOuter)

    const NameLabel = document.createElement("div")
    NameLabel.className = "avatar-card-label"
    NameLabel.innerText = `@${Name}`

    const Date = document.createElement("div")
    Date.className = "avatar-card-label"
    Date.innerText = `${(Type === "New" && "Since" || "At")} ${TimestampToDate(Type === "New" && FriendedTimestamp || UnfriendedTimestamp)}`

    CaptionSpan.appendChild(NameLabel)
    CaptionSpan.appendChild(Date)

    if (Type === "Lost"){
        const Length = document.createElement("div")
        Length.className = "avatar-card-label"
        Length.innerText = `Friended for ${SecondsToLength(UnfriendedTimestamp-FriendedTimestamp)}`

        CaptionSpan.appendChild(Length)
    }

    if (IsVerified){
        const VerifiedOuterSpan = document.createElement("span")
        VerifiedOuterSpan.setAttribute("role", "button")
        VerifiedOuterSpan.setAttribute("tabindex", "0")
        VerifiedOuterSpan.setAttribute("data-rblx-badge-icon", "true")
        VerifiedOuterSpan.className = "jss58"

        const VerifiedButton = document.createElement("img")
        VerifiedButton.className = "verified-badge-friends-img"
        VerifiedButton.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28' fill='none'%3E%3Cg clip-path='url(%23clip0_8_46)'%3E%3Crect x='5.88818' width='22.89' height='22.89' transform='rotate(15 5.88818 0)' fill='%230066FF'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M20.543 8.7508L20.549 8.7568C21.15 9.3578 21.15 10.3318 20.549 10.9328L11.817 19.6648L7.45 15.2968C6.85 14.6958 6.85 13.7218 7.45 13.1218L7.457 13.1148C8.058 12.5138 9.031 12.5138 9.633 13.1148L11.817 15.2998L18.367 8.7508C18.968 8.1498 19.942 8.1498 20.543 8.7508Z' fill='white'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_8_46'%3E%3Crect width='28' height='28' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E"
        VerifiedButton.title = "Verified Badge Icon"
        VerifiedButton.alt = "Verified Badge Icon"

        VerifiedOuterSpan.appendChild(VerifiedButton)
        DisplayNameOuter.appendChild(VerifiedOuterSpan)
    }
    
    return Friend
}