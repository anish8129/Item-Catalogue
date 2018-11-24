# Item Catalogue Project
This is a project for Udacity's [Full Stack Web Developer Nanodegree](https://www.udacity.com/course/full-stack-web-developer-nanodegree--nd004)
## Project Description:
Your Task is to create a web application.
Which has Login and logout feature.
You should be able to create your Category and Items
You should be able to Update and delete them.
You should not be able to update and delete Other Items.
## This Project Requires a Bit of Setup:
This project is run in a virutal machine created using Vagrant so there are a few steps
to get set up:
#### Installing the dependencies and setting up the files:
1. Install [Vagrant](https://www.vagrantup.com/)
2. Install [VirtualBox](https://www.virtualbox.org/)
3. Download the vagrant setup files from [Udacity's Github](https://github.com/udacity/fullstack-nanodegree-vm)
These files configure the virtual machine and install all the tools needed to run this project.
7. Download this project: [Item-Catalogue]
8. Upzip as needed and copy all files into the vagrant directory into a folder called Item-Catalogue
#### Start the Virtual Machine:
9. Open Terminal and navigate to the project folders we setup above.
10. cd into the vagrant directory
11. Run ``` vagrant up ``` to build the VM for the first time.
12. Once it is built, run ``` vagrant ssh ``` to connect.
13. cd into the correct project directory: ``` cd /vagrant/Item-Catalogue ```

## Run The Project Already!
1. You should already have vagrant up and be connected to it. 
2. If you aren't already, cd into the correct project directory: ``` cd /vagrant/Item-Catalogue ```
3. Run ``` python routes.py ``` 
4. Open a Web browzer and open http://localhost:5000/ .It will load the web page
## Expected Output:
   
5. Show Categories button Will show the list of Categories If any.
   To create Category You should Login First.

6. To Login, Click the Login Button..It will Open a Modal Window.
   Login With Facebook will not work (Facebook Oauth works for https only) just to beautify the modal window it is included.
   You Should do log in with google only.

7. For succesfull login a flash message will show for 5 seconds and your profile pic and your email should show.
   Now you can create your own Categories.
 
8. You can not edit or update categories if it is created by some one else.
   
9. You can not update or delete your own items without loggin in.

10. You can only see the Items and Categories by clicking on it, if not Logged in

11. You will not able to see the update or delete links if you are not logged in as a user.

12. For every action (create/Update/Delete/Login/Log Out) flash message will show for 5 seconds.

13. Form Validation is implemented  in Items/Categories creation.

14. If you try to edit create or Update any items or categories through postman. you will get appropriate messages.


##Note:
 You should not refresh/reload the page if you are logged in.
 Next Time while loggin in You may have some issue.
 To log out through through postman call this api in postman (http://localhost:5000/gdisconnect)
  


 
