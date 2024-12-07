document.addEventListener('DOMContentLoaded', function() {

  // Initialize form action for sending mail
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name and capitalize by capitalizing first letter and adding rest of string
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
  <p><div id="emails"></div></p>`;

  //get emails for mailbox selection
  fetch('/emails/' + mailbox, {
    method: "GET"
  })
  .then(response => response.json())
  .then(emails => {
    //display emails
    emails.forEach(email => {
      const element = document.createElement('div');
      //assign an element class
      element.classList.add('entry');
      //construct email
      element.innerHTML = `From: ${email.sender} | Subject: ${email.subject} | Date: ${email.timestamp}`;
      //make pointer
      element.style.cursor = "pointer";

      //if email is marked as read in database, render as grey
      if (email.read === true) {
        element.style.backgroundColor = "#F3F3F3";
      }

      // Create event listener for each email to do stuff when clicked
      element.addEventListener('click', () => {
        // If clicked, update database with PUT to set entry as read
        fetch('/emails/' + email.id, { 
          method: "PUT", 
          body: JSON.stringify({
            read: true
          })
        })
        .then(result => {
          console.log(result);
        });

        //if clicked, also load the email itself
        fetch('/emails/' + email.id, {
          method: "GET"
        })
        .then(response => response.json())
        .then(email => {

          // Show the mailbox and hide other views
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#read-view').style.display = 'block';

          document.querySelector('#read-view').innerHTML = `
          <h2>${email.subject}</h2>
          <p>From: ${email.sender} - ${email.timestamp}</p>
          <p>To: ${email.recipients}</p>
          <p><div class="message">${email.body}</p></div>`;

          //if email not archived
          if (email.archived != true) {
            //create archive button
            const archiveButton = document.createElement('button');
            archiveButton.id = 'archive';
            archiveButton.textContent = 'Archive';
            document.querySelector('#read-view').appendChild(archiveButton);
            // Create event listener for archive button
            document.querySelector('#archive').addEventListener('click', () => {
              //do something
              fetch('/emails/' + email.id, { 
                method: "PUT", 
                body: JSON.stringify({
                  archived: true
                })
              })
              .then(result => {
                console.log(result);
              });
            });
            ///////////////////
          }
          else {
            //create unarchive button
            const unarchiveButton = document.createElement('button');
            unarchiveButton.id = 'unarchive';
            unarchiveButton.textContent = 'UnArchive';
            document.querySelector('#read-view').appendChild(unarchiveButton);
            // Create event listener for archive button
            document.querySelector('#unarchive').addEventListener('click', () => {
              //do something
              fetch('/emails/' + email.id, { 
                method: "PUT", 
                body: JSON.stringify({
                  archived: false
                })
              })
              .then(result => {
                console.log(result);
              });
            });
            ///////////////////
          }
        });
      });

      document.querySelector('#emails').append(element);

      console.log(emails);
      
    });
  });
}

//function for sending mail on submit
function send_email(event) {
  event.preventDefault();

  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  fetch('/emails', {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error('Error:', error);
  });

  console.log("send_email called!");

  load_mailbox('sent');
}