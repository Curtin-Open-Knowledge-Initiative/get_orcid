# get_orcid

Given a set of ORCID ids, get publications. You'll need [NodeJS](https://nodejs.org/en/download/).

```bash
# install
git clone https://github.com/Curtin-Open-Knowledge-Initiative/get_orcid.git && cd get_orcid

# test / example
node --experimental-fetch index.js ./data/test.txt ./data

# or
npm run test

# usage
node --experimental-fetch index.js <input_file> <output_dir>
```

The `<input_file>` must be a simple text file with a list of ORCID ids, eg:

```text
0000-0002-0783-1371
0000-0001-6243-4267
0000-0003-3460-4200
```

The `<output_dir>` must be an existing directory. The following files will be written into it:

```text
works.csv
works.html
works.json
works.jsonl
works2.html
```

The `--experimental-fetch` flag is required until `fetch()` becomes standard.

Any issues, reach me at <julian.tonti-filippini@curtin.edu.au>
