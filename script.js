document.addEventListener("DOMContentLoaded", () => {
  const micBtn = document.querySelector(".mic-button");
  if (!micBtn) {
    console.warn("🎤 Mikrofon-Button nicht gefunden.");
    return;
  }

  let isActive = false;

  const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; // Hier deinen OpenAI API-Key eintragen

  micBtn.addEventListener("click", () => {
    if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith("sk-")) {
      alert("⚠️ Kein gültiger OpenAI API-Key gefunden. Bitte trage deinen gültigen Key in script.js ein.");
      return;
    }

    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Spracherkennung wird in deinem Browser nicht unterstützt.");
      return;
    }

    isActive = !isActive;
    micBtn.style.transition = "background-color 0.3s ease, transform 0.2s ease";
    micBtn.style.backgroundColor = isActive ? "lightgreen" : "";
    micBtn.style.transform = isActive ? "scale(1.1)" : "";

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "de-DE";
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      const spoken = event.results[0][0].transcript.toLowerCase();
      console.log("Gesagt:", spoken);
      try {
        const intent = await getIntentFromAI(spoken);
        console.log("Intent erkannt:", intent);
        handleIntent(intent);
      } catch (error) {
        console.error("Fehler bei Intent-Erkennung:", error);
        alert("Es gab ein Problem bei der Verarbeitung.");
      }
    };

    recognition.onerror = (event) => {
      console.error("Spracherkennungsfehler:", event.error);
      alert("Fehler bei der Spracherkennung.");
    };

    recognition.start();
  });

  async function getIntentFromAI(text) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a voice assistant that returns one intent ID.",
          },
          {
            role: "user",
            content: `Welche Aktion passt zu: "${text}"? Gib nur eine ID zurück: go_home, go_contact_page, go_about`,
          },
        ],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  function handleIntent(intent) {
    const intentMap = {
      go_home: "/index.html",
      go_contact_page: "/kontakt.html",
      go_about: "/about.html",
    };

    if (intentMap[intent]) {
      window.location.href = intentMap[intent];
    } else {
      alert("Das habe ich nicht verstanden.");
    }
  }
});
