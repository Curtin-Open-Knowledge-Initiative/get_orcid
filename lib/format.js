/*
## Summary
Given ORCIDs, fetch publications.

## Description
This is a common request from clients: given a set of people (identified by ORCID), fetch lists of their publications to be displayed on a website or entered into a spreadsheet. This routine will look up the IDs and build publications in various formats (HTML, JSON, JSONL, CSV).

see: https://orcid.org/

## Contacts
julian.tonti-filippini@curtin.edu.au
*/
const fs = require('fs');
const { resolve } = require('path');
const { execSync } = require('node:child_process');
const fetch_orcids = require('./fetch');

function load(ifile='orcids.txt') {
  return fs.readFileSync(resolve(ifile)).toString('utf8').trim().split("\n").map(v => v.trim()).filter(v => v);
}
function save(records=[], odir='data') {
  write_csv  (records, resolve(odir,'works.csv'  ));
  write_html (records, resolve(odir,'works.html' ));
  write_json (records, resolve(odir,'works.json' ));
  write_jsonl(records, resolve(odir,'works.jsonl'));
  write_html_sortable (records, resolve(odir,'works2.html' ));
}
function push(idir='data',cloud='your-bucket') {
  execSync(`gsutil cp ${path.resolve(idir)}/works* gs://${cloud}/`);
}
function open(ofile) {
  execSync(`open ${ofile}`);
}
async function compile({ ifile='orcids.txt', odir='./.data' }) {
  ifile = resolve(ifile);
  odir = resolve(odir);
  const orcids = load(ifile);
  const records = await fetch_orcids(orcids);
  save(records,odir);
  open(`${odir}/works.html`);
}
function sort_names(d) {
  return d.sort((a,b) => {
    const na = a.name.family_name + a.name.first_names;
    const nb = b.name.family_name + b.name.first_names;
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
  });
}
function sort_works(d) {
  return d.sort((a,b) => b.date - a.date);
}
function flatten(records=[]) {
  const flat = [];
  console.log(records);
  for (let record of records) {
    if (record.works.length == 0) {
      flat.push({
        orcid   : record.orcid,
        found   : record.found,
        given   : record.name.given_names,
        family  : record.name.family_name,
        doi     : '',
        eid     : '',
        type    : '',
        year    : '',
        journal : '',
        title   : '',
        link    : ''
      });
    }
    else {
      for (let work of record.works) {
        flat.push({
          orcid   : record.orcid,
          found   : record.found,
          given   : record.name.given_names,
          family  : record.name.family_name,
          doi     : work.doi     ?? '',
          eid     : work.eid     ?? '',
          type    : work.type    ?? '',
          year    : work.date    ?? '',
          journal : work.journal ?? '',
          title   : work.title   ?? '',
          link    : work.link    ?? '',
        });
      }
    }
  }
  return flat;
}
function write_csv(data={}, ofile='data/publications.csv') {
  const table = flatten(data);
  const lines = [JSON.stringify(Object.keys(table[0]))];
  for (let row of table) {
    lines.push(JSON.stringify(Object.values(row)));
  }
  fs.writeFileSync(ofile, lines.map(v => v.substring(1,v.length-1)).join("\n"));
}
function write_html(data={},ofile='data/publications.html') {
  fs.writeFileSync(
    ofile, 
    `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <h1>Staff Publications</h1>
        
        <div>
          Formats: 
          <a href='./works.csv'>CSV</a> | 
          <a href='./works.html'>HTML</a> | 
          <a href='./works2.html'>HTML2</a> | 
          <a href='./works.json'>JSON</a> | 
          <a href='./works.jsonl'>JSON-L</a>
        </div>
        
        <hr />

        ${sort_names(data).map(person => `
          <details>
            <summary>
${person.name.family_name}, ${person.name.given_names} (<a href='${person.orcid}'>ORCID</a>)
            </summary>
            <div>
              <div>${person.works.length} works listed in ORCID</div>
              <ul>
${sort_works(person.works).map(work => `<li>${work.date} - ${work.link ? `<a href='${work.link}'>${work.title}</a>` : work.title} [${work.type || 'work'}]</li>`).join("\n")}
              </ul>
            </div>
          </details>
        `).join("\n")}
      </body>
    </html>`
  );
}
function write_html_sortable(data=[],ofile='data/publications_sortable.html') {
  const table = flatten(data).map(v => ({
    name  : `<a href='${v.orcid}'>${v.family}, ${v.given}</a>`,
    year  : v.year,
    title : `<a href='${v.link}'>${v.title}</a>`,
    type  : v.type,
  }));
  fs.writeFileSync(
    ofile, 
    `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <script src="https://cdn.jsdelivr.net/gh/tofsjonas/sortable/sortable.min.js"></script>
        <link href="https://cdn.jsdelivr.net/gh/tofsjonas/sortable/sortable.min.css" rel="stylesheet" />      
      </head>
      <body>
        <h1>Staff Publications</h1>
        
        <div>
          Formats: 
          <a href='./works.csv'>CSV</a> | 
          <a href='./works.html'>HTML</a> | 
          <a href='./works2.html'>HTML2</a> | 
          <a href='./works.json'>JSON</a> | 
          <a href='./works.jsonl'>JSON-L</a>
        </div>
        <hr />

        <table class="sortable">
        <thead>
          <tr>${Object.keys(table[0]).map(v => `
            <th>${v}</th>`).join('')}
          </tr>
        </thead>
        <tbody>${table.map(o => `
          <tr>${Object.values(o).map(v => `
            <td>${v}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
        </table>
      </body>
    </html>
  `);
}
function write_json(data={},ofile='data/publications.json') {
  fs.writeFileSync(ofile, JSON.stringify(data,null,2));
}
function write_jsonl(data={}, ofile='data/publications.jsonl') {
  fs.writeFileSync(ofile, data.map(v => JSON.stringify(v)).join("\n"));
}
module.exports = {
  load,
  fetch_orcids,
  flatten,
  save,
  push,
  compile
};

if (require.main === module) {
  async function test() {
    const odir = `${__dirname}/../data`;
    const ifile = `${odir}/test.txt`;
    compile({ifile,odir});
  }
  test();
}
