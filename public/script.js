// async function uploadImage() {
//   const input = document.getElementById('imageUpload');
//   const result = document.getElementById('result');
//   const loading = document.getElementById('loading');

//   if (input.files.length === 0) {
//     alert("Please upload an image");
//     return;
//   }

//   loading.style.display = 'block';

//   const formData = new FormData();
//   formData.append('image', input.files[0]);

//   const response = await fetch('/process', {
//     method: 'POST',
//     body: formData
//   });

//   const data = await response.json();
//   loading.style.display = 'none';

// //   result.textContent = `Category: ${data.category}\n\nExtracted Text:\n${data.text}`;
//     // result.textContent =
//     // `Category: ${data.category}\n` +
//     // `Vendor: ${data.vendor}\n` +
//     // `Date: ${data.date}\n` +
//     // `Total: ₹${data.total}\n\n` +
//     // `Items:\n` +
//     // data.items.map(i => `- ${i.name}: ₹${i.price}`).join('\n');

//     // result.innerHTML =
//     // `<strong>Category:</strong> ${data.category}<br>` +
//     // `<strong>Vendor:</strong> ${data.vendor}<br>` +
//     // `<strong>Date:</strong> ${data.date}<br>` +
//     // `<strong>Total:</strong> ₹${data.total}<br><br>` +
//     // `<strong>Items:</strong><br>` +
//     // data.items.map(i => `- ${i.name}: ₹${i.price}`).join('<br>') +
//     // `<br><br><a href="${data.saveUrl}" target="_blank"><button>Save to Google Wallet</button></a>`;

//     let itemsHtml = '';
//     if (Array.isArray(data.items) && data.items.length > 0) {
//     itemsHtml = data.items.map(i => `
//         <div class="item-row">
//         <span class="item-name">${i.name}</span>
//         <span class="item-price">₹${i.price}</span>
//         </div>
//     `).join('');
//     }

//     const fields = [];

//     if (data.category) {
//     fields.push(`<span class="category">${data.category}</span>`);
//     }

//     if (data.date) {
//     fields.push(`<span class="date">${data.date}</span>`);
//     }

//     const headerHtml = `
//     <div class="receipt-header">
//         ${fields.join('')}
//     </div>
//     `;

//     const vendorHtml = data.vendor ? `<div class="vendor">${data.vendor}</div>` : '';

//     const totalHtml = data.total ? `<p><strong>Total:</strong> ₹${data.total}</p>` : '';

//     const itemsContainerHtml = itemsHtml
//     ? `<p><strong>Items:</strong></p><div class="items-container">${itemsHtml}</div>`
//     : '';

//     const saveBtnHtml = data.saveUrl
//     ? `<a href="${data.saveUrl}" target="_blank">
//         <img src="Images/wallet-button.png" alt="Save to Google Wallet" class="wallet-button-img" />
//       </a>`
//     : '';

//     // result.innerHTML = `
//     // <div class="receipt-card" onclick="toggleDetails(this)">
//     //     ${headerHtml}
//     //     ${vendorHtml}
//     //     <div class="receipt-details">
//     //     ${totalHtml}
//     //     ${itemsContainerHtml}
//     //     ${saveBtnHtml}
//     //     </div>
//     // </div>
//     // `;

//     const receiptHtml = document.createElement('div');
//     receiptHtml.classList.add('receipt-card');
//     receiptHtml.onclick = () => toggleDetails(receiptHtml);

//     receiptHtml.innerHTML = `
//       ${headerHtml}
//       ${vendorHtml}
//       <div class="receipt-details">
//         ${totalHtml}
//         ${itemsContainerHtml}
//         ${saveBtnHtml}
//       </div>
//     `;

//     // Append instead of replacing
//     result.appendChild(receiptHtml);

