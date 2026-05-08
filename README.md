# Web Services And Applications Project
## Author: Orla Woods

This repository contains my project for the Web Services and Applications (WSAA) module at ATU. 

## Background

Create a Web application that uses RESTful APIs to perform CRUD operations to some data in one or more database tables, and/or some third party API. 

basic hosted Flask server that has a  1. REST API, (to perform CRUD operations) 2. One database table and 3. Accompanying web interface, to perform these CRUD operations. (eg using AJAX calls)

I work in Royal College of Physicians of Ireland (RCPI). RCPI delivers postgraduate medical training, namely Basic Specialist Training (BST) in 4 specialties (Obstetrics and Gynaecology, Histopathology, General Internal Medicine and Paediatrics) and Higher Specialist Training (HST) in 29 specialties, including cardiology, neonatology, geriatric medicine, respiratory medicine, etc. 
Each year, the College receives BST applications from doctors who have competed their medical degree and their intern year and wish to begin their specialist training. Therefore, using my workplace for context, I want to design an interface which will allow College administrators to log each of the applicants, their chosen training scheme, date of birth, and then automatically assign them an RCPI ID. I want to allow administrators to come back to the interface to add applicant's interview scores after interview (the basis upon which offers are made), whether or not the applicant was offered a place and whether this was accepted or not. Ideally then, administrators would be able to gather all of the acceptances for each specialty to create a final list of trainees for each of the 4 BST specialties. As this is a live database, any changes could be made (change acceptance to rejection), the list ranked from top interview score, descending, and when I pull an updated list this change will be reflected. This will be the API.

 
Server side:
Part 1: As this needs to be hosted, create pythonanywhere account
Part 2: Create the database table in mysql. The database will be call BST applicants and the attributes recorded will be “First Name”, “Surname”, DOB, BST Scheme, Interview Score, Place offered, Acceptance/Refusal
Part 3: Write the DAO (BST_DAO.py) and test it can connect to the database. This is what is on pythonanywhere. Indicate the functions I want to do to the database e.g. update, delete (CRUD)
Part 4: Write the Flask end points that map my API endpoints and test them (server.py). This calls the BST_DAO which will link to the database and interactions with the database. 
Part 5: Connect the endpoints to the DAO and text (server.py) – in server.py call your DAO
Test all above, server side done

Front end:
Part 6: Make a front end (HTML webpage; BSTApplications.html) – call up a form and update
Part 7: Make the functionality for the front end with JavaScript for functionality (BST_applications.js)
Part 8: Have the front end call the backend (the API) in the javascript using AJAX (apps.js) to make the API calls (relative addresses are best) 
Part 9: make it look nice (css)
Note Parts 6-9 are the static pages

As part of this, I want the following

-	Put each of HTML, CSS, Javascript, DAO, server etc. in their own file
-   No react code
-	HTML, CSS and javascript in separate files
-	Have testing within each step
-	Use the correct status codes
-	Can use abort()
-	Don’t use rendering templates
-	JSON output
-	Keep Flask functions as short as possible
-	If there is a lot to do send to a second or more function
-   Use a configuration file for database access
-   Use connection pooling in DAO
-   Do not allow SQL injection, do not directly code attributes
-   Include a README and a gitignore file
-   Save this repository showing all of the above

The CRUD operations I will need to perform are:
- Create for “First Name”, “Surname”, DOB, BST Scheme, Interview Score, Place offered, Acceptance/Refusal, RCPIID (auto-incremented automatically)
- Update (modify) for all of the above mattributes, but not for RCPIID as there cannot be duplicates for this
- Delete all or any of the above attributes for any applicant, including deletion of entire applicants
- Read the list of all applicants, ranked by descending interview score
- Read the list of all applicants who received offers of a place
- Read the list of all applicants, being able to see who accepted offers and refused for each specialty

If First name, surname, DOB or BST scheme are not entered by the applicant an error message must appear asking for these. Only entry of all of these attributes will allow the creation of a RCPIID and addition to the database. 

To assist me with this, I have subscribed to Claude Code. 

### Request 1 to LLM 

To provide backgroud, I uploaded the project description and the description and project design I have in my README file. Claude's response was: 

This is a really well thought-out brief — very clear requirements. Let me summarise what we're building and then we'll go file by file:RCPI BST Applicant Management System

Flask + MySQL (PythonAnywhere)
Single table: bst_applicants
Full CRUD via REST API
Vanilla JS frontend with AJAX (no React, no template rendering)
Separate files: server.py, BST_DAO.py, db_config.py, BSTApplications.html, BST_applications.js, style.css



### How to run



### Expected output - assignment04-github.py

 
## Requirements




## Technologies Used


## END