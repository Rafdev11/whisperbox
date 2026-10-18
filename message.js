
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
  }

  sendButton.disabled = false;
  sendButton.textContent = "Send Anonymous Message 💌";
});

loadRecipient();
