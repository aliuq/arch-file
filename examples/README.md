# Examples

+ `assets` is an example of a directory that contains assets.
+ `basic` is an example of a directory that contains some basic usage.
+ `pkg` is an example of options in package.json file.
+ `suziprc` is an example of options in `.suziprc.json` file.

Basic

```json
"scripts": {
 "dev": "suzip -h",
 "zip": "suzip -s ../assets -o ./.output/dist.zip",
 "tar": "suzip -s ../assets -o ./.output/dist.tar",
 "tar:gz": "suzip -s ../assets -o ./.output/dist.tar.gz",
 "zip:2": "suzip -s ../assets -p **/*.md -o ./.output/dist_md.zip",
 "zip:3": "suzip -s ../assets -i **/*.js -o ./.output/dist_ignore_js.zip",
 "zip:4": "esno src/main.ts"
}
```

```bash
# pnpm -F basic [Script Name]

pnpm -F basic dev
```

pkg

```bash
pnpm -F pkg zip
```

suziprc

```bash
pnpm -F suziprc zip
```
