$(document).ready(function(){

    $("#login-button").click(function(){
        $("#LoginModal").modal();
    });
    $("#side").hide();
    $("#main_bar").hide();

    //for creating items in the main_bar

    
// when show categories button is clicked

    $("#cat").click(function(){
        $("#side").show();
        list_of_categories();
    });

    //When Create Categories Button is Clicked

    $("#create").click(function(){
       // console.log($(this).html());
        //to check User is Logged in or not
        if(typeof(sessionStorage.getItem("email"))==='string')
        {
            $(".modal-title").text($(this).html());
            $("#submit").html('Create');
            $("#category_id").val("");
            $("#category_name").val("");
            $("#modalCategoryForm").modal();
        }
        else
            $("#modalAccessVerification").modal();
    });

    // when categories edit icon is clicked

    $("body").on("click",".cat .edit",function(){
        if(typeof(sessionStorage.getItem("email"))==='string')
        {

            if($(this).siblings(".user_id").text()===sessionStorage.getItem('id'))
            {
                $("#category_id").val($(this).siblings(".id").text());
                $("#category_name").val($(this).siblings(".name").text());
                $("#submit").html('Update');
                $(".modal-title").text("Update Category");
                $("#modalCategoryForm").modal();
            }
            else
                $("#modalAuthorizationVerification").modal();
        }
        else
            $("#modalAccessVerification").modal(); 
    })

    // when submit button of Edit/Create Category's form is clicked
   // for creating new Category or Updating Category

    $("#submit").click(function(){

        if($("#category_form input[name=category]").val()==="")
        {
            alert("Category name should not be empty");
            return;
        }
        name=$("#category_form input[name=category]").val();
        id=$("#category_form input[name=id]").val();
        $("#modalCategoryForm").modal('hide');
        var path="/categories/"+id+"/edit/";
        req_type="PUT";

    //if new Category is Created 
    
        if($(this).html()==="Create")
        {   path="/categories/create/";
            req_type="POST";
        }
        formData={
            'id':id,
            'name':name,
            'user_id':sessionStorage.getItem('id')
        };
       // console.log(formData);
       // console.log(path);
        $.ajax({
        type:req_type,
        url:path,
        data:JSON.stringify(formData),
        dataType: "json",
        contentType : "application/json",
        success:function(result){
         //   console.log("Hello Type Of  Result "+typeof(result));
            if (typeof(result)==="object" && result.message!='Access Denied' )
            {   //alert("Succesfull");
                $("#side-list").empty();
                if(req_type==="PUT")
                    $("#flash").addClass("flash").text("Category Updated Successfully");
                else
                    $("#flash").addClass("flash").text("Category Created Successfully");
                setTimeout(function(){
                    $("#flash").empty();
                    $("#flash").removeClass("flash")
                },5000);
                list_of_categories();
            }
            else 
                $("#LoginModal").modal();
        }
        });    
    });

    //Handles the deletion of the categories
    // when delete icon of a category is clicked
    $("#side-list").on('click',".cat .delete",function(){
        if(typeof(sessionStorage.getItem("email"))==='string')
        {
            if($(this).siblings(".user_id").text()===sessionStorage.getItem('id'))
            {
                val=$(this).val();
              //  console.log(val+"Link");
                $("#modalDelete").modal();
                $("#delete").click(function(){
                    $("#modalDelete").modal('hide');
                //    console.log("Before Delete");
                    del_category(val);
                });
            }
            else
                $("#modalAuthorizationVerification").modal();
        }
        else
            $("#modalAccessVerification").modal();
    });

    //when any Category is clicked 
    // shows the list of items in the main section

    $("#side").on('click',".cat .name",function(){
        $("#main_bar").show();
        items($(this).siblings("span.id").text()+"-"+$(this).siblings("span.user_id").text());
    });

    // When Create Item button is Clicked

    $("#create_item").on('click',function(){
        if(typeof(sessionStorage.getItem("email"))==='string')
        {
            id_and_user_id=$("#create_item").val().split("-");
            if(id_and_user_id[1]===sessionStorage.getItem('id'))
            {    
                $("#submit_item").html("Create-Item");
                $("#cat_id").val(id_and_user_id[0]);
                $("#item_id").val("");
                $("#item_name").val("");
                $("#item_price").val("");
                $("#item_description").val("");
                $("#modalItemForm .modal-title").text("Create New Item");
                $("#modalItemForm").modal();
            }
            else
                $("#modalAuthorizationVerification").modal();
        }
        else
            $("#modalAccessVerification").modal();
        
    });

    // Handles the Update/Edit the Items


    $("#main").on('click',".item .card-body .card-edit",function(){
        if(typeof(sessionStorage.getItem("email"))==='string')
        {
            if($(this).siblings(".card-cat-user_id").text()===sessionStorage.getItem('id'))
            {
                $("#cat_id").val($(this).siblings(".card-cat-id").text());
                $("#item_id").val($(this).siblings(".card-item-id").text());
                $("#item_name").val($(this).siblings(".card-title").text());
                $("#item_price").val($(this).siblings(".card-price").text());
                $("#item_description").val($(this).siblings(".card-text").text());
		$("#modalItemForm .modal-title").text("Update Item");
                $("#submit_item").html("Update-Item");
                $("#modalItemForm").modal();
            }
            else
                $("#modalAuthorizationVerification").modal();

        }
        else
            $("#modalAccessVerification").modal();
    });

    
        //New Items Form Submission "Create-Item" button is clicked
        //It creates and Updates Items 

    $("#submit_item").click(function(){

        cat_id=$("#item_form input[name=cat_id").val();
        item_id=$("#item_form input[name=item_id").val();
        if($("#item_form input[name=item]").val()==="")
        {
            alert("Name Can not be empty");
            return;
        }
        name=$("#item_form input[name=item]").val();
        if($("#item_form input[name=price]").val()==="")
        {
            alert("Price Can not be empty");
            return;
        }
        price=$("#item_form input[name=price]").val();
        if($("#item_description").val()==="")
        {
            alert("Description Can not be empty");
            return;
        }
        description=$("#item_description").val();
        // console.log(description);
        $("#modalItemForm").modal('hide');
        var path="/categories/"+cat_id+"/items/"+item_id+"/edit/";
        req_type="PUT";
        if($(this).html()==="Create-Item")
        {   path="/categories/"+cat_id+"/items/create/";
            req_type="POST";
        }
        formData={
            'name':name,
            'price':price,
            'description':description
        };
        //console.log(formData);
        //console.log(path);
        $.ajax({
        type:req_type,
        url:path,
        data:JSON.stringify(formData),
        dataType: "json",
        contentType : "application/json",
        success:function(result){
            if (typeof(result)==="object")
            {    //alert("Succesfull");
                if(req_type==="PUT")
                    $("#flash").addClass("flash").text("Item Updated Successfully");
                else
                    $("#flash").addClass("flash").text("Item Created Successfully");
                setTimeout(function(){
                    $("#flash").empty();
                    $("#flash").removeClass("flash")
                },5000);
                list_of_items("/categories/"+cat_id+"/items/");
            }
            }
        });
    });

        
    //Handles the deletion of the items 


    $("#main").on('click',".item .card-body .card-delete",function(event){
        if(typeof(sessionStorage.getItem("email"))==='string')
        {
            if($(this).siblings(".card-cat-user_id").text()===sessionStorage.getItem('id'))
            {
                $("#modalDelete").modal();
                id=$(this).val().split("-");
                val="/categories/"+id[0]+"/items/"+id[1]+"/delete/";
                $("#delete").click(function(){
                    $("#modalDelete").modal('hide');
                    del_category(val);
                    list_of_items("/categories/"+id[0]+"/items/");
                    event.stopPropagation();
                    });
            }
            else
                $("#modalAuthorizationVerification").modal();    

        }
        else
            $("#modalAccessVerification").modal();
    });

    //Logout Funtion

    $("#collapsibleNavbar").on('click','#logout',function(){
        $.ajax({
            url:'/gdisconnect',
            success:function(result){
                if(typeof(result)==='string')
                {
                    sessionStorage.removeItem('id');
                    sessionStorage.removeItem('email');
                    sessionStorage.removeItem('picture');
                    $("#header-email").empty();
                    $("#header-picture").attr('src',"../static/default.jpg");
                    $("#login-button").append("<a class='nav-link btn btn-outline-dark btn-sm' href='#'>Login</a>");
                    list_of_categories();
                    $("#main").empty();
                    $("#flash").addClass("flash").text("Logout Successfully");
                    setTimeout(function(){
                        $("#flash").empty();
                        $("#flash").removeClass("flash")
                    },5000);
                }
            }   
            
        });
    });

});
