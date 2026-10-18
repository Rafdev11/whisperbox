
const params = new URLSearchParams(window.location.search);

const username = (params.get("to") || "").toLowerCase();

const recipientName = document.getElementById("recipient-name");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message");
const messageStatus = document.getElementById("message-status");
const sendButton = document.getElementById("send-button");

let recipientId = null;

async function loadRecipient() {
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    recipientName.textContent = "Invalid profile link";
    messageStatus.textContent = "Please check the link and try again.";
    sendButton.disabled = true;
    return;
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .maybeSingle();

  if (error || !data) {
    recipientName.textContent = "User not found";
    messageStatus.textContent = "This WhisperBox profile is unavailable.";
    sendButton.disabled = true;
    return;
  }

  recipientId = data.id;
  recipientName.textContent = "Message @" + data.username;
}

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const content = messageInput.value.trim();

  if (!recipientId) {
    messageStatus.textContent = "Recipient not found.";
    return;
  }

  if (content.length < 1 || content.length > 500) {
    messageStatus.textContent =
      "Please enter a message between 1 and 500 characters.";
    return;
  }

  sendButton.disabled = true;
  sendButton.textContent = "Sending...";
  messageStatus.textContent = "";

  const { error } = await supabaseClient
    .from("messages")
    .insert({
      recipient_id: recipientId,
      content: content
    });

  if (error) {
    console.error("Message error:", error);
    messageStatus.style.color = "#c62828";
    messageStatus.textContent =
      "Couldn't send your message. Please try again.";
  } else {
    messageStatus.style.color = "#2e7d32";
    messageStatus.textContent =
      "Your anonymous message was sent successfully! 💜";

    messageInput.value = "";

    // Remove the previous invitation to avoid duplicates.
    const oldInvite = document.getElementById("whisperbox-invite");
    if (oldInvite) oldInvite.remove();

    // Create the invitation.
    const invite = document.createElement("div");
    invite.id = "whisperbox-invite";

    invite.style.cssText = `
      margin-top: 20px;
      padding: 24px;
      background: #241633;
      border: 1px solid #8b5cf6;
      border-radius: 16px;
      text-align: center;
      color: white;
    `;

    invite.innerHTML = `
      <h2 style="color:#c084fc; margin-bottom:12px;">
        💜 Create Your Own WhisperBox
      </h2>

      <p style="line-height:1.6; margin-bottom:20px;">
        Want to receive anonymous messages too? 🤫💌
        <br>
        Create your own link, share it with friends,
        and discover what they have to say!
      </p>

      <a href="index.html"
         style="
           display:inline-block;
           background:#8b5cf6;
           color:white;
           padding:14px 24px;
           border-radius:10px;
           text-decoration:none;
           font-weight:bold;
         ">
        Create Your Own Link 💜 →
      </a>

      <p style="font-size:12px; color:#c4addb; margin-top:18px;">
        Powered by Abdulrafiu 💜
      </p>
    `;

    messageStatus.insertAdjacentElement("afterend", invite);
  }

  sendButton.disabled = false;
  sendButton.textContent = "Send Anonymous Message 💌";
});

loadRecipient();
