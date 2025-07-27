function build() {
  const prompt = document.getElementById("prompt").value;
  document.getElementById("result").innerHTML = `
    <p>Din prompt:</p><pre>${prompt}</pre>
    <p>Build igangsat... push den til GitHub for automatisk IPA-generation.</p>
  `;
}