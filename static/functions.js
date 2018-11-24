
    function signInCallback(authResult) {
        if (authResult['code']) {
        // Hide the sign-in button now that the user is authorized
    // $('#signinButton').attr('style', 'display: none');
        // Send the one-time-use code to the server, if the server responds, write a 'login successful' message to the web page and then redirect back to the main restaurants page
        $.ajax({
            type: 'POST',
            url: '/gconnect?state='+sessionStorage.getItem('state'),
            processData: false,
            data: authResult['code'],
            contentType: 'application/octet-stream; charset=utf-8',
            success: function(result) {
            // Handle or verify the server response if necessary.
            if (result) {
                //console.log(result);
                $("#LoginModal").modal('hide');
                button_link=$("<a class='nav-link dropdown-toggle' href='#' id='navbardrop' data-toggle='dropdown'>\
                    </a><div class='dropdown-menu dropdown-menu-right bg-success'>\
                    <a class='dropdown-item'>Logout</a></div>");
                $("#login-button").empty();
                $("#header-email").append(button_link);    
                $("#header-email").find('a').first().text(result.email);
                $("#header-email").find(".dropdown-item").first().attr({'id':'logout','href':'#'});
                $("#login-button").empty();
                $("#header-picture").attr('src',result.picture);
                sessionStorage.setItem("email", result.email);
                sessionStorage.setItem("picture", result.picture);
                sessionStorage.setItem("id", result.id);
                list_of_categories();
                $("#main").empty();
                $("#flash").addClass("flash").text("Logged in Successfully");
                setTimeout(function(){
                    $("#flash").empty();
                    $("#flash").removeClass("flash");
                },5000);

            
            } 
            else if (authResult['error']) {
                console.log('There was an error: ' + authResult['error']);
            }
            else {
                console.log('Error: ' + authResult['error']);
            // $('#result').html('Failed to make a server-side call. Check your configuration and console.');
            }
        }});
    }}

    //Items Card

    var card="<div class=\"card float-left item\" style='width: 15-rem;'>\
            <div class=\"card-body\">\
                <h5 class=\"card-title\"></h5>\
                <span class='card-cat-user_id' hidden></span>\
                <span class='card-cat-id' hidden></span>\
                <span class='card-item-id' hidden></span>\
                <p class=\"card-text\"></p>\
                <p class=\"card-price\"></p>\
                <a  class='card-link card-edit' href='#'></a>\
                <a  class='card-link card-delete' href='#'></a>\
                </div></div>";
    var row="<div class='row'></div>";


    //handle the json response for the list of Categories.

    function list_of_categories(){
        //console.log("Categori function");
        $.ajax({
            url: "/categories",
            type:'GET',
            dataType:'json',
            success: function(result){
                if(typeof(result)==='object'){
                    $("#side-list").empty();
                    for(i=0; i<Object.keys(result.categories).length ;i++)
                    {
                        div=$("<div></div>");
                        $(div).addClass('cat');
                        $(div).append("<span class='user_id' hidden>"+result.categories[i].user_id+"</span>");
                        $(div).append("<span class='id' hidden>"+result.categories[i].id+"</span>");
                        $(div).append("<a class='h4 btn btn-link name'>"+result.categories[i].name+"</a>");
                        if(typeof(sessionStorage.getItem("email"))==='string')
                        {
                            $(div).append("<span class='float-right delete btn btn-link'><a><i style='font-size:20px'class='fas'>&#xf2ed;</i></a></span>");
                            $(div).append("<span class='float-right edit btn btn-link'><a <a><i style='font-size:20px' class='fas'>&#xf044;</i></a></span>");                                             
                            $(div).find(".delete").val("/categories/"+result.categories[i].id+"/delete/");
                        }
                        $("#side-list").append(div);


                    }
                }
            }
        });
    }

    //handle the json response for the list of Items by particular Category.
    // set value of ctaegory-id in the create_item button so that items gets created under the same category  
    
    function items(val){

        link="/categories/"+val.split('-')[0]+"/items/";
        $("#create_item").val(val);
        list_of_items(link);
    }
    
    function list_of_items(link){
        $.ajax({
            url:link,
            type:'GET',
            dataType:'json',
            success:function(result){
                if (typeof(result)==='object')
                {
                    row_count=(result.count%3)+(result.count/3);
                    $('#main').empty();
                    j=1;
                    for(i=0; i<row_count ;i++)
                    {

                        rows=$(row);
                        count=0;
                        for(;j<=result.count;j++,count++)
                        {   if(count%3==0 && count>0)
                                break;
                            col=$("<div class='col col-md-4'></div>");
                            card_item=$(card);
                            card_body=$(card_item).find(".card-body").first();
                            $(card_body).find(".card-cat-user_id").first().text(result.items[j-1].user_id);
                            $(card_body).find(".card-cat-id").first().text(result.items[j-1].category_id);
                            $(card_body).find(".card-item-id").first().text(result.items[j-1].id);
                            $(card_body).find(".card-title").first().text(result.items[j-1].name);
                            $(card_body).find(".card-text").first().text(result.items[j-1].description);
                            $(card_body).find(".card-price").first().text(result.items[j-1].price);
                            if(typeof(sessionStorage.getItem("email"))==='string')
                            {
                                $(card_body).find(".card-edit").text("Edit");
                                $(card_body).find(".card-delete").val(result.items[j-1].category_id+"-"+result.items[j-1].id).text("Delete");
                            }
                            $(col).append(card_item);
                            $(rows).append(col);
                           // console.log($(col).html());
                            
                        }
                        $("#main").append(rows);
                    }
                }
            }

        });
    }


//handles to deletion of Category and Items

    function del_category(val){

        $.ajax({
            url:val,
            type:'DELETE',
            dataType:'json',
            contentType:"application/json",
            success:function(result){
                if (typeof(result)==="object" && result.message!='Access Denied' )
                { 
                    $("#flash").addClass("flash").text("Deletion Successful");
                    setTimeout(function(){
                        $("#flash").empty();
                        $("#flash").removeClass("flash");
                    },5000);    
                    list_of_categories();                    
                }
            }
        });
        return false;
     }
