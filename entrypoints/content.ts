import icon from "~/assets/icon.png";
import generate from "~/assets/generate.png";
import insert from "~/assets/insert.png";
import regenerate from "~/assets/regenerate.png";
import "~/assets/tailwind.css";
export default defineContentScript({
  matches: ["*://*.linkedin.com/*"],
  main() {
    //using observer so that code is executed when full page is loaded
    const observer = new MutationObserver(() => {
      const messageBoxes = document.getElementsByClassName(
        "msg-form__msg-content-container--scrollable scrollable relative"
      );
      if (messageBoxes.length > 0) {
        let messageBox = messageBoxes[0];
        const handleClickOutside = (event: MouseEvent): void => {
          //adding or removing the AI Icon when messaage box is focused
          if (!messageBox.contains(event.target as Node)) {
            let icon = document.getElementById("ai-icon");
            if (icon) {
              messageBox.removeChild(icon);
            }
          } else {
            let AIIcon = document.getElementById("ai-icon");
            if (!AIIcon) {
              const icon = createAIIcon();
              icon.addEventListener("click", openModal);
              messageBox.appendChild(icon);
            }
          }
        };
        document.addEventListener("click", handleClickOutside);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});

//creating AI Icon using the image from figma
const createAIIcon = (): HTMLImageElement => {
  const aiIcon = document.createElement("img") as HTMLImageElement;
  aiIcon.id = "ai-icon";
  aiIcon.src = icon;
  aiIcon.className = `
    absolute h-14 w-14 
    right-2 bottom-0 
    cursor-pointer
  `;
  return aiIcon;
};

const openModal = (): void => {
  const modal = createModal();
  document.body.appendChild(modal);
  //adding event listner to window for closing the modal when clicked outside the content area
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
  addPromptFieldEventListner();
  addGenerateButtonEventListner();
  addInsertButtonEventListner();
};

const addPromptFieldEventListner = (): void => {
  const generateBtn = document.getElementById(
    "generate-btn"
  ) as HTMLButtonElement;
  const inputField = document.getElementById("ai-command") as HTMLInputElement;
  if (generateBtn && inputField) {
    inputField.addEventListener("input", () => {
      if (inputField.value.trim()) {
        generateBtn.disabled = false;
        generateBtn.classList.remove("opacity-50", "cursor-not-allowed");
      } else {
        generateBtn.disabled = true;
        generateBtn.classList.add("opacity-50", "cursor-not-allowed");
      }
    });
  }
};

const addGenerateButtonEventListner = (): void => {
  document.getElementById("generate-btn")?.addEventListener("click", () => {
    const userPrompt = (
      document.getElementById("ai-command") as HTMLInputElement
    ).value;

    if (userPrompt) {
      const chatContainer = document.getElementById("chat-container");
      const userMessage = document.createElement("div");
      userMessage.className = `
        self-end p-3 rounded-lg max-w-[70%] break-words 
        bg-[#DFE1E7] text-[#666D80]
      `;
      userMessage.textContent = userPrompt;
      chatContainer?.appendChild(userMessage);

      const serverMessage = document.createElement("div");
      serverMessage.className = `
        self-start p-3 rounded-lg max-w-[70%] break-words 
        bg-[#DBEAFE] text-[#666D80]
      `;
      serverMessage.textContent =
        "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.";
      chatContainer?.appendChild(serverMessage);

      const generateBtn = document.getElementById(
        "generate-btn"
      ) as HTMLButtonElement;
      const insertBtn = document.getElementById(
        "insert-btn"
      ) as HTMLButtonElement;
      const regenerateBtn = document.getElementById(
        "regenerate-btn"
      ) as HTMLButtonElement;

      generateBtn.classList.add("hidden");
      insertBtn.classList.remove("hidden");
      regenerateBtn.classList.remove("hidden");

      chatContainer?.scrollTo(0, chatContainer.scrollHeight);
      (document.getElementById("ai-command") as HTMLInputElement).value = "";
    }
  });
};

const addInsertButtonEventListner = (): void => {
  document.getElementById("insert-btn")?.addEventListener("click", () => {

    const chatContainer = document.getElementById("chat-container");
    const serverMessages = chatContainer?.querySelectorAll(".self-start");

    if (serverMessages && serverMessages.length > 0) {
      const lastServerMessage =
        serverMessages[serverMessages.length - 1].textContent;

      if (lastServerMessage) {

        const messageBox = document.getElementsByClassName(
          "msg-form__contenteditable t-14 t-black--light t-normal flex-grow-1 full-height notranslate"
        )[0] as HTMLElement;

        if (messageBox) {
          const pTag = messageBox.querySelector("p");

          if (pTag) {
            pTag.textContent = lastServerMessage;
            const placeholderDiv = document.querySelector(
              ".msg-form__placeholder"
            );
            if (placeholderDiv) {
              placeholderDiv.classList.remove("msg-form__placeholder");
            }
            const modal = document.getElementById("ai-modal");
            if (modal) {
              modal.remove();
            }
          } else {
            console.error("No <p> tag found inside the message box");
          }
        } else {
          console.error("Message box not found");
        }
      }
    }
  });
};

const createModal = (): HTMLElement => {
  const modal = document.createElement("div");
  modal.id = "ai-modal";
  modal.className =
    "fixed inset-0 w-full h-full z-[100] bg-black bg-opacity-50 flex justify-center items-center";
  const modalContent = document.createElement("div");
  modalContent.className = `p-6 rounded-lg shadow-lg space-y-4 w-1/2`;
  modalContent.style.cssText = `
    background-color:#F9FAFB;  
  `;
  modalContent.innerHTML = `
  <div id="chat-container" class="flex flex-col space-y-4 mb-4 overflow-y-auto max-h-72"></div>
    <input id="ai-command" type="text" style="outline:none;border:0px solid black;" placeholder="Your Promt" class="w-full p-2 rounded-md" />
    <div class="flex space-x-2 justify-end w-full">
      <button id="generate-btn" disabled class="bg-[#3B82F6] pl-[30px] bg-no-repeat bg-[length:15px] text-white py-2 px-4 rounded cursor-not-allowed opacity-50" style="
        background-image: url(${generate});
        background-position: left 10px center;
      ">Generate</button>

      <button id="insert-btn" class="bg-white text-[#666D80] pl-[30px] bg-no-repeat bg-[length:15px] hidden py-2 px-4 rounded focus:outline-none" style="
        background-image: url(${insert});
        background-position: left 10px center;
        border:1px solid #666D80;
      ">Insert</button>

      <button id="regenerate-btn" disabled class="bg-[#3B82F6] bg-no-repeat bg-[length:15px] pl-[30px] hidden text-white py-2 px-4 rounded cursor-not-allowed" style="
        background-image: url(${regenerate});
        background-position: left 10px center;
      ">Regenerate</button>
    </div>
`;

  modal.appendChild(modalContent);
  return modal;
};
