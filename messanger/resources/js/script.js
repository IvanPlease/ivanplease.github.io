var cluster_check = false;
var api_server = "https://delta-communicator.herokuapp.com";
var api_local = "http://localhost:8080";
var api_host = api_server;
var user_id = "2";
var conv_messages = [];
var friends_count = 0;

$(document).ready(function(){
    $("#friendSearch").on('click', function(){
        var element = $("#friendSearch").parent().find("input");
        var searchTerm = element.val().trim();
        var ajaxValue = {searchType: 0, searchValue: searchTerm};
        searchLogic(ajaxValue);
    });
    $("#friendSearch").parent().find("input").keyup(function(e){
        if (e.which <= 90 && e.which >= 48){
            var element = $(this);
            var searchTerm = element.val().trim();
            var ajaxValue = {searchType: 0, searchValue: searchTerm};
            clearSearchBox(false);
            searchLogic(ajaxValue);
        }
    })
    $(".layout-boxes").on('click', "#sendMessage", function(){
        createMessage($(this));
    });
    $(".layout-boxes").on('keypress', ".messanger-input", function(e){
        if (e.keyCode === 13) {
            e.preventDefault();
            createMessage($("#sendMessage"));
        }
    })
    $("#addFriendModal").on('hidden.bs.modal', clearSearchBox(true));
    $("#searchBoxReturn").on('click', '.searchBackground', function(){
        var user = $(this).attr("data-user-id");
        $("#addFriendModal").modal('toggle');
        createConvo($(this));
    });
    $("#friendsBox").on('click', '.friendRow', function(){
        fetchConvo({element:$(this)});
    });
    initCheck();
    setInterval(function(){
        checkForNewStuff();
    },1000);
});

function initCheck(){
    fetchFriends();
    $.ajax({
        url: api_host + "/v1/conv/user/" + user_id,
        method: "GET",
        dataType: "json",
        success: function(data){
            data.forEach(conv => {
                conv_messages.push({id: conv.id, messagesCount: conv.conversationMessages.length});
            });
            friends_count = data.length;
        },
        error: function(data){
            console.log(data);
        }
    });
}

