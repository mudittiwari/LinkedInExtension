import illustration from '~/assets/Frame.png';
import '~/assets/tailwind.css';
export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  main() {
    const messageBoxes = document.getElementsByClassName("msg-form__msg-content-container--scrollable scrollable relative");
    console.log(messageBoxes);
    if (messageBoxes.length > 0) {
      let messageBox = messageBoxes[0];
      const handleClickOutside = (event: MouseEvent): void => {
        if (!messageBox.contains(event.target as Node)) {
          let icon = document.getElementById("ai-icon");
          if (icon) {
            messageBox.removeChild(icon);
          }
        } else {
          const icon = createAIIcon();
          icon.addEventListener('click', openModal);
          messageBox.appendChild(icon);
        }
      };
      document.addEventListener('click', handleClickOutside);
    }
  },
});

const createAIIcon = (): HTMLImageElement => {
  const aiIcon = document.createElement('img') as HTMLImageElement;
  aiIcon.id = 'ai-icon';
  aiIcon.src=illustration;
  aiIcon.style.cssText = `
    position: absolute;
    right: 10px;
    bottom: 10px;
    cursor: pointer;`;
  return aiIcon;
}



const openModal = (): void => {
  console.log("hello how are you doing");
  const modal = document.createElement('div');
  modal.id = 'ai-modal';
  modal.className = "fixed inset-0 w-full h-full z-[100] bg-black bg-opacity-50 flex justify-center items-center";
  const modalContent = document.createElement('div');
  modalContent.className = `
    bg-white p-6 rounded-lg shadow-lg space-y-4 w-1/2
  `;
  modalContent.innerHTML = `
  <div id="chat-container" class="flex flex-col space-y-4 mb-4 overflow-y-auto max-h-72"></div>
    <input id="ai-command" type="text" style="outline:none;border:0px solid black;" placeholder="Your Promt" class="w-full p-2 rounded-md" />
    <div class="flex space-x-2 justify-end w-full">
      <button id="generate-btn" disabled class="bg-blue-500 text-white py-2 px-4 rounded cursor-not-allowed opacity-50">Generate</button>
      <button id="insert-btn" class="hidden bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 focus:outline-none">Insert</button>
      <button id="regenerate-btn" disabled class="hidden bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed">Regenerate</button>
      
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
  const inputField = document.getElementById('ai-command') as HTMLInputElement;
  if (generateBtn && inputField) {
    inputField.addEventListener('input', () => {
      if (inputField.value.trim()) {
        generateBtn.disabled = false;
        generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    });
  }
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });

  document.getElementById('generate-btn')?.addEventListener('click', () => {


    const userPrompt = (document.getElementById('ai-command') as HTMLInputElement).value;

    if (userPrompt) {
      const chatContainer = document.getElementById('chat-container');

      const userMessage = document.createElement('div');
      userMessage.className = 'self-end bg-blue-500 text-white p-2 rounded-lg max-w-[70%] break-words';
      userMessage.textContent = userPrompt;
      chatContainer?.appendChild(userMessage);

      const serverMessage = document.createElement('div');
      serverMessage.className = 'self-start bg-gray-200 text-black p-2 rounded-lg max-w-[70%] break-words';
      serverMessage.textContent = "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.";
      chatContainer?.appendChild(serverMessage);


      const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
      const insertBtn = document.getElementById('insert-btn') as HTMLButtonElement;
      const regenerateBtn = document.getElementById('regenerate-btn') as HTMLButtonElement;

      generateBtn.classList.add('hidden');
      insertBtn.classList.remove('hidden');
      regenerateBtn.classList.remove('hidden');


      chatContainer?.scrollTo(0, chatContainer.scrollHeight);
      (document.getElementById('ai-command') as HTMLInputElement).value = '';
    }





  });

  document.getElementById('insert-btn')?.addEventListener('click', () => {
    console.log("Insert button clicked");

    const chatContainer = document.getElementById('chat-container');
    const serverMessages = chatContainer?.querySelectorAll('.self-start');

    if (serverMessages && serverMessages.length > 0) {
      const lastServerMessage = serverMessages[serverMessages.length - 1].textContent;

      if (lastServerMessage) {
        console.log("Last server message:", lastServerMessage);

        const messageBox = document.getElementsByClassName(
          'msg-form__contenteditable t-14 t-black--light t-normal flex-grow-1 full-height notranslate'
        )[0] as HTMLElement;

        if (messageBox) {
          const pTag = messageBox.querySelector('p');

          if (pTag) {
            pTag.textContent = lastServerMessage;
            console.log("Message inserted into LinkedIn message box");
            const placeholderDiv = document.querySelector('.msg-form__placeholder');
            if (placeholderDiv) {
              placeholderDiv.classList.remove('msg-form__placeholder');
              console.log("Placeholder classes changed");
            }
            const modal = document.getElementById("ai-modal");
            if (modal) {
              modal.remove();
              console.log("modal removed from page");
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
