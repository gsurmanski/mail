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
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
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
    function load_mailbox(mailbox) {
  
      // Show the mailbox and hide other views
      document.querySelector('#emails-view').style.display = 'block';
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
          element.innerHTML = `From: ${email.sender} | Subject: ${email.subject} | Date: ${email.timestamp}`;
          
          //if email is marked as read in database, render as grey
          if (email.archived === true) {
            element.style.backgroundColor = "grey";
          }

          //create event listner for each email to do stuff when clicked
          element.addEventListener('click', () => {
            //if clicked, update database with PUT to set entry to gret
            fetch('/emails', { 
              method: "PUT", 
              body: JSON.stringify({
                read: true
              })
            });
            
          })
          document.querySelector('#emails').append(element);

          console.log(emails);
        })
      })

    }
    //display emails
    emails.forEach(email => {
      const element = document.createElement('div');
      element.innerHTML = `From: ${email.sender} | Subject: ${email.subject} | Date: ${email.timestamp}`;
      
      //if email is marked as read in database, render as grey
      if (email.archived === true) {
        element.style.backgroundColor = "grey";
      }

      //create event listner for each email to do stuff when clicked
      element.addEventListener('click', () => {
        //if clicked, update database with PUT to set entry to gret
        fetch('/emails', { 
          method: "PUT", 
          body: JSON.stringify({
            read: true
          })
        });
        
      })
      document.querySelector('#emails').append(element);

      console.log(emails);
    })
  })

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