//     result.innerHTML = `
//     <div class="receipt-card" onclick="toggleDetails(this)">
//         <div class="receipt-header">
//         <span class="category">${data.category}</span>
//         <span class="date">${data.date || 'Unknown date'}</span>
//         </div>
//         <div class="vendor">${data.vendor}</div>
//         <div class="receipt-details">
//         <p><strong>Total:</strong> ₹${data.total}</p>
//         <p><strong>Items:</strong></p>
//         <ul>
//             ${data.items.map(i => `<li>${i.name}: ₹${i.price}</li>`).join('')}
//         </ul>
//         <a href="${data.saveUrl}" target="_blank"><button>Save to Google Wallet</button></a>
//         </div>
//     </div>
//     `;
//     result.innerHTML = `
//     <div class="receipt-card" onclick="toggleDetails(this)">
//         <div class="receipt-header">
//         <span class="category">${data.category}</span>
//         ${dateHtml}
//         </div>
//         <div class="vendor">${data.vendor}</div>
//         <div class="receipt-details">
//         <p><strong>Total:</strong> ₹${data.total}</p>
//         <p><strong>Items:</strong></p>
//         <div class="items-container">
//             ${itemsHtml}
//         </div>
//         <a href="${data.saveUrl}" target="_blank"><button>Save to Google Wallet</button></a>
//         </div>
//     </div>
//     `;
// }


// let itemsHtml = data.items.map(i => `
//   <div class="item-row">
//     <span class="item-name">${i.name}</span>
//     <span class="item-price">₹${i.price}</span>
//   </div>
// `).join('');

async function uploadImage() {
  const input = document.getElementById('imageUpload');
  const result = document.getElementById('result');
  const loading = document.getElementById('loading');

  if (input.files.length === 0) {
    alert("Please upload an image");
    return;
  }

  loading.style.display = 'block';

  const formData = new FormData();
  formData.append('image', input.files[0]);

  try {
    const response = await fetch('/process', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    loading.style.display = 'none';

    let itemsHtml = '';
    if (Array.isArray(data.items) && data.items.length > 0) {
      itemsHtml = data.items.map(i => `
        <div class="item-row">
          <span class="item-name">${i.name}</span>
          <span class="item-price">₹${i.price}</span>
        </div>
      `).join('');
    }

    const fields = [];
    if (data.category) {
      fields.push(`<span class="category">${data.category}</span>`);
    }
    if (data.date) {
      fields.push(`<span class="date">${data.date}</span>`);
    }

    const headerHtml = `
      <div class="receipt-header">
        ${fields.join('')}
      </div>
    `;
    const vendorHtml = data.vendor ? `<div class="vendor">${data.vendor}</div>` : '';
    const totalHtml = data.total ? `<p><strong>Total:</strong> ₹${data.total}</p>` : '';
    const itemsContainerHtml = itemsHtml ? `<p><strong>Items:</strong></p><div class="items-container">${itemsHtml}</div>` : '';
    // const saveBtnHtml = data.saveUrl ? `<a href="${data.saveUrl}" target="_blank"><button>Save to Google Wallet</button></a>` : '';

    const saveBtnHtml = data.saveUrl
    ? `<a href="${data.saveUrl}" target="_blank">
        <img src="Images/wallet-button.png" alt="Save to Google Wallet" class="wallet-button-img" />
      </a>`
    : '';

    // Create a new receipt card
    const receiptCard = document.createElement('div');
    receiptCard.classList.add('receipt-card');
    receiptCard.onclick = () => toggleDetails(receiptCard);

    receiptCard.innerHTML = `
      ${headerHtml}
      ${vendorHtml}
      <div class="receipt-details">
        ${totalHtml}
        ${itemsContainerHtml}
        ${saveBtnHtml}
      </div>
    `;

    result.appendChild(receiptCard);  // 👈 Append to result div

  } catch (err) {
    loading.style.display = 'none';
    alert("Error uploading or processing image.");
    console.error(err);
  }
}

function toggleDetails(card) {
  card.classList.toggle('expanded');
}

async function askAssistant() {
  const question = document.getElementById('userQuery').value;
  const responseEl = document.getElementById('assistantResponse');
  const language = document.getElementById('language').value;

  if (!question.trim()) {
    alert("Please enter a question.");
    return;
  }

  responseEl.textContent = "Thinking...";

  try {
    const res = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, language })
    });

    const data = await res.json();
    responseEl.textContent = data.answer || "No answer returned.";
  } catch (err) {
    console.error(err);
    responseEl.textContent = "Something went wrong.";
  }
}



// async function uploadImage() {
//   const input = document.getElementById('imageUpload');
//   const result = document.getElementById('result');
//   const loading = document.getElementById('loading');
//   const uploadBtn = document.getElementById('uploadBtn');

//   if (input.files.length === 0) {
//     alert("Please upload an image");
//     return;
//   }

//   loading.style.display = 'block';

//   const formData = new FormData();
//   formData.append('image', input.files[0]);

//   try {
//     const response = await fetch('/process', {
//       method: 'POST',
//       body: formData
//     });

