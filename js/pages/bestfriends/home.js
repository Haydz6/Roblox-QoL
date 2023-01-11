async function AttachToFriendProfile(Friend){
    if (Friend.type != Node.ELEMENT_NODE || Friend.className.search("list-item friend") == -1 || Friend.id.search("people-") == -1){
        return
    }

    const FriendId = parseInt(Friend.getAttribute("rbx-user-id"))
}

const FriendObserver = new MutationObserver(function(Mutations){
    Mutations.forEach(function(Mutation){
        if (Mutation.type === "childList"){
            const AddedChilds = Mutation.addedNodes

            for (let i = 0; i < AddedChilds.length; i++){
                AttachToFriendProfile(AddedChilds[i])
            }
        }
    })
})

async function Main(){

}