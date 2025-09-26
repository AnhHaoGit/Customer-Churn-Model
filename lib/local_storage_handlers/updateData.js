export default function updateData(upload) {
  if (!upload) return;

  const existing = localStorage.getItem("data");
  let arr = [];

  if (existing) {
    try {
      arr = JSON.parse(existing);
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }
  }

  arr.push(upload);

  // Ghi lại vào localStorage
  localStorage.setItem("data", JSON.stringify(arr));
}