//     const data = await response.json();
//     loading.style.display = 'none';

//     // ✅ Gemini notification display
//     const notificationEl = document.getElementById('notification');
//     if (data.notification) {
//       notificationEl.textContent = data.notification;
//       notificationEl.style.display = 'block';
//     } else {
//       notificationEl.style.display = 'none';
//     }

//     // Build receipt UI
//     let itemsHtml = '';
//     if (Array.isArray(data.items) && data.items.length > 0) {
//       itemsHtml = data.items.map(i => `
//         <div class="item-row">
//           <span class="item-name">${i.name}</span>
//           <span class="item-price">₹${i.price}</span>
//         </div>
//       `).join('');
//     }

//     const fields = [];
//     if (data.category) {
//       fields.push(`<span class="category">${data.category}</span>`);
//     }
//     if (data.date) {
//       fields.push(`<span class="date">${data.date}</span>`);
//     }

//     const headerHtml = `
//       <div class="receipt-header">
//         ${fields.join('')}
//       </div>
//     `;
//     const vendorHtml = data.vendor ? `<div class="vendor">${data.vendor}</div>` : '';
//     const totalHtml = data.total ? `<p><strong>Total:</strong> ₹${data.total}</p>` : '';
//     const itemsContainerHtml = itemsHtml ? `<p><strong>Items:</strong></p><div class="items-container">${itemsHtml}</div>` : '';
//     const saveBtnHtml = data.saveUrl
//       ? `<a href="${data.saveUrl}" target="_blank">
//           <img src="Images/wallet-button.png" alt="Save to Google Wallet" class="wallet-button-img" />
//         </a>`
//       : '';

//     // Create a new receipt card
//     const receiptCard = document.createElement('div');
//     receiptCard.classList.add('receipt-card');
//     receiptCard.onclick = () => toggleDetails(receiptCard);

//     receiptCard.innerHTML = `
//       ${headerHtml}
//       ${vendorHtml}
//       <div class="receipt-details">
//         ${totalHtml}
//         ${itemsContainerHtml}
//         ${saveBtnHtml}
//       </div>
//     `;

//     result.appendChild(receiptCard);  // 👈 Append to result div

//   } catch (err) {
//     loading.style.display = 'none';
//     alert("Error uploading or processing image.");
//     console.error(err);
//   }
// }

// function toggleDetails(card) {
//   card.classList.toggle('expanded');
// }

// async function askAssistant() {
//   const question = document.getElementById('userQuery').value;
//   const responseEl = document.getElementById('assistantResponse');
//   const language = document.getElementById('language').value;

//   if (!question.trim()) {
//     alert("Please enter a question.");
//     return;
//   }

//   responseEl.textContent = "Thinking...";

//   try {
//     const res = await fetch('/ask', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ question, language })
//     });

//     const data = await res.json();
//     responseEl.textContent = data.answer || "No answer returned.";
//   } catch (err) {
//     console.error(err);
//     responseEl.textContent = "Something went wrong.";
//   }
// }

// async function uploadImage() {
//   const input = document.getElementById('imageUpload');
//   const result = document.getElementById('result');
//   const loading = document.getElementById('loading');

//   if (input.files.length === 0) {
//     alert("Please upload an image");
//     return;
//   }

//   loading.style.display = 'block';

//   const formData = new FormData();
//   formData.append('image', input.files[0]);

//   try {
//     const response = await fetch('/process', {
//       method: 'POST',
//       body: formData
//     });

//     const data = await response.json(); // ✅ Moved here after fetch

//     loading.style.display = 'none';

//     // ✅ Gemini notification display
//     const notificationEl = document.getElementById('notification');
//     if (data.notification) {
//       notificationEl.textContent = data.notification;
//       notificationEl.style.display = 'block';
//     } else {
//       notificationEl.style.display = 'none';
//     }

//     // Build receipt UI
//     let itemsHtml = '';
//     if (Array.isArray(data.items) && data.items.length > 0) {
//       itemsHtml = data.items.map(i => `
//         <div class="item-row">
//           <span class="item-name">${i.name}</span>
//           <span class="item-price">₹${i.price}</span>
//         </div>
//       `).join('');
//     }

//     const fields = [];
//     if (data.category) {
//       fields.push(`<span class="category">${data.category}</span>`);
//     }
//     if (data.date) {
//       fields.push(`<span class="date">${data.date}</span>`);
//     }

