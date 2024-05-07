# get_orcid

Given a set of ORCID ids, get publications. You'll need [NodeJS](https://nodejs.org/en/download/) >= 18. There are no other dependencies to install.

```bash
# install
git clone https://github.com/Curtin-Open-Knowledge-Initiative/get_orcid.git && cd get_orcid

# test / example
npm run test

# usage
node . <input_file> <output_dir>
```

The `<input_file>` must be a text file with one ORCID id per line:

```text
0000-0002-0783-1371
0000-0001-6243-4267
0000-0003-3460-4200
```

The `<output_dir>` must be an existing directory. The following files will be written into it:

```bash
works.csv   # data in CSV format. One work per line
works.json  # data as a single JSON object
works.jsonl # one record per line. Each record is a JSON string.
works.html  # a minimal HTML formatted list of works (hyperlinked to sources)
works2.html # a slightly more advanced HTML page of works
```
