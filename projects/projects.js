import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

(async () => {
const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const title_element = document.querySelector('.projects-title');
if (title_element && projects) {
    title_element.textContent = `${projects.length} Projects`;
}
})();


let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let projects = await fetchJSON('../lib/projects.json'); // fetch your project data
let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});


let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach((arc, idx) => {
    // TODO, fill in step for appending path to svg using D3
    d3.select('svg').append('path').attr('d', arc).attr('fill', colors(idx))
  });

let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('class', 'legend-item')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});

const projectsContainer = document.querySelector('.projects');

let query = '';
let searchInput = document.querySelector('.searchBar');

function setQuery(query) {
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());});}



// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return {value: count, label: year}; // TODO
  });
  // re-calculate slice generator, arc data, arc, etc.
  let newSliceGenerator = d3.pie().value((d) => d.value);;
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));
  // TODO: clear up paths and legends
  let newSVG = d3.select('svg');
  newSVG.selectAll('path').remove();
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();
  // update paths and legends, refer to steps 1.4 and 2.2
  newArcs.forEach((arc, idx) => {
    newSVG.append('path').attr('d', arc).attr('fill', colors(idx))
  });

  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
  });
  data = newData;
  arcs = newArcs;
}

// Call this function on page load
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  selectedIndex = -1;
  query = event.target.value;
  let filteredProjects = setQuery(event.target.value);
  // re-render legends and pie chart when event triggers
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});



let selectedIndex = -1;
let svg = d3.select('svg');
svg.selectAll('path').remove();
arcs.forEach((arc, i) => {
  svg
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(i))
    .on('click', () => {
      selectedIndex = selectedIndex === i ? -1 : i;
    
      svg
        .selectAll('path')
        .attr('class', (_, idx) => (
          // TODO: filter idx to find correct pie slice and apply CSS from above
          selectedIndex === -1
          ? ''
          : (idx === selectedIndex ? 'selected' : 'dimmed')
      ));
      legend
        .selectAll('li')
        .attr('class', (_, idx) => (
          // TODO: filter idx to find correct legend and apply CSS from above
          selectedIndex === -1
          ? ''
          : (idx === selectedIndex ? 'selected' : 'dimmed')
      ));
      if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2');
      } else {
        // TODO: filter projects and project them onto webpage
        // Hint: `.label` might be useful
        let selectedYear = data[selectedIndex].label;
        let filteredProjects = projects.filter((project) => {
          let values = Object.values(project).join('\n').toLowerCase();
          let matchesQuery = values.includes(query.toLowerCase());
          let matchesYear = selectedIndex === -1 || project.year.toString() === data[selectedIndex].label.toString();
          return matchesQuery && matchesYear;
        });
        
        renderProjects(filteredProjects, projectsContainer, 'h2');
      }
    });
});