const petitionElement = document.getElementById('petitionInput');
const errElement = document.getElementById('err');
petitionElement.onkeyup = () => {
  if (petitionElement.value.match(/https|petition|parliament/)) {
    const url = new URL(petitionElement.value);
    console.log(url);
    if (!url.pathname.includes('.json')) petitionElement.value += '.json'
    makeRequest(petitionElement.value)
      .then(res => {

        res === 'err' ? errElement.style.display = 'inherit' : errElement.style.display = 'none';
      })
  } else if (petitionElement.value === '') {
    errElement.style.display = 'none';
  } else {
    errElement.style.display = 'inherit';
  }

}
const randCol = () => Math.floor(Math.random() * 255);
const generateRGB = () => `rgba(${randCol()}, ${randCol()}, ${randCol()}, 0.2)`;
const ctx = document.getElementById('myChart');
const makeRequest = (url) => {
  return fetch(url)
    .then(res => res.json())
    .then(({ data: { attributes } }) => {
      const { signatures_by_constituency } = attributes
      const sorted = signatures_by_constituency.sort((a, b) => b.signature_count - a.signature_count)
      const first25 = sorted.filter((e, i) => i < 50);
      const { backgroundColor, borderColor } = first25.reduce((prev, curr) => {
        const randCol1 = randCol();
        const randCol2 = randCol();
        const randCol3 = randCol();
        prev.backgroundColor.push(`rgba(${randCol1}, ${randCol2}, ${randCol3}, 0.2)`);
        prev.borderColor.push(`rgba(${randCol1}, ${randCol2}, ${randCol3}, 1)`);
        return prev;

      }, { backgroundColor: [], borderColor: [] });
      const myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: first25.map(({ name }) => name),
          datasets: [{
            label: 'Signatures by constituency',
            data: first25.map(({ signature_count }) => signature_count),
            backgroundColor,
            borderColor,
            borderWidth: 1
          }]
        },
        options: {
          title: {
            display: true,
            text: `${attributes.action.trim()} Total signatures: ${attributes.signature_count}`
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          },
          responsive: true
        }
      });
      return 'done'
    })
    .catch(e => { return 'err'; console.log(e) })
}
makeRequest('https://petition.parliament.uk/petitions/272087.json');