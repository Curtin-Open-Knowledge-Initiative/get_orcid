/*
## Summary
Extract data (by orcid_id) from the ORCID API

## Description
see: https://orcid.org/

## Contacts
julian.tonti@gmail.com
*/

// ensure that the items in an array are unique
function unique(arr) {
  const set = new Set();
  arr.forEach(v => set.add(JSON.stringify(v)));
  return Array.from(set).sort().map(s => JSON.parse(s));
}

// download a full ORCID record
async function orcid_fetch(id='0000-0000-0000-0000') {
  const res = await fetch(`https://orcid.org/${id}`, { method : 'GET', headers : { 'Accept' : 'application/json' }});
  return extract(await res.json());
}

async function fetch_many(ids=[]) {
  if (typeof ids === 'string') ids = [ids];
  const records = [];
  for (let id of ids) {
    records.push(await fetch_one(id));
  }
  return records;
}
async function fetch_one(id='0000-0000-0000-0000') {
  const res = await fetch(`https://orcid.org/${id}`, { method : 'GET', headers : { 'Accept' : 'application/json' }});
  const rec = extract(await res.json());
  return {
    orcid : id,
    found : rec.id.orcid_id != '',
    name  : rec.id,
    works : rec.publications,
    employers : rec.employers,
    qualifications : rec.qualifications
  };
}

// from a full ORCID record, extract basic information, affiliations and publications
function extract(record) {
  return {
    id             : extract_id(record),
    employers      : extract_employers(record),
    qualifications : extract_qualifications(record),
    publications   : extract_publications(record),
  };
}

// from a full ORCID record, extract basic id information
function extract_id(record) {
  return {
    orcid_id    : record?.['orcid-identifier']?.path ?? '',
    given_names : record?.person?.name?.['given-names']?.value ?? '',
    family_name : record?.person?.name?.['family-name']?.value ?? '',
  };
}

// from a full ORCID record, extract institutions where the person was employed
function extract_employers(record) {
  const items = [];
  record?.['activities-summary']?.employments?.['affiliation-group'].forEach(w => {
    w?.['summaries']?.forEach(s => {
      items.push({
        name     : s?.['employment-summary']?.organization?.name ?? '',
        code_src : s?.['employment-summary']?.organization?.["disambiguated-organization"]?.["disambiguation-source"] ?? '',
        code_val : s?.['employment-summary']?.organization?.["disambiguated-organization"]?.["disambiguated-organization-identifier"] ?? '',
      });
    });
  });
  return unique(items);
}

// from a full ORCID record, extract institutions where the person was employed
function extract_qualifications(record) {
  const items = [];
  record?.['activities-summary']?.qualifications?.['affiliation-group'].forEach(w => {
    w?.['summaries']?.forEach(s => {
      items.push({
        name     : s?.['qualification-summary']?.organization?.name ?? '',
        code_src : s?.['qualification-summary']?.organization?.["disambiguated-organization"]?.["disambiguation-source"] ?? '',
        code_val : s?.['qualification-summary']?.organization?.["disambiguated-organization"]?.["disambiguated-organization-identifier"] ?? '',
      });
    });
  });
  return unique(items);
}

// from a full ORCID record, extract the publications
function extract_publications(record) {
  const items = [];
  record?.['activities-summary']?.works?.group.forEach(w => {
    const s = w?.['work-summary']?.[0]; // this array contains multiple entries for the same DOI. The first one is the preferred one.
    if (s) {
      const item = {
        doi     : '',
        eid     : '',
        type    : s?.type ?? '',
        date    : s?.['publication-date']?.year?.value ?? '',
        journal : s?.['journal-title']?.value ?? '',
        title   : s?.title?.title?.value ?? '',
        url     : s?.url?.value ?? '',
        link    : '',
      };
      s['external-ids']?.['external-id']?.forEach(s => {
        const key = s?.['external-id-type']  ?? '';
        const val = s?.['external-id-value'] ?? '';
        if (key == 'doi') item.doi = `https://www.doi.org/${val}`;
        if (key == 'eid') item.eid = val;
      });
      item.link = item.doi || item.url || '';
      items.push(item);
    }
  });
  return unique(items);
}
module.exports = fetch_many;