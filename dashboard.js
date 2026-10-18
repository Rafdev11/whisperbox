
/* =========================================
   WHISPERBOX DASHBOARD
   Powered by Abdulrafiu 💜
========================================= */

const welcome = document.getElementById("welcome");
const profileLink = document.getElementById("profile-link");
const dashboardMessage =
  document.getElementById("dashboard-message");

const inboxList = document.getElementById("inbox-list");
const inboxStatus = document.getElementById("inbox-status");
const refreshInboxButton =
  document.getElementById("refresh-inbox");

const originalPageTitle = document.title;

let inboxLoading = false;
let currentUserId = null;
let lastInboxSignature = null;


// =========================================
// 1. LOAD USER DASHBOARD
// =========================================

async function loadDashboard() {
  const {
    data: { user },
    error: authError
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    window.location.replace("login.html");
    return;
  }

  currentUserId = user.id;

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    welcome.textContent =
      "Your account is active, but your profile could not be loaded.";

    dashboardMessage.textContent =
      "Please check your profile in Supabase.";

    return;
  }

  welcome.textContent =
    `Hello @${profile.username}! 💜`;

  const link = new URL(
    "message.html",
    window.location.href
  );

  link.searchParams.set("to", profile.username);

  profileLink.value = link.toString();
}


// =========================================
// 2. COPY PERSONAL MESSAGE LINK
// =========================================

document.getElementById("copy-link")
  .addEventListener("click", async () => {

    if (!profileLink.value) return;

    try {
      await navigator.clipboard.writeText(
        profileLink.value
      );

      dashboardMessage.textContent =
        "Link copied! 🔗";

    } catch {
      profileLink.select();

      dashboardMessage.textContent =
        "Select and copy your link manually.";
    }
  });


// =========================================
// 3. LOG OUT
// =========================================

document.getElementById("logout")
  .addEventListener("click", async () => {

    const { error } =
      await supabaseClient.auth.signOut();

    if (error) {
      dashboardMessage.textContent =
        error.message;

      return;
    }

    window.location.replace("login.html");
  });


// =========================================
// 4. LOAD PRIVATE INBOX
// =========================================

async function loadInbox() {

  // Prevent multiple refreshes at the same time
  if (inboxLoading) return;

  inboxLoading = true;

  try {
    if (lastInboxSignature === null) {
      inboxStatus.textContent =
        "Loading your messages...";
    }

    // Get logged-in user
    const {
      data: authData,
      error: authError
    } = await supabaseClient.auth.getUser();

    const user = authData?.user;

    if (authError || !user) {
      inboxStatus.textContent =
        "Please log in to see your messages.";

      return;
    }

    // Prevent displaying a previous account's inbox
    if (currentUserId !== user.id) {
      currentUserId = user.id;
      lastInboxSignature = null;
      inboxList.replaceChildren();
    }

    // Get messages belonging to this user
    const { data: messages, error } =
      await supabaseClient
        .from("messages")
        .select("id, content, created_at, is_read")
        .eq("recipient_id", user.id)
        .order("created_at", {
          ascending: false
        });

    if (error) {
      console.error("Inbox error:", error);

      inboxStatus.textContent =
        "Couldn't load your messages. Please try again.";

      return;
    }

    // EMPTY INBOX
    if (!messages || messages.length === 0) {

      inboxList.replaceChildren();

      inboxStatus.textContent =
        "No anonymous messages yet. Share your link! 💜";

      document.title = originalPageTitle;

      lastInboxSignature = "empty";

      return;
    }

    // =====================================
    // 5. COUNT UNREAD MESSAGES
    // =====================================

    const unreadCount = messages.filter(
      (message) => !message.is_read
    ).length;

    inboxStatus.textContent =
      `💌 ${messages.length} messages | 🔔 ${unreadCount} unread`;

    // Update browser tab title
    document.title = unreadCount > 0
      ? `(${unreadCount}) Dashboard — WhisperBox`
      : originalPageTitle;

    // Check whether messages have changed
    const inboxSignature = JSON.stringify(
      messages.map((message) => [
        message.id,
        message.is_read
      ])
    );

    // Don't redraw inbox if nothing changed
    if (inboxSignature === lastInboxSignature) {
      return;
    }

    lastInboxSignature = inboxSignature;

    inboxList.replaceChildren();

    // =====================================
    // 6. DISPLAY ANONYMOUS MESSAGES
    // =====================================

    messages.forEach((message) => {

      const card =
        document.createElement("article");

      card.className = "inbox-message";

      if (!message.is_read) {
        card.classList.add("unread-message");
      }

      const top =
        document.createElement("div");

      top.className = "inbox-message-top";

      const sender =
        document.createElement("span");

      sender.className = "inbox-message-sender";
      sender.textContent = "🤫 Anonymous";

      const date =
        document.createElement("span");

      date.className = "inbox-message-date";

      date.textContent = new Date(
        message.created_at
      ).toLocaleString();

      const content =
        document.createElement("p");

      content.className = "inbox-message-content";

      // Display messages safely
      content.textContent = message.content;

      top.append(sender, date);

      // ===================================
      // 7. NEW MESSAGE LABEL
      // ===================================

      if (!message.is_read) {

        const newLabel =
          document.createElement("span");

        newLabel.className = "new-message-label";
        newLabel.textContent = "NEW";

        // =================================
        // 8. MARK AS READ BUTTON
        // =================================

        const markReadButton =
          document.createElement("button");

        markReadButton.type = "button";
        markReadButton.className = "mark-read-btn";

        markReadButton.textContent =
          "✓ Mark as Read";

        markReadButton.addEventListener(
          "click",
          async () => {

            markReadButton.disabled = true;

            markReadButton.textContent =
              "Updating...";

            const { error: updateError } =
              await supabaseClient
                .from("messages")
                .update({
                  is_read: true
                })
                .eq("id", message.id)
                .eq("recipient_id", user.id);

            if (updateError) {

              console.error(
                "Mark as read error:",
                updateError
              );

              alert(
                "Couldn't mark this message as read."
              );

              markReadButton.disabled = false;

              markReadButton.textContent =
                "✓ Mark as Read";

              return;
            }

            // Force inbox to refresh
            lastInboxSignature = null;

            await loadInbox();
          }
        );

        card.append(
          top,
          newLabel,
          content,
          markReadButton
        );

      } else {

        card.append(
          top,
          content
        );
      }

      inboxList.appendChild(card);
    });

  } catch (error) {

    console.error(
      "Unexpected inbox error:",
      error
    );

    inboxStatus.textContent =
      "Something went wrong while loading messages.";

  } finally {

    inboxLoading = false;
  }
}


// =========================================
// 9. MANUAL REFRESH BUTTON
// =========================================

refreshInboxButton.addEventListener(
  "click",
  loadInbox
);


// =========================================
// 10. AUTOMATIC INBOX NOTIFICATIONS
// =========================================

function refreshLiveInbox() {

  // Skip checking while tab is hidden
  if (document.hidden) return;

  loadInbox();
}

// Check for messages every 15 seconds
setInterval(refreshLiveInbox, 15000);


// =========================================
// 11. REFRESH WHEN USER RETURNS
// =========================================

document.addEventListener(
  "visibilitychange",
  () => {

    if (!document.hidden) {
      loadInbox();
    }
  }
);


// =========================================
// 12. START WHISPERBOX DASHBOARD
// =========================================

loadDashboard();
loadInbox();