function checkForNewStuff(){
    $.ajax({
        url: api_host + "/v1/conv/user/" + user_id,
        method: "GET",
        dataType: "json",
        success: function(data){
            data.forEach(conv => {
                conv_messages.forEach(d => {
                    if(conv.id == d.id){
                        if(conv.conversationMessages.length > d.messagesCount && $(".messanger-input").attr("data-conv-id") == conv.id){
                            d.messagesCount = conv.conversationMessages.length;
                            fetchConvo({convId: conv.id});
                        }
                    }
                })
            });
            if(friends_count < data.length){
                friends_count = data.length;
                fetchFriends();
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}

function fetchFriends(){
    $("#friendsBox").empty();
    var friendBox = '<div class="d-flex flex-row friendRow"><div class="d-inline-flex p-2" data-conv-id="${dataConvId}"><div class="image-wrap"><img src="${dataImagePath}" alt="${dataImageAlt}"/></div><div>${dataUserName}<span data-status="${dataStatus}"></span></div></div></div>';
    $.ajax({
        url: api_host + "/v1/conv/user/" + user_id,
        method: "GET",
        dataType: "json",
        success: function(data){
            data.forEach(conv => {
                if(conv.authorUser.id == user_id){
                    $("#friendsBox").append(friendBox.replace("${dataConvId}", conv.id)
                                                    .replace("${dataUserName}", conv.receiverUser.firstname + " " + conv.receiverUser.lastname)
                                                    .replace("${dataImagePath}", conv.receiverUser.profilePic.filePath)
                                                    .replace("${dataImageAlt}", conv.receiverUser.profilePic.fileName)
                                                    .replace("${dataStatus}", (status)?"online":"offline"));
                }else{
                    $("#friendsBox").append(friendBox.replace("${dataConvId}", conv.id)
                                                    .replace("${dataUserName}", conv.authorUser.firstname + " " + conv.authorUser.lastname)
                                                    .replace("${dataImagePath}", conv.authorUser.profilePic.filePath)
                                                    .replace("${dataImageAlt}", conv.authorUser.profilePic.fileName)
                                                    .replace("${dataStatus}", (status)?"online":"offline"));
                }
            })
        },
        error: function(data){
            console.log(data);
        }
    })
}

function createMessage(el){
    var element = el.parent().find("input");
    var inputMessage = element.val().trim();
    var reciever = $.trim($(".messanger-input").closest(".flex-column").find(".row:first-child").text());
    var ajaxValue = {messageReceiver: reciever, messageValue: ""};
    if($.trim(inputMessage)){
        ajaxValue.messageValue = $.trim(inputMessage);
    }
    $.ajax({
        url: api_host + "/v1/conv/msg",
        method: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({author: {id: user_id}, receiver: {id: element.attr("data-user-id")}, conversation: {id: element.attr("data-conv-id")}, content: inputMessage}),
        success: function(data){
            addMessage({content: data.content}, true);
        },
        error: function(data){
            console.log(data);
        }
    });
    element.val('');
}

function addMessage(msg, authorStatus){ //on new message recieved while online
    var messageBoxTag = "#messageBoxTag";
    var messageBlop = '<div class="d-flex flex-row${messageSide} mb-3 restore-paddings"><div class="d-inline-flex p-2 message-blop" data-author="${messageAuthor}"${clusterContent}>${messageContent}</div></div>';
    var author = (authorStatus) ? "user":"sender";
    var side = (authorStatus) ? "-reverse":"";
    var check = $("#messageBoxTag")[0].children.length;
    if(check != 0){
        if($("#messageBoxTag")[0].children[0].children[0].dataset.author == author){
            if(cluster_check == false){
                $("#messageBoxTag")[0].children[0].classList.remove("mb-3");
                $("#messageBoxTag")[0].children[0].children[0].setAttribute("data-cluster", true);
                $("#messageBoxTag")[0].children[0].children[0].setAttribute("data-cluster-pos", "start");
                messageBlop = messageBlop.replace("${clusterContent}", " data-cluster=true data-cluster-pos=\"end\"");
                cluster_check = true;
            }else{
                $("#messageBoxTag")[0].children[0].classList.remove("mb-3");
                $("#messageBoxTag")[0].children[0].children[0].setAttribute("data-cluster-pos", "middle");
                messageBlop = messageBlop.replace("${clusterContent}", " data-cluster=true data-cluster-pos=\"end\"");
            }
        }else{
            if(cluster_check){
                cluster_check = false;
            }
        }
    }
    $(messageBoxTag).prepend(messageBlop.replace("${messageContent}", msg.content).replace("${messageAuthor}", author).replace("${messageSide}", side).replace("${clusterContent}", ""));
}

function clearSearchBox(type){
    if(type){
        $("#searchBoxReturn").children().find(".friend-name-input-box>input").val('');
    }
    $("#searchBoxReturn").children().not(":first").remove();
}

function searchLogic(ajaxValue){
    var searchBox = '<div class="d-flex flex-row searchBackground mt-2" data-user-id="${dataId}"><div class="d-inline-flex p-2 w-100"><div class="image-wrap"><img src="${dataPath}" alt="${dataAlt}"/></div><div class="ml-3 position-relative w-100"><span class="searchData w-100">${dataNameAndSurname}</span></div></div></div>'
    if(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/g.test(ajaxValue.searchValue)){
        ajaxValue.searchType = 2;
    }else if(/^\b[a-zA-Z]+\b\s\b[a-zA-Z]+\b$/g.test(ajaxValue.searchValue)){
        ajaxValue.searchType = 1;
    }else if(/\b[a-zA-Z]+\b$/g.test(ajaxValue.searchValue)){
        ajaxValue.searchType = 0;
    }
    $.ajax({
        method: "GET",
        url: api_host + "/v1/users",
        contentType: "application/json",
        dataType: "json",
        data: ajaxValue,
        success: function(data){
            data.forEach(user => {
                if(user.id != user_id){
                    var name = user.firstname + " " + user.lastname;
                    var box = $(searchBox.replace("${dataPath}", user.profilePic.filePath).replace("${dataAlt}", user.profilePic.fileName).replace("${dataNameAndSurname}", name).replace("${dataId}", user.id))
                                .hide()
                                .fadeIn(500);
                    $("#searchBoxReturn").append(box);
                }
            });
        },
        error: function(data){
            console.log(data);
        }
    })
}

function createConvo(element){
    var recieverId = element.attr("data-user-id");
    $.ajax({
        url: api_host + "/v1/conv/",
        method: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({"authorUser": { "id": user_id}, "receiverUser": { "id": recieverId } }),
        success: function(data){
            fetchConvo({convId: data.id});
            fetchFriends();
        },
        error: function(data){
            console.log(data);
        }
    });
}

function fetchConvo(values){
    var convBox = '<div class="row"><div class="d-inline-flex p-2">${dataUserName}<span data-status="${dataStatus}"></span></div></div><div class="row"><div class="d-flex flex-column-reverse " id="messageBoxTag"></div></div><div class="row"><div class="input-box"><input class="messanger-input" data-conv-id="${dataConvId}" data-user-id="${dataUserId}" placeholder="Wiadomość"/><button class="send-button" id="sendMessage"><i class="far fa-paper-plane"></i></button></div></div>'
    var convId = (values.element) ?values.element.children().attr("data-conv-id"):values.convId;
    var author = false;
    $.ajax({
        url: api_host + "/v1/conv/"+ convId,
        method: "GET",
        dataType: "json",
        success: function(data){
            var element;
            $(".layout-boxes").empty();
            if(data.authorUser.id == user_id){
                element = $(convBox.replace("${dataUserName}", data.receiverUser.firstname + " " + data.receiverUser.lastname)
                .replace("${dataStatus}", (status)?"online":"offline")
                .replace("${dataUserId}", data.receiverUser.id)
                .replace("${dataConvId}", data.id));
            }else{
                element = $(convBox.replace("${dataUserName}", data.authorUser.firstname + " " + data.authorUser.lastname)
                .replace("${dataStatus}", (status)?"online":"offline")
                .replace("${dataUserId}", data.authorUser.id)
                .replace("${dataConvId}", data.id));
            }
            $(".layout-boxes").append(element);
            data.conversationMessages.forEach(message => {
                if(message.author.id == user_id){
                    author = true;
                }else{
                    author = false;
                }
                addMessage(message, author);
            })
        }
    })
}