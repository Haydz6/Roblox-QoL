function CreateItemContainer(Title, URL, ImageURL, ID){
  const div = document.createElement("div")
  div.className = "grid-item-container game-card-container"
  div.setAttribute("data-testid", "game-title")

  const GameCardLink = document.createElement("a")
  GameCardLink.className = "game-card-link"
  GameCardLink.href = URL
  GameCardLink.id = ID

  const Thumbnail = document.createElement("span")
  Thumbnail.className = "thumbnail-2d-container game-card-thumb-container"

  const ThumbnailImage = document.createElement("img")
  ThumbnailImage.src = ImageURL
  ThumbnailImage.alt = Title
  ThumbnailImage.title = Title

  const TitleDiv = document.createElement("div")
  TitleDiv.className = "game-card-name game-name-title"
  TitleDiv.title = Title
  TitleDiv.innerText = Title

  const GameCardInfo = document.createElement("div")
  GameCardInfo.className = "game-card-info"
  
  const IconVotesGray = document.createElement("span")
  IconVotesGray.className = "info-label icon-votes-gray"
  
  const VotePercentageLabel = document.createElement("span")
  VotePercentageLabel.className = "info-label vote-percentage-label"
  VotePercentageLabel.innerText = "--"
  
  const IconPlayingGray = document.createElement("span")
  IconPlayingGray.className = "info-label icon-playing-counts-gray"
  
  const PlayingCountsLabel = document.createElement("span")
  PlayingCountsLabel.className = "info-label playing-counts-label"
  PlayingCountsLabel.innerText = "--"

  GameCardInfo.appendChild(IconVotesGray)
  GameCardInfo.appendChild(VotePercentageLabel)
  GameCardInfo.appendChild(IconPlayingGray)
  GameCardInfo.appendChild(PlayingCountsLabel)

  div.appendChild(GameCardLink)

  GameCardLink.appendChild(Thumbnail)
  GameCardLink.appendChild(TitleDiv)
  GameCardLink.appendChild(GameCardInfo)

  Thumbnail.appendChild(ThumbnailImage)

  async function UpdateLikes(LikeRatio){
    VotePercentageLabel.innerText = LikeRatio && LikeRatio+"%" || "--"
  }

  async function UpdatePlayerCount(PlayerCount){
    PlayingCountsLabel.innerText = PlayerCount >= 1000 && `${Math.floor(PlayerCount/100)/10}K` || PlayerCount || PlayerCount == 0 && "0" || "--"
  }

  return [div, UpdateLikes, UpdatePlayerCount]
}