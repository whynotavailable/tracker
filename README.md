# Tracker

## Folder structure

By default, reports will only work on the working directory.
Giving a start data will allow it to read from archive.

calling `tracker archive` will archive any file that isn't the current file.

calling `tracker current` will return the current file's location.
It'll also create it if it does not exist. So you can do things like
`open -e $(tracker current)` and it'll open the file for editing.

The archive structure will look like ./${year}/${month}/*.txt

## regexes

```
regex for segment
/^[0-9]{1,2}:[0-9]{1,2}( am)? -( [0-9]{1,2}:[0-9]{1,2}( am)?)?$/i

regex for time
/^> [0-9]{1,2}:[0-9]{1,2}( am)?$/i
```

segments are split with `---`.

tags are defined as `/#[a-z]/i`
