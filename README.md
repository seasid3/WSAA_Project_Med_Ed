# Web Services And Applications Project
## Author: Orla Woods

This repository contains my project for the Web Services and Applications (WSAA) module at ATU. 

## Background

Create a Web application that uses RESTful APIs to perform CRUD operations to some data in one or more database tables, and/or some third party API. 

basic hosted Flask server that has a  1. REST API, (to perform CRUD operations) 2. One database table and 3. Accompanying web interface, to perform these CRUD operations. (eg using AJAX calls)

I work in Royal College of Physicians of Ireland (RCPI). RCPI delivers postgraduate medical training, namely Basic Specialist Training (BST) in 4 specialties (Obstetrics and Gynaecology, Histopathology, General Internal Medicine and Paediatrics) and Higher Specialist Training (HST) in 29 specialties, including cardiology, neonatology, geriatric medicine, respiratory medicine, etc. 
Each year, the College receives applications from BST applicants who have usually completed their medical degree and their intern year. I want to design an interface which will allow College administrators to log each of the applicants, their chosen training scheme, and come back to the interface to add their interview scores after interview, whether or not the applicant was offered a place and whether this was accepted or not. Ideally then, I would be able to gather all of the acceptances for each specialty to create a final list of trainees for each of the 4 specialties. As this is a live database, any changes could be made (change acceptance to rejection) and when I pull an updated list this change will be reflected. This will be the API.
The CRUD operations I will need to carry out are: 
Needs to be hosted (pythonanywhere)

Part 1: Create pythonanywhere account
Part 2: Create the database table in mysql. The database will be call BST applicants and the attributes recorded will be “First Name”, “Surname”, DOB, BST Scheme, Interview Score, Place offered, Acceptances
Part 3: Write the DAO (BST_DAO.py) and test it. This is what is on pythonanywhere. Indicate the functions for what you want to do to the database e.g. update, delete (CRUD)
Part 4: Write the Flask end points that map your API endpoints and test them (server.py). This calls the BST_DAO which will link to the database and does the interaction with the database. 
Part 5: Connect the endpoints to the DAO and text (server.py) – in server.py call your DAO
Test all above: server side done

Now do your front end:
Part 6: Make a front end (HTML – BSTApplications.html) – call up a form and update
Part 7: Make the functionality for the front end with JavaScript (BST_applications.js)
Part 8: Have the front end call the backend (the API) in the javascript using AJAX (apps.js) (relative addresses are best) 
Part 9: make it look nice (css)
Note Parts 6-9 are the static pages


-	No react code
-	HTML, CSS and javascript in separate files
-	Have testing within each step
-	Use the correct status codes
-	Can use abort()
-	Don’t use rendering templates
-	JSON output
-	Keep Flask functions as short as possible
-	If there is a lot to do send to a second or more function
-	



### Files in this folder



### How to run



### Expected output - assignment04-github.py

 
## Requirements




## Technologies Used


## END