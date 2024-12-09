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
      element.innerHTML = `
      <div class="row">
      <div class="col-4">${email.sender}</div>
      <div class="col-4">${email.subject}</div>
      <div class="col-4">${email.timestamp}</div>
      </div>
      `;
      //make pointer
      element.style.cursor = "pointer";

      //if email is marked as read in database, render as grey
      if (email.read === true) {
        element.style.backgroundColor = "#eaf1fb";
      }
      else {
        //unread emails are bold
        element.style.fontWeight = "bold";
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

          // Show the email and hide other views
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#read-view').style.display = 'block';

          //format email and turn line breaks from database into html <br>
          document.querySelector('#read-view').innerHTML = `
          <h2>${email.subject}</h2>
          <p id="to">To: ${email.recipients}</p>
          <p id="from">From: ${email.sender} - ${email.timestamp}</p>
          <p><div class="message">${email.body.replace(/\n/g, '<br>')}</p></div>`;

          //create reply button and set event handler
          const replyButton = document.createElement('button');
          replyButton.textContent = "Reply";
          document.querySelector('#read-view').appendChild(replyButton);
          replyButton.id = "reply";
          replyButton.className = "btn btn-primary";

          replyButton.addEventListener('click', () => {
            compose_email();
            document.querySelector('#compose-recipients').value = email.sender;
            //check if Re: already in subject, if not add it
            if (email.subject.startsWith("Re:") === false) {
              email.subject = "Re: " + email.subject;
            }
            document.querySelector('#compose-subject').value = email.subject;
            //fill out email form and put past responses below with \n
            document.querySelector('#compose-body').value = `
            \n\n\n-- \nOn ${email.timestamp}, ${email.sender} wrote:
            ${email.body}`;
          });

          //if email not archived.
          //variable userEmail defined on inbox.html
          if (email.archived != true && email.sender != userEmail) {
            //create archive button
            const archiveButton = document.createElement('button');
            archiveButton.id = 'archive';
            archiveButton.textContent = 'Archive';
            archiveButton.className = "btn btn-secondary";
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
                load_mailbox('inbox');
              });
            });
            ///////////////////
          }
          else if (email.sender != userEmail) {
            //create unarchive button
            const unarchiveButton = document.createElement('button');
            unarchiveButton.id = 'unarchive';
            unarchiveButton.textContent = 'UnArchive';
            unarchiveButton.className = "btn btn-secondary";

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
                load_mailbox('inbox');
              });
            });
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
    load_mailbox('sent');
  })
  .catch(error => {
    console.error('Error:', error);
  });

  console.log("send_email called!");

}