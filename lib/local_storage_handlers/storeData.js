export default function storeData(arr) {
  localStorage.setItem("data", JSON.stringify(arr));
}
