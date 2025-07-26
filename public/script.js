async function uploadImage() {
  const input = document.getElementById('imageUpload');
  const result = document.getElementById('result');
  const loading = document.getElementById('loading');

  if (input.files.length === 0) {
    alert("Please upload an image");
    return;
  }

  loading.style.display = 'block';
  result.textContent = '';

  const formData = new FormData();
  formData.append('image', input.files[0]);

  const response = await fetch('/process', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  loading.style.display = 'none';

//   result.textContent = `Category: ${data.category}\n\nExtracted Text:\n${data.text}`;
    result.textContent =
    `Category: ${data.category}\n` +
    `Vendor: ${data.vendor}\n` +
    `Date: ${data.date}\n` +
    `Total: ₹${data.total}\n\n` +
    `Items:\n` +
    data.items.map(i => `- ${i.name}: ₹${i.price}`).join('\n');
}