//     const headerHtml = `
//       <div class="receipt-header">
//         ${fields.join('')}
//       </div>
//     `;
//     const vendorHtml = data.vendor ? `<div class="vendor">${data.vendor}</div>` : '';
//     const totalHtml = data.total ? `<p><strong>Total:</strong> ₹${data.total}</p>` : '';
//     const itemsContainerHtml = itemsHtml ? `<p><strong>Items:</strong></p><div class="items-container">${itemsHtml}</div>` : '';
//     const saveBtnHtml = data.saveUrl
//       ? `<a href="${data.saveUrl}" target="_blank">
//           <img src="Images/wallet-button.png" alt="Save to Google Wallet" class="wallet-button-img" />
//         </a>`
//       : '';

//     const receiptCard = document.createElement('div');
//     receiptCard.classList.add('receipt-card');
//     receiptCard.onclick = () => toggleDetails(receiptCard);

//     receiptCard.innerHTML = `
//       ${headerHtml}
//       ${vendorHtml}
//       <div class="receipt-details">
//         ${totalHtml}
//         ${itemsContainerHtml}
//         ${saveBtnHtml}
//       </div>
//     `;

//     result.appendChild(receiptCard);
//   } catch (err) {
//     loading.style.display = 'none';
//     alert("Error uploading or processing image.");
//     console.error(err);
//   }
// }


// async function uploadImage() {
//   const input = document.getElementById('imageUpload');
//   const result = document.getElementById('result');
//   const loading = document.getElementById('loading');

//   if (input.files.length === 0) {
//     alert("Please upload an image");
//     return;
//   }

//   loading.style.display = 'block';
//   result.textContent = '';

//   // loading.style.display = 'block';

//   const formData = new FormData();
//   formData.append('image', input.files[0]);

//   try {
//     const response = await fetch('/process', {
//       method: 'POST',
//       body: formData
//     });

//     const data = await response.json();
//     // console.log("✅ Received API response:", data); // DEBUG LINE

//     loading.style.display = 'none';

//     // ✅ Display Gemini notification (with fallback text)
//     const notificationEl = document.getElementById('notification');
//     if (data.notification) {
//       // console.log("✅ Notification from Gemini:", data.notification); // DEBUG LINE
//       notificationEl.textContent = data.notification;
//       notificationEl.style.display = 'block';
//     } else {
//       // console.log("⚠️ No notification found, showing fallback");
//       //notificationEl.textContent = "📝 No notification received.";
//       //notificationEl.style.display = 'block';
//     }

//     // Build receipt card
//     let itemsHtml = '';
//     if (Array.isArray(data.items) && data.items.length > 0) {
//       itemsHtml = data.items.map(i => `
//         <div class="item-row">
//           <span class="item-name">${i.name}</span>
//           <span class="item-price">₹${i.price}</span>
//         </div>
//       `).join('');
//     }

//     const fields = [];
//     if (data.category) {
//       fields.push(`<span class="category">${data.category}</span>`);
//     }
//     if (data.date) {
//       fields.push(`<span class="date">${data.date}</span>`);
//     }

//     const headerHtml = `
//       <div class="receipt-header">
//         ${fields.join('')}
//       </div>
//     `;
//     const vendorHtml = data.vendor ? `<div class="vendor">${data.vendor}</div>` : '';
//     const totalHtml = data.total ? `<p><strong>Total:</strong> ₹${data.total}</p>` : '';
//     const itemsContainerHtml = itemsHtml ? `<p><strong>Items:</strong></p><div class="items-container">${itemsHtml}</div>` : '';
//     const saveBtnHtml = data.saveUrl
//       ? `<a href="${data.saveUrl}" target="_blank">
//           <img src="Images/wallet-button.png" alt="Save to Google Wallet" class="wallet-button-img" />
//         </a>`
//       : '';

//     const receiptCard = document.createElement('div');
//     receiptCard.classList.add('receipt-card');
//     receiptCard.onclick = () => toggleDetails(receiptCard);

//     receiptCard.innerHTML = `
//       ${headerHtml}
//       ${vendorHtml}
//       <div class="receipt-details">
//         ${totalHtml}
//         ${itemsContainerHtml}
//         ${saveBtnHtml}
//       </div>
//     `;

//     result.appendChild(receiptCard);
//   } catch (err) {
//     loading.style.display = 'none';
//     alert("Error uploading or processing image.");
//     console.error(err);
//   }
// }


